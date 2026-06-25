from sqlalchemy.orm import Session
from app.database.models import ChatHistory
from app.schemas.chat import ChatRequest
from app.chains.rag_chain import RAGChain
from app.vectorstore.chromadb import VectorStore
from app.services.intent_classifier import IntentClassifier
from app.services.database_query_service import DatabaseQueryService
from langchain_ollama import ChatOllama
from app.config import LLM_MODEL, OLLAMA_BASE_URL
import uuid
import requests
import json


class ChatService:
    """聊天服务"""

    def __init__(self):
        self.vectorstore = VectorStore()
        self.rag_chain = RAGChain(self.vectorstore)
        self.intent_classifier = IntentClassifier()
        self._models_available = None
        self._llm = None

    @property
    def llm(self):
        """获取LLM实例（懒加载）"""
        if self._llm is None:
            self._llm = ChatOllama(
                model=LLM_MODEL,
                base_url=OLLAMA_BASE_URL,
                temperature=0.7
            )
        return self._llm

    def _check_ollama_models(self) -> bool:
        """检查 Ollama 模型是否可用"""
        if self._models_available is not None:
            return self._models_available

        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                model_names = [m.get("name", "") for m in models]

                # 检查是否有需要的模型
                has_llm = any("qwen3.5" in m.lower() for m in model_names)

                self._models_available = has_llm
                return self._models_available
        except Exception as e:
            print(f"Failed to check Ollama models: {e}")

        self._models_available = False
        return False

    def chat(self, db: Session, request: ChatRequest) -> dict:
        """处理聊天请求（混合查询模式）"""
        session_id = request.session_id or str(uuid.uuid4())

        # 检查模型是否可用
        if not self._check_ollama_models():
            # 模型不可用，返回友好提示
            answer = "抱歉，AI 模型服务暂不可用。请确保已安装 Ollama 并下载所需模型：\n\n" \
                     "1. 安装 Ollama (https://ollama.com/)\n" \
                     "2. 运行命令下载模型：\n" \
                     "   ollama pull qwen3.5:0.8b\n" \
                     "   ollama pull qwen3-embedding:0.6b\n" \
                     "3. 启动 Ollama 服务：ollama serve"

            # 保存聊天历史
            chat_record = ChatHistory(
                session_id=session_id,
                question=request.question,
                answer=answer,
                source_docs=[]
            )
            db.add(chat_record)
            db.commit()

            return {
                "answer": answer,
                "sources": [],
                "session_id": session_id
            }

        # ===== 新增：意图识别 =====
        print(f"\n[意图识别] 分析问题: {request.question}")
        intent = self.intent_classifier.classify(request.question)
        print(f"[意图识别] 识别结果: {intent}")

        # 根据意图选择查询方式
        if intent == "statistics":
            # 统计查询
            return self._handle_statistics_query(db, request.question, session_id)
        elif intent == "note_search":
            # 笔记搜索
            return self._handle_note_search(db, request.question, session_id)
        elif intent == "document_query":
            # 文档查询
            return self._handle_document_query(db, request.question, session_id)
        elif intent == "knowledge_base":
            # 知识库问答
            return self._handle_knowledge_base_query(db, request, session_id)
        else:
            # 普通对话
            return self._handle_general_chat(db, request.question, session_id)

    def _handle_statistics_query(self, db: Session, question: str, session_id: str) -> dict:
        """处理统计查询"""
        print(f"[统计查询] 处理问题: {question}")

        # 查询统计数据
        db_service = DatabaseQueryService(db)
        stats = db_service.get_statistics()

        # 格式化为上下文
        context = db_service.format_statistics_for_context(stats)

        # 使用LLM生成自然语言回答
        prompt = f"""根据以下统计数据回答用户的问题。

统计数据：
{context}

用户问题：{question}

请用自然语言回答，不要直接返回JSON数据。"""

        answer = self._invoke_llm(prompt)

        # 保存聊天历史
        chat_record = ChatHistory(
            session_id=session_id,
            question=question,
            answer=answer,
            source_docs=[]
        )
        db.add(chat_record)
        db.commit()

        return {
            "answer": answer,
            "sources": [],
            "session_id": session_id
        }

    def _handle_note_search(self, db: Session, question: str, session_id: str) -> dict:
        """处理笔记搜索"""
        print(f"[笔记搜索] 处理问题: {question}")

        # 从问题中提取搜索关键词和日期
        db_service = DatabaseQueryService(db)

        # 提取日期信息
        date_info = db_service.extract_date_from_question(question)

        # 判断是日期查询还是关键词搜索
        if date_info["year"] or date_info["month"] or date_info["day"]:
            # 日期查询
            notes = db_service.get_notes_by_date(
                year=date_info["year"],
                month=date_info["month"],
                day=date_info["day"]
            )
        else:
            # 关键词搜索 - 从问题中提取关键词
            # 简单的关键词提取：去除常见词
            stop_words = ["的", "我", "有", "查找", "搜索", "笔记", "记事", "包含", "关于", "吗", "？", "?"]
            keywords = question
            for word in stop_words:
                keywords = keywords.replace(word, "")
            keywords = keywords.strip()

            if keywords:
                notes = db_service.search_notes(keywords)
            else:
                notes = []

        # 格式化为上下文
        context = db_service.format_notes_for_context(notes)

        # 使用LLM生成自然语言回答
        prompt = f"""根据以下笔记信息回答用户的问题。

笔记信息：
{context}

用户问题：{question}

请用自然语言回答，列出相关笔记的标题和创建时间。"""

        answer = self._invoke_llm(prompt)

        # 保存聊天历史
        chat_record = ChatHistory(
            session_id=session_id,
            question=question,
            answer=answer,
            source_docs=[]
        )
        db.add(chat_record)
        db.commit()

        return {
            "answer": answer,
            "sources": [],
            "session_id": session_id
        }

    def _handle_document_query(self, db: Session, question: str, session_id: str) -> dict:
        """处理文档查询"""
        print(f"[文档查询] 处理问题: {question}")

        # 查询文档列表
        db_service = DatabaseQueryService(db)
        documents = db_service.get_document_list()

        # 格式化为上下文
        context = db_service.format_documents_for_context(documents)

        # 使用LLM生成自然语言回答
        prompt = f"""根据以下文档信息回答用户的问题。

文档信息：
{context}

用户问题：{question}

请用自然语言回答，列出相关文档的名称、类型和状态。"""

        answer = self._invoke_llm(prompt)

        # 保存聊天历史
        chat_record = ChatHistory(
            session_id=session_id,
            question=question,
            answer=answer,
            source_docs=[]
        )
        db.add(chat_record)
        db.commit()

        return {
            "answer": answer,
            "sources": [],
            "session_id": session_id
        }

    def _handle_knowledge_base_query(self, db: Session, request: ChatRequest, session_id: str) -> dict:
        """处理知识库问答"""
        print(f"[知识库问答] 处理问题: {request.question}")

        # 第一步：检索知识库文档（带相似度分数）
        retrieved_docs = []
        try:
            docs_with_scores = self.vectorstore.similarity_search_with_score(request.question, k=4)
            print(f"Retrieved {len(docs_with_scores)} documents for question: {request.question}")
            for doc, score in docs_with_scores:
                print(f"  - Score: {score:.4f}, Content: {doc.page_content[:50]}...")

            # 过滤：只保留相似度分数 <= 1.0 的文档
            SIMILARITY_THRESHOLD = 1.0
            filtered_docs = [(doc, score) for doc, score in docs_with_scores if score <= SIMILARITY_THRESHOLD]

            if filtered_docs:
                retrieved_docs = [doc for doc, score in filtered_docs]
                print(f"Found {len(retrieved_docs)} relevant documents (score <= {SIMILARITY_THRESHOLD})")
            else:
                print(f"No relevant documents found (all scores > {SIMILARITY_THRESHOLD})")
        except Exception as e:
            print(f"Vector store search failed: {e}")
            retrieved_docs = []

        # 判断是否有检索到相关文档
        if retrieved_docs and len(retrieved_docs) > 0:
            # RAG 模式：知识库中有相关文档，结合文档回答
            try:
                result = self.rag_chain.invoke_with_docs(request.question, retrieved_docs)
                answer = result.get("answer", "")
                sources = result.get("source_documents", [])

                # 保存聊天历史
                chat_record = ChatHistory(
                    session_id=session_id,
                    question=request.question,
                    answer=answer,
                    source_docs=sources
                )
                db.add(chat_record)
                db.commit()

                return {
                    "answer": answer,
                    "sources": sources,
                    "session_id": session_id
                }

            except Exception as e:
                print(f"RAG mode failed: {e}")
                # RAG 失败，降级为直接 LLM 回答
                answer = self._invoke_llm(request.question)

                chat_record = ChatHistory(
                    session_id=session_id,
                    question=request.question,
                    answer=answer,
                    source_docs=[]
                )
                db.add(chat_record)
                db.commit()

                return {
                    "answer": answer,
                    "sources": [],
                    "session_id": session_id
                }
        else:
            # 知识库中没有相关文档，直接调用 LLM 回答
            print("No documents found in knowledge base, using LLM direct response")
            answer = self._invoke_llm(request.question)

            # 保存聊天历史
            chat_record = ChatHistory(
                session_id=session_id,
                question=request.question,
                answer=answer,
                source_docs=[]
            )
            db.add(chat_record)
            db.commit()

            return {
                "answer": answer,
                "sources": [],
                "session_id": session_id
            }

    def _handle_general_chat(self, db: Session, question: str, session_id: str) -> dict:
        """处理普通对话"""
        print(f"[普通对话] 处理问题: {question}")

        # 直接调用LLM回答
        answer = self._invoke_llm(question)

        # 保存聊天历史
        chat_record = ChatHistory(
            session_id=session_id,
            question=question,
            answer=answer,
            source_docs=[]
        )
        db.add(chat_record)
        db.commit()

        return {
            "answer": answer,
            "sources": [],
            "session_id": session_id
        }

    def _invoke_llm(self, question: str) -> str:
        """直接调用 LLM 回答问题"""
        try:
            response = self.llm.invoke(question)
            # 处理返回值
            if hasattr(response, 'content'):
                return response.content
            elif isinstance(response, str):
                return response
            else:
                return str(response)
        except Exception as e:
            print(f"LLM invoke failed: {e}")
            return f"抱歉，处理您的问题时发生错误：{str(e)}"

    @staticmethod
    def get_history(db: Session, session_id: str) -> list[ChatHistory]:
        """获取聊天历史"""
        return db.query(ChatHistory).filter(
            ChatHistory.session_id == session_id
        ).order_by(ChatHistory.created_at.desc()).all()

    @staticmethod
    def get_all_sessions(db: Session) -> list:
        """获取所有会话"""
        from sqlalchemy import func
        return db.query(
            ChatHistory.session_id,
            func.max(ChatHistory.created_at).label("last_time"),
            func.count(ChatHistory.id).label("count")
        ).group_by(ChatHistory.session_id).all()
