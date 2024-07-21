from fastapi import status, HTTPException

from firebase_admin import firestore

#from app.models.entities.Appointment import Appointment

db = firestore.client()


class Patient:
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
        return db.collection("patients").document(id).get().to_dict()

    @staticmethod
    def is_patient(id):
        return db.collection("patients").document(id).get().exists
    
    @staticmethod
    def get_first_and_last_name(id):
        return db.collection("patients").document(id).get().to_dict()["first_name"], db.collection("patients").document(id).get().to_dict()["last_name"]
    
    @staticmethod
    def get_email(id):
        return db.collection("patients").document(id).get().to_dict()["email"]

    @staticmethod
    def has_pending_scores(id):
        pending_scores_doc = db.collection("patientsPendingToScore").document(id).get()
        #pending_scores_doc = db.collection("patientsPendingToScore").document(appointment_id).where("patient_id", "==", id)
        if not pending_scores_doc.exists:
            return False
        #pending_scores_query = db.collection("patientsPendingToScore").where("patient_id", "==", id)
        #pending_scores_docs = pending_scores_query.get()
        #appts = Appointment.get_all_closed_appointments_for_patient_with(id)
        appts = db.collection("appointments").where("patient_id", "==", id).where("status", "==", "closed").get()
        print(">>>>>>>>")
        print(len(appts)>0)
        print(pending_scores_doc.to_dict())
        #return len(pending_scores_doc.to_dict()) > 0
        return len(appts) > 0

    def create(self):
        if db.collection("patients").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user already exists",
            )
        db.collection("patients").document(self.id).set(
            {
                "id": self.id,
                "first_name": self.name,
                "last_name": self.last_name,
                "email": self.email,
            }
        )
