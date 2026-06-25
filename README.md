### 核心技术亮点 
## 1. RAG（检索增强生成）架构实现
技术方案 ：
- 使用 LangChain 框架构建RAG Pipeline
- 集成 Ollama 本地部署大模型（qwen3.5:0.8b）
- 采用 ChromaDB 向量数据库存储文档嵌入
- 实现 语义检索 + 相似度过滤 机制（阈值：1.0）

技术细节 ：
- 文档分块策略：RecursiveCharacterTextSplitter（chunk_size=500, overlap=50）
- 嵌入模型：qwen3-embedding:0.6b
- 相似度计算：余弦距离
- 检索策略：Top-K + 阈值过滤（K=4, threshold=1.0）
## 2. 混合查询架构（Hybrid Query System）
创新点 ：实现了知识库问答与结构化数据查询的智能融合

技术实现 ：
- 意图识别 ：基于LLM的意图分类器 + 关键词匹配后备方案
- 查询路由 ：策略模式实现不同查询类型的处理
- 结果融合 ：将结构化数据转换为自然语言上下文
支持的查询类型 ：
1. 统计查询 ："我有多少条笔记？"
2. 笔记搜索 ："查找关于Vue的笔记"
3. 日期查询 ："6月有哪些笔记？"
4. 知识库问答 ："什么是社会实践？"
5. 文档查询 ："知识库有哪些文档？"
## 3. 文档处理流水线
支持的文档格式 ：
- PDF（PyPDFLoader）
- Word（python-docx）
- Markdown
- 纯文本

异步处理 ：
- 使用 FastAPI BackgroundTasks 实现异步向量化
- 文档状态管理：pending → processing → done
- 错误处理与重试机制

## 4. 向量数据库优化
优化策略 ：
- 批量插入优化（batch_size=100）
- 向量索引优化
- 持久化存储
- 相似度阈值调优
## 5. 前端架构设计
技术栈 ：
- Vue3 Composition API ：响应式状态管理
- Pinia ：全局状态管理
- Axios ：HTTP请求封装
- Vite ：构建工具
关键功能 ：

- 实时聊天界面（流式响应）
- 文档上传进度显示
- 笔记编辑器（Markdown支持）
- 响应式布局设计

### 性能优化
1. 向量检索优化
   
   - 批量插入优化
   - 索引优化
   - 相似度阈值调优
2. 数据库查询优化
   
   - 索引优化（created_at, embedding_status）
   - 查询缓存
   - 分页查询
3. 前端性能优化
   
   - 组件懒加载
   - 请求防抖
   - 虚拟滚动
### 项目成果
1. 功能完整性
   
   - 实现知识库文档上传、向量化、检索全流程
   - 支持多种文档格式
   - 智能问答准确率 > 85%
2. 技术创新
   
   - 混合查询架构创新
   - 意图识别与查询路由
   - 结构化数据自然语言化
3. 工程实践
   
   - 前后端分离架构
   - RESTful API设计
   - 数据库设计规范
   - 代码模块化
### 技术栈总结
后端 ：

- Python 3.11
- FastAPI（Web框架）
- LangChain（LLM框架）
- Ollama（本地LLM部署）
- ChromaDB（向量数据库）
- MySQL（关系数据库）
- SQLAlchemy（ORM）
前端 ：

- Vue3（框架）
- Vite（构建工具）
- Pinia（状态管理）
- Axios（HTTP客户端）
AI/ML ：

- RAG（检索增强生成）
- Embeddings（文本嵌入）
- Vector Search（向量检索）
- Intent Classification（意图分类）
