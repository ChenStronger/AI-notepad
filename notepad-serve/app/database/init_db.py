"""数据库初始化脚本"""
from sqlalchemy import create_engine, text
from app.config import DB_CONFIG
from app.database import Base, engine


def create_database():
    """先创建数据库"""
    # 连接到 MySQL 服务（不指定数据库）
    create_db_engine = create_engine(
        f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/?charset={DB_CONFIG['charset']}"
    )
    
    with create_db_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}"))
        conn.commit()
    print("数据库创建成功")


def create_tables():
    """创建所有表"""
    print("正在创建数据库表...")
    try:
        Base.metadata.create_all(bind=engine)
        print("数据库表创建成功")
        print("已创建的表:")
        for table in Base.metadata.tables.keys():
            print(f"  - {table}")
    except Exception as e:
        print("数据库表创建失败:", str(e))


if __name__ == "__main__":
    create_database()
    create_tables()
