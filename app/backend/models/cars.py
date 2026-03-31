from core.database import Base
from sqlalchemy import Column, Integer, String


class Cars(Base):
    __tablename__ = "cars"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    license_plate = Column(String, nullable=False)