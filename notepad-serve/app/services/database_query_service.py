# -*- coding: utf-8 -*-
"""
数据库查询模块
根据用户意图查询数据库
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database.models import Note, Document
from datetime import datetime
import re


class DatabaseQueryService:
    """数据库查询服务"""

    def __init__(self, db: Session):
        self.db = db

    def search_notes(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        搜索笔记内容

        Args:
            query: 搜索关键词
            limit: 返回结果数量限制

        Returns:
            笔记列表
        """
        # 在标题和内容中搜索
        notes = self.db.query(Note).filter(
            or_(
                Note.title.ilike(f"%{query}%"),
                Note.content.ilike(f"%{query}%")
            )
        ).limit(limit).all()

        return [
            {
                "id": note.id,
                "title": note.title,
                "content": note.content[:200] + "..." if len(note.content) > 200 else note.content,
                "created_at": note.created_at.isoformat() if note.created_at else None,
                "updated_at": note.updated_at.isoformat() if note.updated_at else None
            }
            for note in notes
        ]

    def get_notes_by_date(
        self,
        year: Optional[int] = None,
        month: Optional[int] = None,
        day: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        按日期查询笔记

        Args:
            year: 年份
            month: 月份
            day: 日期

        Returns:
            笔记列表
        """
        query = self.db.query(Note)

        # MySQL使用DATE_FORMAT函数
        if year:
            query = query.filter(func.year(Note.created_at) == year)
        if month:
            query = query.filter(func.month(Note.created_at) == month)
        if day:
            query = query.filter(func.day(Note.created_at) == day)

        notes = query.all()

        return [
            {
                "id": note.id,
                "title": note.title,
                "content": note.content[:200] + "..." if len(note.content) > 200 else note.content,
                "created_at": note.created_at.isoformat() if note.created_at else None
            }
            for note in notes
        ]

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取统计数据

        Returns:
            统计信息
        """
        # 笔记统计
        total_notes = self.db.query(func.count(Note.id)).scalar()

        # 文档统计
        total_docs = self.db.query(func.count(Document.id)).scalar()
        processed_docs = self.db.query(func.count(Document.id)).filter(
            Document.embedding_status == "done"
        ).scalar()
        pending_docs = self.db.query(func.count(Document.id)).filter(
            Document.embedding_status == "pending"
        ).scalar()
        processing_docs = self.db.query(func.count(Document.id)).filter(
            Document.embedding_status == "processing"
        ).scalar()

        # 按月份统计笔记
        from sqlalchemy import literal_column
        
        monthly_notes = self.db.query(
            literal_column("DATE_FORMAT(created_at, '%Y-%m')").label('month'),
            func.count(Note.id).label('count')
        ).group_by(
            literal_column("DATE_FORMAT(created_at, '%Y-%m')")
        ).all()

        return {
            "notes": {
                "total": total_notes,
                "monthly": [{"month": m, "count": c} for m, c in monthly_notes]
            },
            "documents": {
                "total": total_docs,
                "processed": processed_docs,
                "pending": pending_docs,
                "processing": processing_docs
            }
        }

    def get_document_list(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        获取文档列表

        Args:
            status: 文档状态过滤（可选）

        Returns:
            文档列表
        """
        query = self.db.query(Document)

        if status:
            query = query.filter(Document.embedding_status == status)

        documents = query.order_by(Document.created_at.desc()).all()

        return [
            {
                "id": doc.id,
                "name": doc.name,
                "file_type": doc.file_type,
                "file_size": doc.file_size,
                "status": doc.embedding_status,
                "chunk_count": doc.chunk_count,
                "created_at": doc.created_at.isoformat() if doc.created_at else None
            }
            for doc in documents
        ]

    def extract_date_from_question(self, question: str) -> Dict[str, Optional[int]]:
        """
        从问题中提取日期信息

        Args:
            question: 用户问题

        Returns:
            包含year, month, day的字典
        """
        result = {"year": None, "month": None, "day": None}

        # 提取年份
        year_match = re.search(r'(\d{4})年', question)
        if year_match:
            result["year"] = int(year_match.group(1))

        # 提取月份
        month_match = re.search(r'(\d{1,2})月', question)
        if month_match:
            result["month"] = int(month_match.group(1))

        # 提取日期
        day_match = re.search(r'(\d{1,2})日|号', question)
        if day_match:
            result["day"] = int(day_match.group(1))

        return result

    def format_notes_for_context(self, notes: List[Dict[str, Any]]) -> str:
        """
        格式化笔记列表为上下文字符串

        Args:
            notes: 笔记列表

        Returns:
            格式化的字符串
        """
        if not notes:
            return "没有找到相关笔记。"

        context = f"找到 {len(notes)} 条笔记：\n\n"
        for i, note in enumerate(notes, 1):
            context += f"{i}. {note['title']}\n"
            context += f"   创建时间: {note['created_at']}\n"
            if note.get('content'):
                context += f"   内容: {note['content']}\n"
            context += "\n"

        return context

    def format_statistics_for_context(self, stats: Dict[str, Any]) -> str:
        """
        格式化统计数据为上下文字符串

        Args:
            stats: 统计数据

        Returns:
            格式化的字符串
        """
        context = "系统统计数据：\n\n"

        # 笔记统计
        context += f"📝 笔记统计：\n"
        context += f"   总数: {stats['notes']['total']} 条\n"
        if stats['notes']['monthly']:
            context += f"   按月份:\n"
            for item in stats['notes']['monthly']:
                context += f"     - {item['month']}: {item['count']} 条\n"

        context += "\n"

        # 文档统计
        context += f"📚 文档统计：\n"
        context += f"   总数: {stats['documents']['total']} 个\n"
        context += f"   已处理: {stats['documents']['processed']} 个\n"
        context += f"   处理中: {stats['documents']['processing']} 个\n"
        context += f"   待处理: {stats['documents']['pending']} 个\n"

        return context

    def format_documents_for_context(self, documents: List[Dict[str, Any]]) -> str:
        """
        格式化文档列表为上下文字符串

        Args:
            documents: 文档列表

        Returns:
            格式化的字符串
        """
        if not documents:
            return "知识库中没有文档。"

        context = f"知识库共有 {len(documents)} 个文档：\n\n"
        for i, doc in enumerate(documents, 1):
            context += f"{i}. {doc['name']}\n"
            context += f"   类型: {doc['file_type']}\n"
            context += f"   状态: {doc['status']}\n"
            context += f"   上传时间: {doc['created_at']}\n"
            context += "\n"

        return context
