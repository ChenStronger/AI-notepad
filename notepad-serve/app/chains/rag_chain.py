from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser
from app.config import LLM_MODEL, OLLAMA_BASE_URL


class RAGChain:
    """RAG Chain"""

    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.llm = ChatOllama(
            model=LLM_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=0.7
        )
        self._chain = None
        self._retriever = None

    @property
    def retriever(self):
        """获取检索器"""
        if self._retriever is None:
            self._retriever = self.vectorstore.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            )
        return self._retriever

    @property
    def chain(self):
        """获取 RAG Chain"""
        if self._chain is None:
            prompt = ChatPromptTemplate.from_template("""你是一个智能助手，请根据提供的上下文信息回答用户的问题。

上下文信息：
{context}

用户问题：{question}

请根据上下文信息给出准确、详细的回答。如果上下文中没有相关信息，请说明无法从提供的文档中找到答案。""")

            self._chain = (
                RunnableParallel(
                    context=self.retriever | self._format_docs,
                    question=RunnablePassthrough()
                )
                | prompt
                | self.llm
                | StrOutputParser()
            )
        return self._chain

    @staticmethod
    def _format_docs(docs):
        """格式化文档列表为字符串"""
        return "\n\n".join([doc.page_content for doc in docs])

    def invoke(self, question: str) -> dict:
        """执行 RAG 查询（包含检索步骤）"""
        # 检索相关文档
        docs = self.vectorstore.similarity_search(question, k=4)
        return self.invoke_with_docs(question, docs)

    def invoke_with_docs(self, question: str, docs: list) -> dict:
        """使用已检索的文档执行 RAG 查询（跳过检索步骤）"""
        # 组合上下文
        context = self._format_docs(docs)

        # 构建 RAG prompt 直接调用 LLM
        prompt = ChatPromptTemplate.from_template("""你是一个智能助手，请根据提供的上下文信息回答用户的问题。

上下文信息：
{context}

用户问题：{question}

请根据上下文信息给出准确、详细的回答。如果上下文中没有相关信息，请说明无法从提供的文档中找到答案。""")

        rag_chain = (
            prompt
            | self.llm
            | StrOutputParser()
        )

        # 调用 Chain
        result = rag_chain.invoke({"context": context, "question": question})
        # StrOutputParser 返回的是字符串，但也可能是 TextAccessor
        if isinstance(result, str):
            answer = result
        elif hasattr(result, 'content'):
            answer = result.content
        else:
            answer = str(result)

        # 返回结果
        return {
            "answer": answer,
            "source_documents": [
                {
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in docs
            ]
        }

    def add_documents(self, documents: list, ids: list = None) -> list:
        """添加文档到向量存储"""
        return self.vectorstore.add_documents(documents, ids=ids)

    def delete_documents(self, ids: list) -> None:
        """从向量存储删除文档"""
        self.vectorstore.delete(ids)
