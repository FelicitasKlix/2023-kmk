from fastapi import status, HTTPException

from firebase_admin import firestore

db = firestore.client()

class Laboratory:
    role: str
    name: str
    last_name: str
    email: str
    id: str

    def __init__(
        self,
        role: str,
        name: str,
        last_name: str,
        email: str,
        id: str,
    ):
        self.role = role
        self.name = name
        self.last_name = last_name
        self.email = email
        self.id = id

    @staticmethod
    def get_by_id(id):
        return db.collection("laboratories").document(id).get().to_dict()

    @staticmethod
    def is_laboratory(id):
        return db.collection("laboratories").document(id).get().exists


    def create(self):
        if db.collection("laboratories").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The labpratory already exists",
            )
        db.collection("laboratories").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                "last_name": self.last_name,
                "email": self.email,
            }
        )
