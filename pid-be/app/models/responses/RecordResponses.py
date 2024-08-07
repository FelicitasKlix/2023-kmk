from pydantic import BaseModel
from typing import Union, List, Optional


class GetRecordError(BaseModel):
    detail: str


class BasicRecordResponse(BaseModel):
    name: str
    last_name: str
    birth_date: str
    gender: str
    blood_type: str
    id: str
    observations: list
    lab_details: Optional[list] = None


class GetRecordResponse(BaseModel):
    record: BasicRecordResponse

class RecordResponseWithLabData(BaseModel):
    name: str
    last_name: str
    birth_date: str
    gender: str
    blood_type: str
    id: str
    observations: list
    lab_details: list


class GetRecordResponseWithLabData(BaseModel):
    record: RecordResponseWithLabData