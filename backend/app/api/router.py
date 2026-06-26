from fastapi import APIRouter
from app.api.endpoints import auth, wallets, categories, transactions, budgets, reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["Wallets"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["Budgets"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
