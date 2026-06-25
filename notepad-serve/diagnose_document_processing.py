import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Document
from app.document_processing import DocumentLoader, TextSplitter
from app.vectorstore import VectorStore
from app.chains import RAGChain

SessionLocal = sessionmaker(bind=engine)

def diagnose_document_processing():
    db = SessionLocal()
    
    try:
        stuck_docs = db.query(Document).filter(Document.embedding_status == "processing").all()
        
        if not stuck_docs:
            print("[OK] No processing documents found")
            return
        
        print(f"[INFO] Found {len(stuck_docs)} documents stuck in processing state:")
        for doc in stuck_docs:
            print(f"\n--- Document ID: {doc.id}, Name: {doc.name} ---")
            print(f"File Path: {doc.file_path}")
            print(f"File Type: {doc.file_type}")
            print(f"File Size: {doc.file_size} bytes")
            print(f"Created At: {doc.created_at}")
            
            if os.path.exists(doc.file_path):
                print("[OK] File exists")
                
                try:
                    print("[INFO] Trying to load document...")
                    raw_docs = DocumentLoader.load(doc.file_path)
                    print(f"[OK] Document loaded successfully, {len(raw_docs)} pages")
                    
                    print("[INFO] Trying to split document...")
                    splitter = TextSplitter()
                    chunks = splitter.split(raw_docs)
                    print(f"[OK] Document split successfully, {len(chunks)} chunks")
                    
                    print("[INFO] Checking Ollama connection...")
                    try:
                        vectorstore = VectorStore()
                        print(f"[OK] ChromaDB connected, current docs count: {vectorstore.get_collection_count()}")
                        
                        print("[INFO] Trying embedding...")
                        rag_chain = RAGChain(vectorstore)
                        chunk_ids = [f"doc_{doc.id}_chunk_{i}" for i in range(len(chunks))]
                        for i, chunk in enumerate(chunks):
                            chunk.metadata["doc_id"] = doc.id
                            chunk.metadata["chunk_index"] = i
                        
                        result = rag_chain.add_documents(chunks, chunk_ids)
                        print(f"[OK] Embedding successful, added {len(result)} documents")
                        
                        doc.embedding_status = "done"
                        doc.chunk_count = len(chunks)
                        db.commit()
                        print("[OK] Document status updated to done")
                        
                    except Exception as e:
                        print(f"[ERROR] Ollama/Embedding failed: {str(e)}")
                        doc.embedding_status = "failed"
                        db.commit()
                        
                except Exception as e:
                    print(f"[ERROR] Document load/split failed: {str(e)}")
                    doc.embedding_status = "failed"
                    db.commit()
            else:
                print("[ERROR] File does not exist")
                doc.embedding_status = "failed"
                db.commit()
                
    except Exception as e:
        print(f"[ERROR] Diagnosis error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    diagnose_document_processing()
