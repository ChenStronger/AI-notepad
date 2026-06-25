from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatRequest, ChatResponse, ChatHistoryResponse
from app.services import ChatService

router = APIRouter(prefix="/chat", tags=["智能问答"])

# ChatService 是轻量级的，可以每次请求创建
chat_service = ChatService()


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """智能问答"""
    result = chat_service.chat(db, request)
    return ChatResponse(**result)


@router.get("/history/{session_id}", response_model=list[ChatHistoryResponse])
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """获取聊天历史"""
    history = ChatService.get_history(db, session_id)
    return [
        ChatHistoryResponse(
            id=h.id,
            session_id=h.session_id,
            question=h.question,
            answer=h.answer,
            source_docs=h.source_docs,
            created_at=h.created_at.isoformat()
        )
        for h in history
    ]


@router.get("/sessions")
def get_all_sessions(db: Session = Depends(get_db)):
    """获取所有会话"""
    sessions = ChatService.get_all_sessions(db)
    return [
        {"session_id": s.session_id, "last_time": s.last_time.isoformat(), "count": s.count}
        for s in sessions
    ]
