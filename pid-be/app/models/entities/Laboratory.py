from fastapi import status, HTTPException

from firebase_admin import firestore

db = firestore.client()

class Laboratory:
    role: str
    name: str
    last_name: str
    email: str
    id: str
    approved: str

    def __init__(
        self,
        role: str,
        name: str,
        last_name: str,
        email: str,
        id: str,
        approved: str = "pending",
    ):
        self.role = role
        self.name = name
        self.last_name = last_name
        self.email = email
        self.id = id
        self.approved = approved

    @staticmethod
    def get_by_id(id):
        return db.collection("laboratories").document(id).get().to_dict()
    
    @staticmethod
    def get_all():
        labs = db.collection("laboratories").get()
        return [lab.to_dict()["first_name"] for lab in labs]

    @staticmethod
    def is_laboratory(id):
        return db.collection("laboratories").document(id).get().exists

    @staticmethod
    def get_approved_labs():
        approved_labs = (
            db.collection("laboratories").where("approved", "==", "approved").get()
        )
        return [lab.to_dict() for lab in approved_labs]
    
    @staticmethod
    def get_pending_labs():
        pending_labs = (
            db.collection("laboratories").where("approved", "==", "pending").get()
        )
        return [lab.to_dict() for lab in pending_labs]
    
    @staticmethod
    def get_denied_labs():
        denied_labs = (
            db.collection("laboratories").where("approved", "==", "denied").get()
        )
        return [lab.to_dict() for lab in denied_labs]
    
    @staticmethod
    def get_laboratory_email(id):
        return db.collection("laboratories").document(id).get().to_dict()["email"]
    
    @staticmethod
    def get_laboratory_name(id):
        return db.collection("laboratories").document(id).get().to_dict()["first_name"], db.collection("laboratories").document(id).get().to_dict()["last_name"]

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
                "approved": self.approved,
            }
        )
