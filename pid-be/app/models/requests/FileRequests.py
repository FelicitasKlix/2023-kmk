from pydantic import BaseModel
from typing import Union, List, Optional

class FileRequest(BaseModel):
    patient_id: str
    file_ids: List[str]