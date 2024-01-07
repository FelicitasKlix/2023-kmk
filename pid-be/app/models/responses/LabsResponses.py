from pydantic import BaseModel
from typing import Union


class GetLabsResponse(BaseModel):
    labs: list[Union[str, None]]


class GetLabsError(BaseModel):
    detail: str


class UpdateLabsResponse(BaseModel):
    labs: list[Union[str, None]]


class UpdateLabsError(BaseModel):
    detail: str