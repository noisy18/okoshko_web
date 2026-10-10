from datetime import datetime
from typing import Optional
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.database.base import Base


class BusinessApplication(Base):
    """Заявка на подключение Бизнес / PRO аккаунта салона или мастера"""
    __tablename__ = "business_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.telegram_id", ondelete="SET NULL"), nullable=True, index=True)
    biz_type: Mapped[str] = mapped_column(String(32), default="salon")  # salon / master
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    category: Mapped[str] = mapped_column(String(128), default="Салон красоты")
    address: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    contact: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="pending")  # pending / approved / rejected
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[Optional["User"]] = relationship("User")

    def __repr__(self) -> str:
        return f"<BusinessApplication id={self.id} name='{self.name}' type='{self.biz_type}' status='{self.status}'>"
