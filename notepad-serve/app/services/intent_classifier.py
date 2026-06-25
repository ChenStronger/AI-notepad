# -*- coding: utf-8 -*-
"""
意图识别模块
识别用户问题的意图，决定使用哪种查询方式
"""
from typing import Literal
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from app.config import LLM_MODEL, OLLAMA_BASE_URL


# 意图类型
IntentType = Literal[
    "knowledge_base",  # 知识库问答
    "note_search",     # 笔记搜索
    "statistics",      # 统计查询
    "document_query",  # 文档查询
    "general_chat"     # 普通对话
]


class IntentClassifier:
    """意图识别器"""

    def __init__(self):
        self.llm = ChatOllama(
            model=LLM_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=0.1  # 低温度，更确定性的输出
        )
        self._classifier = None

    @property
    def classifier(self):
        """获取意图分类器"""
        if self._classifier is None:
            prompt = ChatPromptTemplate.from_template("""你是一个意图识别助手。请分析用户的问题，并返回最合适的意图类型。

可用的意图类型：
1. knowledge_base - 知识库问答：用户询问知识库中的文档内容、概念解释等
   示例："什么是社会实践？"、"如何使用Docker？"、"Vue3有什么新特性？"

2. note_search - 笔记搜索：用户想查找、搜索自己的笔记内容
   示例："查找关于Vue的笔记"、"搜索包含Docker的笔记"、"我的笔记里有关于Git的内容吗？"

3. statistics - 统计查询：用户询问数据统计、数量、计数等
   示例："我有多少条笔记？"、"统计一下文档数量"、"6月有多少条笔记？"

4. document_query - 文档查询：用户询问知识库文档本身的信息
   示例："知识库有哪些文档？"、"文档上传时间"、"文档处理状态"

5. general_chat - 普通对话：日常问候、闲聊、通用问题
   示例："你好"、"今天天气怎么样？"、"谢谢"

用户问题：{question}

请只返回意图类型（knowledge_base/note_search/statistics/document_query/general_chat），不要返回其他内容。""")

            self._classifier = prompt | self.llm

        return self._classifier

    def classify(self, question: str) -> IntentType:
        """识别用户意图"""
        try:
            # 使用LLM识别意图
            result = self.classifier.invoke({"question": question})

            # 提取意图
            if hasattr(result, 'content'):
                intent = result.content.strip().lower()
            else:
                intent = str(result).strip().lower()

            # 验证意图是否有效
            valid_intents = ["knowledge_base", "note_search", "statistics", "document_query", "general_chat"]
            if intent in valid_intents:
                return intent
            else:
                # 如果LLM返回了无效意图，使用关键词匹配作为后备
                return self._fallback_classify(question)

        except Exception as e:
            print(f"Intent classification failed: {e}")
            # 降级为关键词匹配
            return self._fallback_classify(question)

    def _fallback_classify(self, question: str) -> IntentType:
        """关键词匹配作为后备方案"""
        question_lower = question.lower()

        # 统计查询关键词
        stats_keywords = ["多少", "统计", "数量", "计数", "几个", "count"]
        if any(kw in question_lower for kw in stats_keywords):
            return "statistics"

        # 笔记搜索关键词
        note_keywords = ["笔记", "记事", "查找笔记", "搜索笔记", "我的笔记"]
        if any(kw in question_lower for kw in note_keywords):
            return "note_search"

        # 文档查询关键词
        doc_keywords = ["文档", "知识库文档", "上传的文档", "文档列表"]
        if any(kw in question_lower for kw in doc_keywords):
            return "document_query"

        # 知识库问答关键词
        kb_keywords = ["什么是", "如何", "怎么", "为什么", "解释", "介绍"]
        if any(kw in question_lower for kw in kb_keywords):
            return "knowledge_base"

        # 默认为普通对话
        return "general_chat"
