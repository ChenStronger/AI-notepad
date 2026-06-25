from fastapi import APIRouter
from app.api import notes, documents, chat

# 主路由
api_router = APIRouter()

# 注册子路由
api_router.include_router(notes.router)
api_router.include_router(documents.router)
api_router.include_router(chat.router)

__all__ = ["api_router"]
