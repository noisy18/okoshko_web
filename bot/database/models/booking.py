from datetime import datetime
from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.database.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.telegram_id", ondelete="CASCADE"), index=True, nullable=False)
    salon: Mapped[str] = mapped_column(String(128), nullable=False)
    master: Mapped[str] = mapped_column(String(128), nullable=False)
    booking_date: Mapped[str] = mapped_column(String(64), nullable=False)
    booking_time: Mapped[str] = mapped_column(String(32), nullable=False)
    services: Mapped[str] = mapped_column(Text, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(32), default="confirmed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="bookings")

    def __repr__(self) -> str:
        return f"<Booking id={self.id} user_id={self.user_id} master={self.master} total={self.total_price}>"
