import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.cars import Cars

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class CarsService:
    """Service layer for Cars operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Cars]:
        """Create a new cars"""
        try:
            obj = Cars(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created cars with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating cars: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Cars]:
        """Get cars by ID"""
        try:
            query = select(Cars).where(Cars.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching cars {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of carss"""
        try:
            query = select(Cars)
            count_query = select(func.count(Cars.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Cars, field):
                        query = query.where(getattr(Cars, field) == value)
                        count_query = count_query.where(getattr(Cars, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Cars, field_name):
                        query = query.order_by(getattr(Cars, field_name).desc())
                else:
                    if hasattr(Cars, sort):
                        query = query.order_by(getattr(Cars, sort))
            else:
                query = query.order_by(Cars.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching cars list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Cars]:
        """Update cars"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Cars {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated cars {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating cars {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete cars"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Cars {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted cars {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting cars {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Cars]:
        """Get cars by any field"""
        try:
            if not hasattr(Cars, field_name):
                raise ValueError(f"Field {field_name} does not exist on Cars")
            result = await self.db.execute(
                select(Cars).where(getattr(Cars, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching cars by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Cars]:
        """Get list of carss filtered by field"""
        try:
            if not hasattr(Cars, field_name):
                raise ValueError(f"Field {field_name} does not exist on Cars")
            result = await self.db.execute(
                select(Cars)
                .where(getattr(Cars, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Cars.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching carss by {field_name}: {str(e)}")
            raise