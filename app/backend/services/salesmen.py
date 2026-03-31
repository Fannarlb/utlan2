import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.salesmen import Salesmen

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class SalesmenService:
    """Service layer for Salesmen operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Salesmen]:
        """Create a new salesmen"""
        try:
            obj = Salesmen(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created salesmen with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating salesmen: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Salesmen]:
        """Get salesmen by ID"""
        try:
            query = select(Salesmen).where(Salesmen.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching salesmen {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of salesmens"""
        try:
            query = select(Salesmen)
            count_query = select(func.count(Salesmen.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Salesmen, field):
                        query = query.where(getattr(Salesmen, field) == value)
                        count_query = count_query.where(getattr(Salesmen, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Salesmen, field_name):
                        query = query.order_by(getattr(Salesmen, field_name).desc())
                else:
                    if hasattr(Salesmen, sort):
                        query = query.order_by(getattr(Salesmen, sort))
            else:
                query = query.order_by(Salesmen.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching salesmen list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Salesmen]:
        """Update salesmen"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Salesmen {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated salesmen {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating salesmen {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete salesmen"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Salesmen {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted salesmen {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting salesmen {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Salesmen]:
        """Get salesmen by any field"""
        try:
            if not hasattr(Salesmen, field_name):
                raise ValueError(f"Field {field_name} does not exist on Salesmen")
            result = await self.db.execute(
                select(Salesmen).where(getattr(Salesmen, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching salesmen by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Salesmen]:
        """Get list of salesmens filtered by field"""
        try:
            if not hasattr(Salesmen, field_name):
                raise ValueError(f"Field {field_name} does not exist on Salesmen")
            result = await self.db.execute(
                select(Salesmen)
                .where(getattr(Salesmen, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Salesmen.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching salesmens by {field_name}: {str(e)}")
            raise