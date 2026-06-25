from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NoteBase(BaseModel):
    """笔记基础 schema"""
    title: str
    content: Optional[str] = None


class NoteCreate(NoteBase):
    """创建笔记"""
    pass


class NoteUpdate(BaseModel):
    """更新笔记"""
    title: Optional[str] = None
    content: Optional[str] = None


class NoteResponse(NoteBase):
    """笔记响应"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
