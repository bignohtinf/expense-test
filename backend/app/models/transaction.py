import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, DateTime, Date, Numeric, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        Index("ix_transactions_user_date", "user_id", "transaction_date"),
        Index("ix_transactions_user_category", "user_id", "category_id", "transaction_date"),
        # Chat feature: type-filtered aggregations (spending by category, top expenses)
        Index("ix_transactions_user_type_date", "user_id", "type", "transaction_date"),
        # Chat feature: top-N by amount within a month
        Index("ix_transactions_user_date_amount", "user_id", "transaction_date", "amount"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=True)
    type = Column(String(10), nullable=False)  # income, expense
    amount = Column(Numeric(15, 2), nullable=False)
    description = Column(Text, default="")
    transaction_date = Column(Date, nullable=False, default=date.today)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    wallet = relationship("Wallet", back_populates="transactions")
