from fastapi import HTTPException, status
from datetime import datetime
from firebase_admin import firestore
import time

from app.models.entities.Record import Record

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
    def finish_medical_study(id, study_title, lab_details, files, patient_id, physician_name, laboratory_name, request_date, completion_date):
        completion_date = int(datetime.now().timestamp())  # Obtener la fecha actual en formato timestamp
        db.collection("medicalStudies").document(id).update({"status": "finished", "completion_date": completion_date})
        Record.add_lab_details(patient_id, study_title, lab_details, files, patient_id, physician_name, laboratory_name, request_date, completion_date)

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
    def get_laboratory_id_from_study_id(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["laboratory_id"]
    
    @staticmethod
    def get_request_date_from_study_id(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["request_date"]
    
    @staticmethod
    def get_completion_date_from_study_id(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["completion_date"]
    
    @staticmethod
    def get_study_title(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["title"]
    
    @staticmethod
    def get_study_details(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["details"]
    
    @staticmethod
    def get_study_notes(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["lab_details"]
    
    @staticmethod
    def get_study_file_url(study_id):
        return db.collection("medicalStudies").document(study_id).get().to_dict()["file_url"]
    
    @staticmethod
    def get_study_files(study_id):
        study = db.collection("medicalStudies").document(study_id).get().to_dict()
        return study.get("files", [])  # Devuelve una lista vacía si no hay archivos
    
    @staticmethod
    def update_lab_details(study_id, lab_details):
        db.collection("medicalStudies").document(study_id).update({"lab_details": lab_details})

    @staticmethod
    def update_file(study_id, file):
        db.collection("medicalStudies").document(study_id).update({"file": file})

    @staticmethod
    def update_study_details(study_id, details, files=None):
        update_data = {"lab_details": details}
        if files is not None:
            #update_data["files"] = files
            files_data = [{"id": file.id, "url": file.url} for file in files]
            update_data["files"] = files_data
            #update_data["file"] = file
            #update_data["file_url"]= file_url
        #print("---------------------")
        #print(file)
        #print("---------------------")
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
