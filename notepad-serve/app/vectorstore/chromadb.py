from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from app.config import EMBEDDING_MODEL, PERSIST_DIRECTORY, OLLAMA_BASE_URL, CHROMA_DB_DIR
import os


class VectorStore:
    """向量存储"""

    def __init__(self):
        self.embeddings = OllamaEmbeddings(
            model=EMBEDDING_MODEL,
            base_url=OLLAMA_BASE_URL
        )
        self._vectorstore = None
        
        # 确保 ChromaDB 目录存在
        os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
        print(f"ChromaDB 目录: {PERSIST_DIRECTORY}")

    @property
    def vectorstore(self) -> Chroma:
        """获取向量存储实例"""
        if self._vectorstore is None:
            # 确保目录存在
            os.makedirs(PERSIST_DIRECTORY, exist_ok=True)
            
            self._vectorstore = Chroma(
                persist_directory=PERSIST_DIRECTORY,
                embedding_function=self.embeddings
            )
            print(f"ChromaDB 已初始化，文档数: {self._vectorstore._collection.count()}")
        return self._vectorstore

    def add_documents(self, documents: list, ids: list = None) -> list:
        """添加文档到向量存储"""
        result = self.vectorstore.add_documents(documents, ids=ids)
        # 显式持久化
        self.vectorstore.persist()
        print(f"已添加 {len(documents)} 个文档到 ChromaDB")
        return result

    def similarity_search(self, query: str, k: int = 4) -> list:
        """相似度搜索"""
        return self.vectorstore.similarity_search(query, k=k)

    def similarity_search_with_score(self, query: str, k: int = 4) -> list:
        """带分数的相似度搜索"""
        return self.vectorstore.similarity_search_with_score(query, k=k)

    def delete(self, ids: list = None) -> None:
        """删除文档"""
        if ids:
            self.vectorstore.delete(ids)
            self.vectorstore.persist()

    def get_by_id(self, doc_id: str) -> list:
        """根据ID获取文档"""
        return self.vectorstore.get(doc_id)
    
    def get_collection_count(self) -> int:
        """获取集合中的文档数量"""
        try:
            return self.vectorstore._collection.count()
        except:
            return 0
