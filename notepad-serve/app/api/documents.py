from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse
from app.services import DocumentService
from app.document_processing import DocumentLoader, TextSplitter
from app.vectorstore import VectorStore
from app.chains import RAGChain
from app.config import DOCUMENTS_DIR, DB_CONFIG
import os
import uuid
import logging

router = APIRouter(prefix="/documents", tags=["知识库"])
logger = logging.getLogger(__name__)

# 全局实例
vectorstore = VectorStore()
rag_chain = RAGChain(vectorstore)





@router.get("/", response_model=list[DocumentListResponse])
def get_all_documents(db: Session = Depends(get_db)):
    """获取所有文档"""
    return DocumentService.get_all(db)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    """获取单个文档"""
    doc = DocumentService.get_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


@router.post("/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上传文档"""
    # 检查文件类型
    file_ext = os.path.splitext(file.filename)[1].lower()
    if not DocumentLoader.is_supported(f"test{file_ext}"):
        raise HTTPException(status_code=400, detail=f"不支持的文件类型: {file_ext}")
    
    # 保存文件
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(DOCUMENTS_DIR, unique_filename)
    
    # 确保目录存在
    os.makedirs(DOCUMENTS_DIR, exist_ok=True)
    
    # 读取并保存文件
    logger.info(f"Uploading file: {file.filename}, content_type: {file.content_type}")
    
    try:
        await file.seek(0)
        content_bytes = await file.read()
        logger.info(f"File read successfully, size: {len(content_bytes)} bytes")
    except Exception as e:
        logger.error(f"Failed to read file: {e}")
        raise HTTPException(status_code=500, detail=f"读取文件失败: {e}")
    
    if len(content_bytes) == 0:
        raise HTTPException(status_code=400, detail="上传的文件为空")
    
    try:
        with open(file_path, "wb") as f:
            f.write(content_bytes)
        logger.info(f"File saved to: {file_path}")
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail=f"保存文件失败: {e}")
    
    # 提取内容
    content = ""
    try:
        docs = DocumentLoader.load(file_path)
        content = "\n".join([doc.page_content for doc in docs])
        logger.info(f"Document content extracted, length: {len(content)}")
    except Exception as e:
        logger.error(f"文档加载失败: {e}")
    
    # 创建文档记录 - 保存完整的文档内容
    doc_data = DocumentCreate(
        name=file.filename,
        file_path=file_path,
        file_type=file_ext,
        file_size=len(content_bytes),
        content=content if content else None
    )
    doc = DocumentService.create(db, doc_data)
    logger.info(f"Document created with id: {doc.id}")
    
    # 同步处理向量化（可靠方式）
    try:
        logger.info(f"开始处理文档 {doc.id} 的向量化")
        
        if DocumentLoader.is_supported(file_path):
            raw_docs = DocumentLoader.load(file_path)
            logger.info(f"文档 {doc.id}: 文档加载完成，共 {len(raw_docs)} 页")
            
            splitter = TextSplitter()
            chunks = splitter.split(raw_docs)
            logger.info(f"文档 {doc.id}: 文档分割完成，共 {len(chunks)} 个分块")
            
            for i, chunk in enumerate(chunks):
                chunk.metadata["doc_id"] = doc.id
                chunk.metadata["chunk_index"] = i
            
            chunk_ids = [f"doc_{doc.id}_chunk_{i}" for i in range(len(chunks))]
            
            logger.info(f"文档 {doc.id}: 开始向量化处理")
            rag_chain.add_documents(chunks, chunk_ids)
            logger.info(f"文档 {doc.id}: 向量化完成")
            
            doc.embedding_status = "done"
            doc.chunk_count = len(chunks)
            db.commit()
            logger.info(f"文档 {doc.id} 向量化完成，共 {len(chunks)} 个chunk")
        else:
            logger.error(f"文档 {doc.id}: 不支持的文件格式")
            doc.embedding_status = "failed"
            db.commit()
            
    except Exception as e:
        logger.error(f"文档 {doc.id} 向量化失败: {str(e)}", exc_info=True)
        doc.embedding_status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"向量化处理失败: {str(e)}")
    
    db.refresh(doc)
    return doc


@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(doc_id: int, doc_data: DocumentUpdate, db: Session = Depends(get_db)):
    """更新文档"""
    doc = DocumentService.update(db, doc_id, doc_data)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    return doc


@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    """删除文档"""
    doc = DocumentService.get_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="文档不存在")
    
    # 删除向量存储中的相关chunk
    try:
        chunk_ids = [f"doc_{doc_id}_chunk_{i}" for i in range(doc.chunk_count or 100)]
        rag_chain.delete_documents(chunk_ids)
        logger.info(f"已从 ChromaDB 删除文档 {doc_id} 的 {len(chunk_ids)} 个 chunk")
    except Exception as e:
        logger.warning(f"Failed to delete chunks for doc {doc_id}: {e}")
    
    # 删除文件
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            logger.warning(f"Failed to delete file {doc.file_path}: {e}")
    
    # 删除数据库记录
    DocumentService.delete(db, doc_id)
    return {"message": "文档已删除"}
