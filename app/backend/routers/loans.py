import json
import logging
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.loans import LoansService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/loans", tags=["loans"])


# ---------- Pydantic Schemas ----------
class LoansData(BaseModel):
    """Entity data schema (for create/update)"""
    salesman_name: str = None
    license_plate: str = None
    customer_name: str = None
    customer_kennitala: str = None
    customer_phone: str = None
    notes: str = None
    checkout_time: str = None
    returned: str = None
    return_time: str = None


class LoansUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    salesman_name: Optional[str] = None
    license_plate: Optional[str] = None
    customer_name: Optional[str] = None
    customer_kennitala: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    checkout_time: Optional[str] = None
    returned: Optional[str] = None
    return_time: Optional[str] = None


class LoansResponse(BaseModel):
    """Entity response schema"""
    id: int
    salesman_name: Optional[str] = None
    license_plate: Optional[str] = None
    customer_name: Optional[str] = None
    customer_kennitala: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    checkout_time: Optional[str] = None
    returned: Optional[str] = None
    return_time: Optional[str] = None

    class Config:
        from_attributes = True


class LoansListResponse(BaseModel):
    """List response schema"""
    items: List[LoansResponse]
    total: int
    skip: int
    limit: int


class LoansBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[LoansData]


class LoansBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: LoansUpdateData


class LoansBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[LoansBatchUpdateItem]


class LoansBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=LoansListResponse)
async def query_loanss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query loanss with filtering, sorting, and pagination"""
    logger.debug(f"Querying loanss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = LoansService(db)
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
        logger.debug(f"Found {result['total']} loanss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying loanss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=LoansListResponse)
async def query_loanss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query loanss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying loanss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = LoansService(db)
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
        logger.debug(f"Found {result['total']} loanss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying loanss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=LoansResponse)
async def get_loans(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single loans by ID"""
    logger.debug(f"Fetching loans with id: {id}, fields={fields}")
    
    service = LoansService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Loans with id {id} not found")
            raise HTTPException(status_code=404, detail="Loans not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching loans {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=LoansResponse, status_code=201)
async def create_loans(
    data: LoansData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new loans"""
    logger.debug(f"Creating new loans with data: {data}")
    
    service = LoansService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create loans")
        
        logger.info(f"Loans created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating loans: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating loans: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[LoansResponse], status_code=201)
async def create_loanss_batch(
    request: LoansBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple loanss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} loanss")
    
    service = LoansService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} loanss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[LoansResponse])
async def update_loanss_batch(
    request: LoansBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple loanss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} loanss")
    
    service = LoansService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} loanss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=LoansResponse)
async def update_loans(
    id: int,
    data: LoansUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing loans"""
    logger.debug(f"Updating loans {id} with data: {data}")

    service = LoansService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Loans with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Loans not found")
        
        logger.info(f"Loans {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating loans {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating loans {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_loanss_batch(
    request: LoansBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple loanss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} loanss")
    
    service = LoansService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} loanss successfully")
        return {"message": f"Successfully deleted {deleted_count} loanss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_loans(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single loans by ID"""
    logger.debug(f"Deleting loans with id: {id}")
    
    service = LoansService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Loans with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Loans not found")
        
        logger.info(f"Loans {id} deleted successfully")
        return {"message": "Loans deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting loans {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")