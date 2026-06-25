from sqlalchemy import Column, BigInteger, String, Text, DateTime, JSON, Integer
from sqlalchemy.sql import func
from app.database.connection import Base


class Note(Base):
    """笔记表"""
    __tablename__ = "notes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Document(Base):
    """知识库文档表"""
    __tablename__ = "documents"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    file_path = Column(String(500))
    file_type = Column(String(50))
    file_size = Column(BigInteger)
    content = Column(Text)  # 使用 Text 类型，可以存储大量文本
    embedding_status = Column(String(20), default="pending")
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ChatHistory(Base):
    """问答历史表"""
    __tablename__ = "chat_history"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(100))
    question = Column(Text, nullable=False)
    answer = Column(Text)
    source_docs = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
