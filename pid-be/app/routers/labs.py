import requests
from datetime import datetime
from typing import Dict
from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse


from app.models.entities.Auth import Auth
from app.models.entities.Laboratory import Laboratory
from app.models.responses.LabsResponses import (
    GetLabsResponse,
    GetLabsError,
)

router = APIRouter(
    prefix="/labs",
    tags=["Labs"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=GetLabsResponse,
    responses={
        500: {"model": GetLabsError},
    },
)
def get_all_labs():
    """
    Get all labs.

    This will allow authenticated users to retrieve all labs.

    This path operation will:

    * Return all the labs in the system.
    * Throw an error if specialty retrieving fails.
    """
    try:
        labs = Laboratory.get_all()
        return {"labs": labs}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )