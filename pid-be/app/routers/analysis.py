from fastapi import APIRouter, status, Depends, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import Union

from app.models.entities.Auth import Auth
from app.models.entities.Analysis import Analysis
from app.models.entities.Patient import Patient
from app.models.entities.Physician import Physician
from app.models.entities.Laboratory import Laboratory
from app.models.responses.AnalysisResponses import (
    AnalysisErrorResponse,
    SuccessfullAnalysisResponse,
    AnalysisGetErrorResponse,
    SuccessfulAnalysisDeletionResponse,
)

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=list[Union[SuccessfullAnalysisResponse, None]],
    responses={
        401: {"model": AnalysisErrorResponse},
        500: {"model": AnalysisErrorResponse},
    },
)
async def upload_analysis(analysis: list[UploadFile], uid=Depends(Auth.is_logged_in)):
    analysis = Analysis(analysis=analysis, uid=uid)
    try:
        saved_analysis = await analysis.save()
        return saved_analysis
    except HTTPException as http_exception:
        return http_exception
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    
# @router.post(
#     "/{patient_id}",
#     status_code=status.HTTP_201_CREATED,
#     response_model=list[Union[SuccessfullAnalysisResponse, None]],
#     responses={
#         401: {"model": AnalysisErrorResponse},
#         500: {"model": AnalysisErrorResponse},
#     },
# )
# async def upload_analysis(patient_id: str, analysis: list[UploadFile], uid=Depends(Auth.is_logged_in)):
#     analysis = Analysis(analysis=analysis, uid=uid, patient_id=patient_id)
#     try:
#         saved_analysis = await analysis.save()
#         return saved_analysis
#     except HTTPException as http_exception:
#         return http_exception
#     except:
#         return JSONResponse(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             content={"detail": "Internal server error"},
#         )


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[SuccessfullAnalysisResponse],
    responses={
        401: {"model": AnalysisGetErrorResponse},
        403: {"model": AnalysisGetErrorResponse},
        500: {"model": AnalysisGetErrorResponse},
    },
)
def get_all_analysis(uid=Depends(Auth.is_logged_in)):
    try:
        if not Patient.is_patient(uid):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Only patients can view their analysis"},
            )
        return Analysis.get_all_for(uid=uid)
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.get(
    "/{patient_id}",
    status_code=status.HTTP_200_OK,
    response_model=list[SuccessfullAnalysisResponse],
    responses={
        401: {"model": AnalysisGetErrorResponse},
        500: {"model": AnalysisGetErrorResponse},
    },
)
def get_all_analysis(patient_id: str, uid=Depends(Auth.is_logged_in)):
    try:
        if not (Physician.is_physician(uid) or Laboratory.is_laboratory(uid)):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Only physicians or laboratories can view their analysis"},
            )
        return Analysis.get_all_for(uid=patient_id)
    except:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


@router.delete(
    "/{analysis_id}",
    status_code=status.HTTP_200_OK,
    response_model=SuccessfulAnalysisDeletionResponse,
    responses={
        400: {"model": AnalysisErrorResponse},
        401: {"model": AnalysisErrorResponse},
        500: {"model": AnalysisErrorResponse},
    },
)
def delete_analysis(analysis_id: str, uid=Depends(Auth.is_logged_in)):
    try:
        Analysis.delete(uid, analysis_id)
        return {"message": "Analysis has been deleted successfully"}
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

@router.post(
    "/lab-upload",
    status_code=status.HTTP_201_CREATED,
    response_model=list[Union[SuccessfullAnalysisResponse, None]],
    responses={
        401: {"model": AnalysisErrorResponse},
        403: {"model": AnalysisErrorResponse},
        500: {"model": AnalysisErrorResponse},
    },
)
async def lab_upload_analysis(
    patient_id: str = Form(...),
    analysis: list[UploadFile] = Form(...),
    uid=Depends(Auth.is_logged_in)
):
    if not Laboratory.is_laboratory(uid):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be a laboratory to upload analysis",
        )

    #analysis = Analysis(analysis=analysis, uid=patient_id)  # Usamos patient_id en lugar de uid
    print(patient_id)
    #analysis = Analysis(analysis=analysis, uid=uid, patient_id=patient_id)
    analysis_obj = Analysis(analysis=analysis, uid=uid, patient_id=patient_id)
    try:
        saved_analysis = await analysis_obj.save()
        print(saved_analysis)
        return saved_analysis
    except HTTPException as http_exception:
        return http_exception
    except Exception as e:
        print(f"Internal server error: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

