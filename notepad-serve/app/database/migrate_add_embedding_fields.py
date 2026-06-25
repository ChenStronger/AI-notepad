"""数据库迁移脚本 - 添加向量化进度字段"""
from sqlalchemy import create_engine, text
from app.config import DB_CONFIG


def migrate():
    """迁移：添加 embedding_progress 和 embedding_message 字段"""
    engine = create_engine(
        f"mysql+mysqlconnector://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset={DB_CONFIG['charset']}"
    )
    
    with engine.connect() as conn:
        # 检查 embedding_progress 字段是否存在
        result = conn.execute(text("DESCRIBE documents"))
        columns = [row[0] for row in result]
        
        if 'embedding_progress' not in columns:
            print("添加 embedding_progress 字段...")
            conn.execute(text("ALTER TABLE documents ADD COLUMN embedding_progress INT DEFAULT 0"))
            conn.commit()
            print("embedding_progress 字段添加成功")
        else:
            print("embedding_progress 字段已存在")
        
        if 'embedding_message' not in columns:
            print("添加 embedding_message 字段...")
            conn.execute(text("ALTER TABLE documents ADD COLUMN embedding_message VARCHAR(500)"))
            conn.commit()
            print("embedding_message 字段添加成功")
        else:
            print("embedding_message 字段已存在")
        
        print("迁移完成")


if __name__ == "__main__":
    migrate()
