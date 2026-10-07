from aiogram import Router
from .user import user_router
from .webapp import webapp_router

main_router = Router(name="main_router")
main_router.include_router(user_router)
main_router.include_router(webapp_router)

__all__ = ["main_router", "user_router", "webapp_router"]
