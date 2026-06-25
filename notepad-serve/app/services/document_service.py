from sqlalchemy.orm import Session
from app.database.models import Document
from app.schemas.document import DocumentCreate, DocumentUpdate
from app.config import DOCUMENTS_DIR
import shutil
import os


class DocumentService:
    """文档服务"""

    @staticmethod
    def get_all(db: Session) -> list[Document]:
        """获取所有文档"""
        return db.query(Document).order_by(Document.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, doc_id: int) -> Document | None:
        """根据ID获取文档"""
        return db.query(Document).filter(Document.id == doc_id).first()

    @staticmethod
    def create(db: Session, doc_data: DocumentCreate, file=None) -> Document:
        """创建文档"""
        doc = Document(**doc_data.model_dump())
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def update(db: Session, doc_id: int, doc_data: DocumentUpdate) -> Document | None:
        """更新文档"""
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return None
        update_data = doc_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(doc, key, value)
        db.commit()
        db.refresh(doc)
        return doc

    @staticmethod
    def delete(db: Session, doc_id: int) -> bool:
        """删除文档"""
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return False
        # 删除文件
        if doc.file_path and os.path.exists(doc.file_path):
            os.remove(doc.file_path)
        db.delete(doc)
        db.commit()
        return True

    @staticmethod
    def update_embedding_status(db: Session, doc_id: int, status: str, chunk_count: int = 0) -> None:
        """更新向量化状态"""
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.embedding_status = status
            doc.chunk_count = chunk_count
            db.commit()
