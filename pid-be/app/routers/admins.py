from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
from app.models.entities.Physician import Physician
from app.models.responses.AdminResponses import (
    GetAdminsResponse,
    GetAdminsError,
)
from app.models.responses.ValidationResponses import (
    SuccessfullValidationResponse,
    ValidationErrorResponse,
)

router = APIRouter(
    prefix="/admins",
    tags=["Admins"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/approve-physician/{physician_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullValidationResponse,
    responses={
        401: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
    # dependencies=[Depends(Auth.is_admin)],
)
async def approve_physician(
    physician_id: str,
):
    """
    Validate a physician.

    This will allow superusers to approve physicians.

    This path operation will:

    * Validate a physician.
    * Change the "approved" field from Physicians from "pending" to "approved".
    * Throw an error if the validation fails.
    """
    try:
        validated_id = Physician.approve_physician(physician_id)
        validated_phyisician = Physician.get_by_id(validated_id)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "detail": "Physician validated successfully",
                "approved_physician": validated_phyisician,
            },
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/deny-physician/{physician_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessfullValidationResponse,
    responses={
        401: {"model": ValidationErrorResponse},
        500: {"model": ValidationErrorResponse},
    },
    # dependencies=[Depends(Auth.is_admin)],
)
async def deny_physician(
    physician_id: str,
):
    """
    Validate a physician.

    This will allow superusers to approve physicians.

    This path operation will:

    * Validate a physician.
    * Change the "approved" field from Physicians from "pending" to "approved".
    * Throw an error if the validation fails.
    """
    try:
        denied_id = Physician.deny_physician(physician_id)
        denied_phyisician = Physician.get_by_id(denied_id)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "detail": "Physician denied successfully",
                "approved_physician": denied_phyisician,
            },
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )