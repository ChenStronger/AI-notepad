from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.config import DOCUMENTS_DIR
import os

# 创建 FastAPI 应用
app = FastAPI(
    title="AI Notepad API",
    description="基于 LangChain 的 RAG 个人记事本问答系统",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """根路径"""
    return {"message": "Welcome to AI Notepad API"}


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok"}


# 确保目录存在
os.makedirs(DOCUMENTS_DIR, exist_ok=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
