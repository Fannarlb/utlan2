from core.database import Base
from sqlalchemy import Column, Integer, String


class Loans(Base):
    __tablename__ = "loans"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    salesman_name = Column(String, nullable=True)
    license_plate = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    customer_kennitala = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    checkout_time = Column(String, nullable=True)
    returned = Column(String, nullable=True)
    return_time = Column(String, nullable=True)