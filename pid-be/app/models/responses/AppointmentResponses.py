from pydantic import BaseModel

from .PhysicianResponses import PhysicianResponse
from .PatientResponses import PatientResponse
from app.models.entities.Physician import Physician
from app.models.entities.Patient import Patient


class SuccessfulAppointmentCreationResponse(BaseModel):
    appointment_id: str


class AppointmentCreationError(BaseModel):
    detail: str


class GetAppointmentError(BaseModel):
    detail: str


class BasicAppointmentResponse(BaseModel):
    id: str
    date: int
    physician: PhysicianResponse
    patient: PatientResponse
    created_at: int

    def __init__(self, **data):
        physician = Physician.get_by_id(data["physician_id"])
        data["physician"] = PhysicianResponse(**physician).dict()

        patient = Patient.get_by_id(data["patient_id"])
        data["patient"] = PatientResponse(**patient).dict()
        super().__init__(**data)


class AllAppointmentsResponse(BaseModel):
    appointments: list[BasicAppointmentResponse]