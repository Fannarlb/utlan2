import json
import logging
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.salesmen import SalesmenService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/salesmen", tags=["salesmen"])


# ---------- Pydantic Schemas ----------
class SalesmenData(BaseModel):
    """Entity data schema (for create/update)"""
    name: str


class SalesmenUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None


class SalesmenResponse(BaseModel):
    """Entity response schema"""
    id: int
    name: str

    class Config:
        from_attributes = True


class SalesmenListResponse(BaseModel):
    """List response schema"""
    items: List[SalesmenResponse]
    total: int
    skip: int
    limit: int


class SalesmenBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[SalesmenData]


class SalesmenBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: SalesmenUpdateData


class SalesmenBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[SalesmenBatchUpdateItem]


class SalesmenBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=SalesmenListResponse)
async def query_salesmens(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query salesmens with filtering, sorting, and pagination"""
    logger.debug(f"Querying salesmens: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = SalesmenService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} salesmens")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying salesmens: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=SalesmenListResponse)
async def query_salesmens_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query salesmens with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying salesmens: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = SalesmenService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} salesmens")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying salesmens: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=SalesmenResponse)
async def get_salesmen(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single salesmen by ID"""
    logger.debug(f"Fetching salesmen with id: {id}, fields={fields}")
    
    service = SalesmenService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Salesmen with id {id} not found")
            raise HTTPException(status_code=404, detail="Salesmen not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching salesmen {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=SalesmenResponse, status_code=201)
async def create_salesmen(
    data: SalesmenData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new salesmen"""
    logger.debug(f"Creating new salesmen with data: {data}")
    
    service = SalesmenService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create salesmen")
        
        logger.info(f"Salesmen created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating salesmen: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating salesmen: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[SalesmenResponse], status_code=201)
async def create_salesmens_batch(
    request: SalesmenBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple salesmens in a single request"""
    logger.debug(f"Batch creating {len(request.items)} salesmens")
    
    service = SalesmenService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} salesmens successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[SalesmenResponse])
async def update_salesmens_batch(
    request: SalesmenBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple salesmens in a single request"""
    logger.debug(f"Batch updating {len(request.items)} salesmens")
    
    service = SalesmenService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} salesmens successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=SalesmenResponse)
async def update_salesmen(
    id: int,
    data: SalesmenUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing salesmen"""
    logger.debug(f"Updating salesmen {id} with data: {data}")

    service = SalesmenService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Salesmen with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Salesmen not found")
        
        logger.info(f"Salesmen {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating salesmen {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating salesmen {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_salesmens_batch(
    request: SalesmenBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple salesmens by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} salesmens")
    
    service = SalesmenService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} salesmens successfully")
        return {"message": f"Successfully deleted {deleted_count} salesmens", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_salesmen(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single salesmen by ID"""
    logger.debug(f"Deleting salesmen with id: {id}")
    
    service = SalesmenService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Salesmen with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Salesmen not found")
        
        logger.info(f"Salesmen {id} deleted successfully")
        return {"message": "Salesmen deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting salesmen {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")