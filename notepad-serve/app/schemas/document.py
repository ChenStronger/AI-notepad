from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentBase(BaseModel):
    """文档基础 schema"""
    name: str


class DocumentCreate(DocumentBase):
    """创建文档"""
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    content: Optional[str] = None


class DocumentUpdate(BaseModel):
    """更新文档"""
    name: Optional[str] = None
    content: Optional[str] = None


class DocumentResponse(DocumentBase):
    """文档响应"""
    id: int
    file_path: Optional[str]
    file_type: Optional[str]
    file_size: Optional[int]
    content: Optional[str]
    embedding_status: str
    chunk_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """文档列表响应"""
    id: int
    name: str
    file_type: Optional[str]
    file_size: Optional[int]
    embedding_status: str
    created_at: datetime

    class Config:
        from_attributes = True
