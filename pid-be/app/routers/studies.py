import requests
from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.models.entities.Auth import Auth
from app.models.entities.Admin import Admin
from app.models.entities.Study import Study
from app.models.entities.MedicalStudy import MedicalStudy
from app.models.entities.Appointment import Appointment
from app.models.entities.Laboratory import Laboratory
from app.models.entities.Physician import Physician
from app.models.entities.Patient import Patient
from app.models.responses.StudiesResponses import (
    GetStudiesResponse,
    GetStudiesError,
    UpdateStudiesResponse,
    UpdateStudiesError,
    RequestStudyResponse,
    RequestStudyError,
    ChangeStudyStatusResponse,
    ChangeStudyStatusError,
)
from app.models.requests.StudyRequests import (StudyRequest, UpdateStudyRequest)

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
def add_study(
    study_name: str,
    uid=Depends(Auth.is_admin),
):
    """
    Add a new study.

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
    

@router.post(
    "/request",
    status_code=status.HTTP_200_OK,
    response_model=RequestStudyResponse,
    responses={
        400: {"model": RequestStudyError},
        401: {"model": RequestStudyError},
        403: {"model": RequestStudyError},
        500: {"model": RequestStudyError},
    },
)
def request_study(
    study_request_info: StudyRequest,
    uid=Depends(Auth.is_logged_in),
):
    """
    Request a new study.

    This will allow authenticated physicians to request new studies from different laboratories.

    This path operation will:

    * Add the new study.
    * Throw an error if it fails.
    """
    try:
        physician_id = Appointment.get_physician_from_appointment(study_request_info.appointment_id)
        patient_id = Appointment.get_patient_from_appointment(study_request_info.appointment_id)
        final_data = {
            key:value
            for key, value in study_request_info.model_dump().items()
            if key not in ["appointment_id"]
        }
        final_data["physician_id"] = physician_id
        final_data["patient_id"] = patient_id
        study = MedicalStudy(**final_data)
        study.create()
        lab_email = Laboratory.get_laboratory_email(study_request_info.laboratory_id)
        requests.post(
            #"http://localhost:9000/emails/send",
            "https://two023-kmk-45yo.onrender.com/emails/send",
            json={
                "type": "REQUESTED_STUDY",
                "data": {
                    "email": lab_email,
                    "title": study_request_info.title,
                    "details": study_request_info.details,
                },
            },
        )
        return {"message": "Successfull request"}
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
    "/start/{study_id}",
    status_code=status.HTTP_200_OK,
    response_model=ChangeStudyStatusResponse,
    responses={
        400: {"model": ChangeStudyStatusError},
        401: {"model": ChangeStudyStatusError},
        403: {"model": ChangeStudyStatusError},
        500: {"model": ChangeStudyStatusError},
    },
)
def start_study(
    study_id: str,
    uid=Depends(Auth.is_logged_in),
):
    """
    Changes study status to in-progress.

    This will allow authenticated labs to change the status of a study.

    This path operation will:

    * Change the study status to in-progress.
    * Throw an error if it fails.
    """
    try:
        MedicalStudy.start_medical_study(study_id)
        return {"message": "Successfull request"}
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
    "/finish/{study_id}",
    status_code=status.HTTP_200_OK,
    response_model=ChangeStudyStatusResponse,
    responses={
        400: {"model": ChangeStudyStatusError},
        401: {"model": ChangeStudyStatusError},
        403: {"model": ChangeStudyStatusError},
        500: {"model": ChangeStudyStatusError},
    },
)
def finish_study(
    study_id: str,
    uid=Depends(Auth.is_logged_in),
):
    """
    Changes study status to finished.

    This will allow authenticated labs to change the status of a study.

    This path operation will:

    * Change the study status to finished.
    * Throw an error if it fails.
    """
    try:
        study_title = MedicalStudy.get_study_title(study_id)
        lab_details = MedicalStudy.get_study_notes(study_id)
        if(lab_details == None):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "No details provided"},
            )
        files = MedicalStudy.get_study_files(study_id)
        patient_id = MedicalStudy.get_patient_id_from_study_id(study_id)
        physician_id = MedicalStudy.get_physician_id_from_study_id(study_id)
        laboratory_id = MedicalStudy.get_laboratory_id_from_study_id(study_id)
        request_date = MedicalStudy.get_request_date_from_study_id(study_id)
        completion_date = MedicalStudy.get_completion_date_from_study_id(study_id)
        physician_name = Physician.get_name_and_last_name(physician_id)
        laboratory_name = Laboratory.get_laboratory_name(laboratory_id)
        MedicalStudy.finish_medical_study(study_id, study_title, lab_details, files, patient_id, physician_name, laboratory_name, request_date, completion_date)
        requests.post(
            #"http://localhost:9000/emails/send",
            "https://two023-kmk-45yo.onrender.com/emails/send",
            json={
                "type": "FINISHED_STUDY",
                "data": {
                    "email": Patient.get_email(patient_id),
                    "title": MedicalStudy.get_study_title(study_id),
                    "details": MedicalStudy.get_study_details(study_id),
                },
            },
        )
        return {"message": "Successful request"}
    except HTTPException as http_exception:
        return JSONResponse(
            status_code=http_exception.status_code,
            content={"detail": http_exception.detail},
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )
    
@router.post(
    "/update/{study_id}",
    status_code=status.HTTP_200_OK,
    response_model=ChangeStudyStatusResponse,
    responses={
        400: {"model": ChangeStudyStatusError},
        401: {"model": ChangeStudyStatusError},
        403: {"model": ChangeStudyStatusError},
        500: {"model": ChangeStudyStatusError},
    },
)
def finish_study(
    study_id: str,
    study_request_info: UpdateStudyRequest,
    uid=Depends(Auth.is_logged_in),
):
    """
    Uploads new information to a study.

    This will allow authenticated labs to add new information to a study.

    This path operation will:

    * Update some fields of the study .
    * Throw an error if it fails.
    """
    try:
        print(">>>>>>>>>>>>", study_request_info.files)
        #print(">>>>>>>>>>>>", study_request_info.file_url)
        MedicalStudy.update_study_details(study_id, study_request_info.lab_details, study_request_info.files)
        '''requests.post(
            "http://localhost:9000/emails/send",
            json={
                "type": "FINISHED_STUDY",
                "data": {
                    "email": Physician.get_email(physician_id),
                    "title": MedicalStudy.get_study_title(study_id),
                    "details": MedicalStudy.get_study_details(study_id),
                },
            },
        )'''
        return {"message": "Successfull request"}
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