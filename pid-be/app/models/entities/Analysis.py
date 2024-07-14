import time
from fastapi import UploadFile, HTTPException, status
from firebase_admin import storage, firestore

from app.models.entities.Patient import Patient
from app.models.entities.Laboratory import Laboratory

db = firestore.client()


class Analysis:
    analysis: list[UploadFile]
    uid: str
    patient_id: str

    # def __init__(self, analysis: list[UploadFile], uid: str):
    #     if not Patient.is_patient(uid):
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="User must be a patient to upload analysis",
    #         )
    #     self.analysis = analysis
    #     self.uid = uid

    def __init__(self, analysis: list[UploadFile], uid: str, patient_id: str = None):
        self.analysis = analysis
        self.uid = uid
        self.patient_id = patient_id if patient_id else uid
        print(patient_id)
        if not patient_id:
            if not Patient.is_patient(uid):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User must be a patient to upload analysis",
                )
            self.patient_id = uid
        else:
            if not Laboratory.is_laboratory(uid):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User must be a laboratory to upload analysis for a patient",
                )

    async def save(self):
        response_data = []
        bucket = storage.bucket()
        for analysis_to_upload in self.analysis:
            id = (
                db.collection("analysis")
                .document(self.uid)
                .collection("uploaded_analysis")
                .document()
                .id
            )
            blob = bucket.blob(
                f"analysis/{self.patient_id}/{id}.{analysis_to_upload.filename.split('.')[-1]}"
            )
            blob.upload_from_file(analysis_to_upload.file)
            blob.make_public()
            document_data_object = {
                "id": id,
                "file_name": analysis_to_upload.filename,
                "uploaded_at": round(time.time()),
                "url": blob.public_url,
            }
            db.collection("analysis").document(self.patient_id).collection(
                "uploaded_analysis"
            ).document(id).set(document_data_object)
            response_data.append(document_data_object)
        return response_data

    @staticmethod
    def get_all_for(uid):
        uploaded_analysis = (
            db.collection("analysis")
            .document(uid)
            .collection("uploaded_analysis")
            .get()
        )
        return list(map(lambda analysis: analysis.to_dict(), uploaded_analysis))
    
    @staticmethod
    def get_laboratory_analyses(patient_id, analysis_ids):
        print("hola hola hola")
        try:
            # Obtener referencia al documento del paciente
            patient_ref = db.collection("analysis").document(patient_id)
            
            # Filtrar los análisis por los IDs específicos proporcionados
            uploaded_analysis = (
                patient_ref
                .collection("uploaded_analysis")
                .where(firestore.FieldPath.document_id(), "in", analysis_ids)
                .get()
            )
            print("!!!!!!!!!!")
            print(analysis.to_dict() for analysis in uploaded_analysis)
            # Transformar los resultados a un formato listo para la respuesta
            return [analysis.to_dict() for analysis in uploaded_analysis]
        
        except Exception as e:
            print(f"Error fetching laboratory analyses: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error",
            )


    @staticmethod
    def delete(uid, id):
        analysis_doc = (
            db.collection("analysis")
            .document(uid)
            .collection("uploaded_analysis")
            .document(id)
            .get()
        )
        if not analysis_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="The file doesnt exists"
            )
        bucket = storage.bucket()
        blobs = list(bucket.list_blobs(prefix=f"analysis/{uid}/{id}"))
        blobs[0].delete()
        db.collection("analysis").document(uid).collection(
            "uploaded_analysis"
        ).document(id).delete()
