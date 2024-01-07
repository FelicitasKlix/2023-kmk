from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
from app.models.entities.Study import Study
from app.models.responses.StudiesResponses import (
    GetStudiesResponse,
    GetStudiesError,
    UpdateStudiesResponse,
    UpdateStudiesError,
)

router = APIRouter(
    prefix="/studies",
    tags=["Studies"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=GetStudiesResponse,
    responses={
        500: {"model": GetStudiesError},
    },
)
def get_all_studies():
    """
    Get all studies.

    This will allow authenticated users to retrieve all studies.

    This path operation will:

    * Return all the studies in the system.
    * Throw an error if specialty retrieving fails.
    """
    try:
        studies = Study.get_all()
        return {"studies": studies}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.post(
    "/add/{study_name}",
    status_code=status.HTTP_200_OK,
    response_model=UpdateStudiesResponse,
    responses={
        400: {"model": UpdateStudiesError},
        401: {"model": UpdateStudiesError},
        403: {"model": UpdateStudiesError},
        500: {"model": UpdateStudiesError},
    },
)
def add_specialty(
    study_name: str,
    uid=Depends(Auth.is_admin),
):
    """
    Add a new specialty.

    This will allow authenticated admins to add new studies.

    This path operation will:

    * Add the new study.
    * Return the updated list of studies.
    * Throw an error if it fails.
    """
    try:
        Study.add_study(study_name)
        updated_studies = Study.get_all()
        return {"studies": updated_studies}
    except HTTPException as http_exception:
        return JSONResponse(
            status_code=http_exception.status_code,
            content={"detail": http_exception.detail},
        )
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    

@router.delete(
    "/delete/{study_name}",
    status_code=status.HTTP_200_OK,
    response_model=UpdateStudiesResponse,
    responses={
        401: {"model": UpdateStudiesError},
        403: {"model": UpdateStudiesError},
        500: {"model": UpdateStudiesError},
    },
)
def delete_study(
    study_name: str,
    uid=Depends(Auth.is_admin),
):
    """
    Deletes a specialty.

    This will allow authenticated admins to delete specialties.

    This path operation will:

    * Delete the specialty.
    * Return the updated list of specialties.
    * Throw an error if it fails.
    """
    try:
        Study.delete_study(study_name)
        updated_studies = Study.get_all()
        return {"studies": updated_studies}
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )