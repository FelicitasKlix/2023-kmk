from pydantic import BaseModel
from typing import Union


class GetStudiesResponse(BaseModel):
    studies: list[Union[str, None]]


class GetStudiesError(BaseModel):
    detail: str


class UpdateStudiesResponse(BaseModel):
    studies: list[Union[str, None]]


class UpdateStudiesError(BaseModel):
    detail: str

class RequestStudyResponse(BaseModel):
    message: str

class RequestStudyError(BaseModel):
    detail: str