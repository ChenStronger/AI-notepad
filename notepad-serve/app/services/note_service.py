from sqlalchemy.orm import Session
from app.database.models import Note
from app.schemas.note import NoteCreate, NoteUpdate


class NoteService:
    """笔记服务"""

    @staticmethod
    def get_all(db: Session) -> list[Note]:
        """获取所有笔记"""
        return db.query(Note).order_by(Note.updated_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, note_id: int) -> Note | None:
        """根据ID获取笔记"""
        return db.query(Note).filter(Note.id == note_id).first()

    @staticmethod
    def create(db: Session, note_data: NoteCreate) -> Note:
        """创建笔记"""
        note = Note(**note_data.model_dump())
        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def update(db: Session, note_id: int, note_data: NoteUpdate) -> Note | None:
        """更新笔记"""
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            return None
        update_data = note_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(note, key, value)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def delete(db: Session, note_id: int) -> bool:
        """删除笔记"""
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            return False
        db.delete(note)
        db.commit()
        return True
