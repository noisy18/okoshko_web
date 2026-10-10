from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.database.base import Base


class Master(Base):
    __tablename__ = "masters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    salon_id: Mapped[int] = mapped_column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    role_title: Mapped[str] = mapped_column(String(128), nullable=False)
    grade_badge: Mapped[str] = mapped_column(String(64), default="PRO TOP")
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=50)
    experience: Mapped[str] = mapped_column(String(64), default="5 лет")
    retention_rate: Mapped[str] = mapped_column(String(32), default="98%")
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str] = mapped_column(Text, nullable=False)
    slots_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    services_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    salon: Mapped["Salon"] = relationship("Salon", back_populates="masters")

    def __repr__(self) -> str:
        return f"<Master id={self.id} name={self.name} salon_id={self.salon_id}>"
