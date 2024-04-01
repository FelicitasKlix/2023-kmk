import re
from pydantic import BaseModel, Field, field_validator
from typing import Annotated, Literal, Union
from fastapi import Query


class StudyRequest(BaseModel):
    title: str
    appointment_id: str
    laboratory_id: str
    details: str
    request_date: int = None
    completion_date: int = None
    status: str = None
    file: str = None
    lab_details: str = None


class UpdateStudyRequest(BaseModel):
    file: str = None
    lab_details: str = None