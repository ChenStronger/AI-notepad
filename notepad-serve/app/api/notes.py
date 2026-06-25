from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import NoteCreate, NoteUpdate, NoteResponse
from app.services import NoteService

router = APIRouter(prefix="/notes", tags=["笔记"])


@router.get("/", response_model=list[NoteResponse])
def get_all_notes(db: Session = Depends(get_db)):
    """获取所有笔记"""
    return NoteService.get_all(db)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """获取单个笔记"""
    note = NoteService.get_by_id(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return note


@router.post("/", response_model=NoteResponse)
def create_note(note_data: NoteCreate, db: Session = Depends(get_db)):
    """创建笔记"""
    return NoteService.create(db, note_data)


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note_data: NoteUpdate, db: Session = Depends(get_db)):
    """更新笔记"""
    note = NoteService.update(db, note_id, note_data)
    if not note:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """删除笔记"""
    success = NoteService.delete(db, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="笔记不存在")
    return {"message": "删除成功"}
