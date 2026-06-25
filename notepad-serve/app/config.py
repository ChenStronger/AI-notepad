import os
from pathlib import Path

# 基础路径
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = DATA_DIR / "documents"

# 确保目录存在
DATA_DIR.mkdir(exist_ok=True)
DOCUMENTS_DIR.mkdir(exist_ok=True)

# 数据库配置
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": os.getenv("DB_PASSWORD", "123123"),
    "database": "db_notepad",
    "charset": "utf8mb4"
}

# Ollama 配置
OLLAMA_BASE_URL = "http://localhost:11434"
LLM_MODEL = "qwen3.5:0.8b"
EMBEDDING_MODEL = "qwen3-embedding:0.6b"

# 向量数据库配置
VECTORSTORE_TYPE = "chroma"  # chroma 或 "faiss"
CHROMA_DB_DIR = DATA_DIR / "chroma_db"
PERSIST_DIRECTORY = str(CHROMA_DB_DIR)

# 文档处理配置
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
