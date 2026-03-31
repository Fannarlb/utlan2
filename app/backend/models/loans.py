from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Loans(Base):
    __tablename__ = "loans"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    salesman_name = Column(String, nullable=False)
    license_plate = Column(String, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    checkout_time = Column(DateTime(timezone=True), nullable=False)
    returned = Column(String, nullable=False, default='no', server_default='no')
    return_time = Column(DateTime(timezone=True), nullable=True)