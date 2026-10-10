from datetime import datetime
from typing import List, Optional
from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.database.base import Base


class Salon(Base):
    __tablename__ = "salons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    salon_type: Mapped[str] = mapped_column(String(64), default="Салон красоты")
    region: Mapped[str] = mapped_column(String(64), nullable=False)
    region_name: Mapped[str] = mapped_column(String(128), nullable=False)
    address: Mapped[str] = mapped_column(String(256), nullable=False)
    distance: Mapped[str] = mapped_column(String(64), default="рядом")
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=100)
    category_text: Mapped[str] = mapped_column(String(256), default="")
    price_from: Mapped[str] = mapped_column(String(64), default="от 1 500 ₽")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    services_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    slots_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    masters: Mapped[List["Master"]] = relationship("Master", back_populates="salon", cascade="all, delete-orphan")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="salon", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Salon id={self.id} slug={self.slug} name={self.name}>"
