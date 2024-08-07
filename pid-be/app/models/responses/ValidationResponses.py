from pydantic import BaseModel
from typing import Union, Dict

from .PhysicianResponses import PhysicianResponse
from .LabsResponses import LaboratoryResponse


class SuccessfullValidationResponse(BaseModel):
    message: str


class ValidationErrorResponse(BaseModel):
    detail: str


class GetPendingValidationsError(BaseModel):
    detail: str


class AllPendingValidationsResponse(BaseModel):
    physicians_pending_validation: list[Union[PhysicianResponse, None]]


class AllWorkingPhysiciansResponse(BaseModel):
    physicians_working: list[Union[PhysicianResponse, None]]


class GetWorkingPhysiciansError(BaseModel):
    detail: str


class AllBlockedPhysiciansResponse(BaseModel):
    physicians_blocked: list[Union[PhysicianResponse, None]]


class GetBlockedPhysiciansError(BaseModel):
    detail: str


class AdminGetSpecialtyResponse(BaseModel):
    name: str
    physicians_count: int


class SuccessfulAdminSpecialtiesGetResponse(BaseModel):
    specialties: list[AdminGetSpecialtyResponse]


class AdminSpecialtiesGetError(BaseModel):
    detail: str


class AllLaboratoriesPendingValidationsResponse(BaseModel):
    laboratories_to_validate: list[Union[LaboratoryResponse, None]]

class AllApprovedLaboratoriesResponse(BaseModel):
    appoved_laboratories: list[Union[LaboratoryResponse, None]]

class AllDeniedLaboratoriesResponse(BaseModel):
    denied_laboratories: list[Union[LaboratoryResponse, None]]


class GetApprovedLaboratoriesError(BaseModel):
    detail: str

class GetDeniedLabsError(BaseModel):
    detail: str