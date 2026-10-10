from datetime import date, datetime
from typing import Optional
from sqlalchemy import BigInteger, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from bot.database.base import Base


class BusinessStatistic(Base):
    """Модель аналитики и статистики салона / мастера (выручка, записи, просмотры)"""
    __tablename__ = "business_statistics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    salon_id: Mapped[int] = mapped_column(Integer, ForeignKey("salons.id", ondelete="CASCADE"), index=True, nullable=False)
    stat_date: Mapped[date] = mapped_column(Date, default=date.today, index=True)

    views_count: Mapped[int] = mapped_column(Integer, default=0)
    bookings_count: Mapped[int] = mapped_column(Integer, default=0)
    completed_count: Mapped[int] = mapped_column(Integer, default=0)
    cancelled_count: Mapped[int] = mapped_column(Integer, default=0)
    revenue: Mapped[float] = mapped_column(Float, default=0.0)
    new_clients_count: Mapped[int] = mapped_column(Integer, default=0)
    returning_clients_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    salon: Mapped["Salon"] = relationship("Salon")

    def __repr__(self) -> str:
        return f"<BusinessStatistic salon_id={self.salon_id} date={self.stat_date} rev={self.revenue} bookings={self.bookings_count}>"
