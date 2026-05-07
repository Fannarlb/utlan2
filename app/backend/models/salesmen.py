from core.database import Base
from sqlalchemy import Column, Integer, String


class Salesmen(Base):
    __tablename__ = "salesmen"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)