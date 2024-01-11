import requests
from datetime import datetime
from typing import Dict
from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse


from app.models.entities.Auth import Auth
from app.models.entities.Laboratory import Laboratory
from app.models.entities.MedicalStudy import MedicalStudy
from app.models.responses.LabsResponses import (
    GetLabsResponse,
    GetLabsError,
)
from app.models.responses.ValidationResponses import (
    AllApprovedLaboratoriesResponse,
    GetApprovedLaboratoriesError
)
from app.models.responses.StudiesResponses import (
    GetStudiesResponse,
    GetStudiesError,
    GetPendingStudiesResponse,
    GetPendingStudiesError
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
def get_all_labs(uid=Depends(Auth.is_logged_in)):
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
    
@router.get(
    "/approved-laboratories",
    status_code=status.HTTP_200_OK,
    response_model=AllApprovedLaboratoriesResponse,
    responses={
        401: {"model": GetApprovedLaboratoriesError},
        403: {"model": GetApprovedLaboratoriesError},
        500: {"model": GetApprovedLaboratoriesError},
    },
)
def get_all_approved_laboratories(uid=Depends(Auth.is_logged_in)):
    """
    Get all approved laboratories.

    This will allow superusers to retrieve all approved laboratories.

    This path operation will:

    * Return all of the approved laboratories.
    * Throw an error if appointment retrieving fails.
    """
    try:
        appoved_laboratories = Laboratory.get_approved_labs()
        return {"appoved_laboratories": appoved_laboratories}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    

@router.get(
    "/pending-studies",
    status_code=status.HTTP_200_OK,
    response_model=GetPendingStudiesResponse,
    responses={
        500: {"model": GetPendingStudiesError},
    },
)
def get_all_pending_studies(
    uid=Depends(Auth.is_logged_in)
    ):
    """
    Get a lab pending studies.

    This will allow authenticated labs to retrieve all pending studies.

    This path operation will:

    * Return all the pending studies for the lab in the system.
    * Throw an error if specialty retrieving fails.
    """
    try:
        pending_studies = MedicalStudy.get_pending_medical_studies_for_laboratory(uid)
        print(pending_studies)
        return {"studies": pending_studies}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )