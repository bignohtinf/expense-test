from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
from app.core.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=list[CategoryResponse])
def list_categories(
    type: str | None = Query(None, pattern="^(income|expense)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Category).filter(
        or_(Category.user_id == current_user.id, Category.user_id == None)
    )
    if type:
        query = query.filter(Category.type == type)
    return query.order_by(Category.is_default.desc(), Category.name).all()

@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = Category(user_id=current_user.id, **data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: UUID, data: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại hoặc là danh mục mặc định")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(category_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại hoặc là danh mục mặc định")
    if category.is_default:
        raise HTTPException(status_code=400, detail="Không thể xóa danh mục mặc định")
    db.delete(category)
    db.commit()
    return {"message": "Đã xóa danh mục"}
