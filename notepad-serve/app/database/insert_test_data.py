"""数据库测试数据初始化"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import DB_CONFIG
from app.database.models import Note, Document


def create_test_data():
    """插入测试数据"""
    # 创建数据库连接
    engine = create_engine(
        f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset={DB_CONFIG['charset']}"
    )
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # 插入笔记测试数据
        notes_data = [
            {
                'title': 'Vue3组合式API学习笔记',
                'content': '组合式API是Vue3的核心特性，使用ref和reactive创建响应式数据。setup函数是组合式API的入口。'
            },
            {
                'title': 'JavaScript异步编程总结',
                'content': '异步编程方式：回调函数、Promise、async/await。Promise有三种状态：pending、fulfilled、rejected。'
            },
            {
                'title': 'Git工作流最佳实践',
                'content': '常用工作流：Git Flow、GitHub Flow、GitLab Flow。建议使用feature分支进行开发。'
            },
            {
                'title': 'Docker容器化部署',
                'content': 'Docker使用镜像和容器来打包应用。Dockerfile定义镜像构建过程，docker-compose管理多容器应用。'
            },
            {
                'title': 'RESTful API设计规范',
                'content': '使用HTTP方法表示操作：GET获取、POST创建、PUT更新、DELETE删除。使用JSON格式传输数据。'
            }
        ]

        print("正在插入笔记测试数据...")
        for note_data in notes_data:
            note = Note(**note_data)
            session.add(note)

        # 插入文档测试数据
        documents_data = [
            {
                'name': 'Vue3入门指南.pdf',
                'file_path': '/data/documents/vue3-guide.pdf',
                'file_type': 'pdf',
                'file_size': 2411724,
                'content': 'Vue3是Vue.js的最新版本，采用组合式API。主要特性包括：响应式系统重构、Composition API、Teleport、Suspense等。',
                'embedding_status': 'done',
                'chunk_count': 15
            },
            {
                'name': 'JavaScript高级技巧.docx',
                'file_path': '/data/documents/js-advanced.docx',
                'file_type': 'docx',
                'file_size': 1887436,
                'content': '深入理解闭包、原型链、异步编程。包括Promise、async/await、Generator函数等高级特性。',
                'embedding_status': 'done',
                'chunk_count': 12
            },
            {
                'name': '项目开发规范.md',
                'file_path': '/data/documents/dev-guide.md',
                'file_type': 'md',
                'file_size': 46080,
                'content': '代码风格指南、Git工作流、代码审查流程。遵循ESLint和Prettier规范。',
                'embedding_status': 'done',
                'chunk_count': 8
            },
            {
                'name': 'API接口文档.pdf',
                'file_path': '/data/documents/api-docs.pdf',
                'file_type': 'pdf',
                'file_size': 3240960,
                'content': 'RESTful API设计规范、接口认证机制、错误处理规范。使用JWT进行身份验证。',
                'embedding_status': 'done',
                'chunk_count': 20
            },
            {
                'name': '数据库设计原则.docx',
                'file_path': '/data/documents/db-design.docx',
                'file_type': 'docx',
                'file_size': 2621440,
                'content': '关系型数据库设计范式：第一范式、第二范式、第三范式。索引优化、查询性能调优。',
                'embedding_status': 'done',
                'chunk_count': 18
            },
            {
                'name': 'Git使用指南.md',
                'file_path': '/data/documents/git-guide.md',
                'file_type': 'md',
                'file_size': 32768,
                'content': 'Git基础命令、分支管理策略、代码合并技巧。常用命令：git clone、git branch、git merge、git rebase。',
                'embedding_status': 'done',
                'chunk_count': 6
            },
            {
                'name': '代码审查清单.md',
                'file_path': '/data/documents/code-review.md',
                'file_type': 'md',
                'file_size': 28672,
                'content': '代码质量检查、安全漏洞防范、性能优化建议。检查清单包括：代码风格、错误处理、安全隐患。',
                'embedding_status': 'done',
                'chunk_count': 5
            },
            {
                'name': '部署运维手册.pdf',
                'file_path': '/data/documents/deploy-guide.pdf',
                'file_type': 'pdf',
                'file_size': 4390912,
                'content': 'Docker容器化部署、CI/CD流程配置、监控告警设置。使用GitHub Actions或GitLab CI进行自动化部署。',
                'embedding_status': 'done',
                'chunk_count': 22
            }
        ]

        print("正在插入文档测试数据...")
        for doc_data in documents_data:
            doc = Document(**doc_data)
            session.add(doc)

        session.commit()
        print("测试数据插入成功！")
        print(f"插入笔记数量: {len(notes_data)}")
        print(f"插入文档数量: {len(documents_data)}")

    except Exception as e:
        session.rollback()
        print(f"插入测试数据失败: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    create_test_data()
