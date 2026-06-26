from sqlalchemy.orm import Session
from app.models.category import Category

DEFAULT_CATEGORIES = [
    # Expense
    {"name": "Ăn uống", "type": "expense", "icon": "utensils", "color": "#ef4444"},
    {"name": "Di chuyển", "type": "expense", "icon": "car", "color": "#f97316"},
    {"name": "Mua sắm", "type": "expense", "icon": "shopping-bag", "color": "#eab308"},
    {"name": "Giải trí", "type": "expense", "icon": "gamepad", "color": "#a855f7"},
    {"name": "Hóa đơn", "type": "expense", "icon": "receipt", "color": "#6366f1"},
    {"name": "Sức khỏe", "type": "expense", "icon": "heart-pulse", "color": "#ec4899"},
    {"name": "Giáo dục", "type": "expense", "icon": "graduation-cap", "color": "#14b8a6"},
    {"name": "Khác", "type": "expense", "icon": "ellipsis", "color": "#6b7280"},
    # Income
    {"name": "Lương", "type": "income", "icon": "banknote", "color": "#22c55e"},
    {"name": "Thưởng", "type": "income", "icon": "gift", "color": "#10b981"},
    {"name": "Đầu tư", "type": "income", "icon": "trending-up", "color": "#06b6d4"},
    {"name": "Freelance", "type": "income", "icon": "laptop", "color": "#8b5cf6"},
    {"name": "Khác", "type": "income", "icon": "plus-circle", "color": "#84cc16"},
]

def seed_default_categories(db: Session):
    """Seed default categories if none exist."""
    existing = db.query(Category).filter(Category.is_default == True).count()
    if existing > 0:
        return

    for cat_data in DEFAULT_CATEGORIES:
        category = Category(
            user_id=None,
            is_default=True,
            **cat_data,
        )
        db.add(category)

    db.commit()
    print(f"Seeded {len(DEFAULT_CATEGORIES)} default categories")

if __name__ == "__main__":
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_default_categories(db)
    finally:
        db.close()
