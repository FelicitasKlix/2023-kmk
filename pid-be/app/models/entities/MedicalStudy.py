from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore
import time

db = firestore.client()


class MedicalStudy:
    title: str
    physician_id: str
    patient_id: str
    laboratory_id: str
    details: str
    request_date: int = None
    completion_date: int = None
    status: str
    file: str = None
    id: str = None
    lab_details: str = None

    def __init__(
        self,
        title: str,
        physician_id: str,
        patient_id: str,
        laboratory_id: str,
        details: str,
        request_date: int = None,
        completion_date: int = None,
        status: str = "pending",
        file: str = None,
        id: str = None,
        lab_details: str = None,
    ):
        self.title = title
        self.physician_id = physician_id
        self.patient_id = patient_id
        self.laboratory_id = laboratory_id
        self.details = details
        self.request_date = request_date
        self.completion_date = completion_date
        self.status = status
        self.file = file
        self.id = id
        self.lab_details = lab_details

    @staticmethod
    def get_by_id(id):
        return db.collection("medicalStudies").document(id).get().to_dict()


    @staticmethod
    def is_medical_study(id):
        return db.collection("medicalStudies").document(id).get().exists


    @staticmethod
    def start_medical_study(id):
        db.collection("medicalStudies").document(id).update({"status": "in-progress"})

    @staticmethod
    def finish_medical_study(id):
        completion_date = int(datetime.now().timestamp())  # Obtener la fecha actual en formato timestamp
        db.collection("medicalStudies").document(id).update({"status": "finished", "completion_date": completion_date})

    @staticmethod
    def get_pending_medical_studies():
        studies = db.collection("medicalStudies").where("status", "==", "pending").get()
        return [study.to_dict() for study in studies]
    
    @staticmethod
    def get_started_medical_studies():
        studies = db.collection("medicalStudies").where("status", "==", "in-progress").get()
        return [study.to_dict() for study in studies]
    
    @staticmethod
    def get_finished_medical_studies():
        studies = db.collection("medicalStudies").where("status", "==", "finished").get()
        return [study.to_dict() for study in studies]
    
    @staticmethod
    def get_pending_medical_studies_for_laboratory(laboratory_id):
        studies = db.collection("medicalStudies").where("laboratory_id", "==", laboratory_id).where("status", "==", "pending").get()
        return [study.to_dict() for study in studies]
    
    @staticmethod
    def get_started_medical_studies_for_laboratory(laboratory_id):
        studies = db.collection("medicalStudies").where("laboratory_id", "==", laboratory_id).where("status", "==", "in-progress").get()
        return [study.to_dict() for study in studies]
    
    @staticmethod
    def get_finished_medical_studies_for_laboratory(laboratory_id):
        studies = db.collection("medicalStudies").where("laboratory_id", "==", laboratory_id).where("status", "==", "finished").get()
        return [study.to_dict() for study in studies]
    
    @staticmethod
    def get_patient_id_from_study_id(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["patient_id"]
    
    @staticmethod
    def get_physician_id_from_study_id(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["physician_id"]
    
    @staticmethod
    def get_study_title(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["title"]
    
    @staticmethod
    def get_study_details(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["details"]
    
    @staticmethod
    def update_lab_details(study_id, lab_details):
        db.collection("medicalStudies").document(study_id).update({"lab_details": lab_details})

    @staticmethod
    def update_file(study_id, file):
        db.collection("medicalStudies").document(study_id).update({"file": file})

    @staticmethod
    def update_study_details(study_id, details, file=None):
        update_data = {"lab_details": details}
        if file is not None:
            update_data["file"] = file
        
        db.collection("medicalStudies").document(study_id).update(update_data)


    def create(self):
        if db.collection("medicalStudies").document(self.id).get().exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user already exists",
            )
        id = db.collection("medicalStudies").document().id
        db.collection("medicalStudies").document(id).set(
            {
                "id": id,
                "title": self.title,
                "physician_id": self.physician_id,
                "patient_id": self.patient_id,
                "laboratory_id": self.laboratory_id,
                "details": self.details,
                "request_date": round(time.time()),
                "completion_date": self.completion_date,
                "status": "pending",
                "file": self.file,
                "lab_details": self.lab_details,
            }
        )
        return self.id
