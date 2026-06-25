from pydantic import BaseModel
from typing import Optional, List


class ChatRequest(BaseModel):
    """聊天请求"""
    question: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """聊天响应"""
    answer: str
    sources: Optional[List[dict]] = None
    session_id: str


class ChatHistoryResponse(BaseModel):
    """聊天历史响应"""
    id: int
    session_id: str
    question: str
    answer: Optional[str]
    source_docs: Optional[List[dict]]
    created_at: str

    class Config:
        from_attributes = True
