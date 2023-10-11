import time
from datetime import datetime
from config import *
from firebase_admin import firestore

if __name__ == "__main__":
    db = firestore.client()

    specialties = [
        "Cardiologia",
        "Dermatologia",
        "Endocrinologia",
        "Gastroenterologia",
        "Geriatria",
        "Ginecologia",
        "Hematologia",
        "Infectologia",
        "Nefrologia",
        "Neurologia",
        "Oftalmologia",
        "Oncologia",
        "Ortopedia",
        "Otorrinolaringologia",
        "Pediatria",
        "Pneumologia",
        "Psiquiatria",
        "Reumatologia",
        "Urologia",
    ]

    blood_types = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
    ]

    genders = ["Femenino", "Masculino", "Otro"]

    today_date = datetime.now().date()
    number_of_day_of_week = int(today_date.strftime("%w"))

    a_KMK_user_information = {
        "display_name": "KMK Test User",
        "email": "getPhysiciansBySpecialtyTestUser@kmk.com",
        "email_verified": True,
        "password": "verySecurePassword123",
    }

    a_patient_information = {
        "id": "apatientid",
        "name": "Patient",
        "last_name": "Test",
        "email": "aPatientEmail@kmk.com",
        "birth_date": "2000-01-01",
        "sex": genders[0],
        "blood_type": blood_types[0],
    }

    other_patient_information = {
        "id": "otherpatientid",
        "name": "OtherPatient",
        "last_name": "OtherTest",
        "email": "otherPatientEmail@kmk.com",
        "birth_date": "2012-12-19",
        "sex": genders[1],
        "blood_type": blood_types[3],
    }

    observation_one = {
        "date": "2023-01-01",
        "observations": "This is an observation",
    }

    observation_two = {
        "date": "2023-09-12",
        "observations": "This is another observation",
    }

    a_physician_information = {
        "approved": "Approved",
        "id": "avalidid",
        "first_name": "Doc",
        "last_name": "Docson",
        "email": "DocDocson@kmk.com",
        "specialty": specialties[0],
        "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    }

    another_physician_information = {
        "approved": "Approved",
        "id": "anothervalidid",
        "first_name": "Doc",
        "last_name": "Docson the Second",
        "email": "DocDocsonTheSecond@kmk.com",
        "specialty": specialties[0],
        "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
    }

    other_physician_information = {
        "approved": "Approved",
        "id": "othervalidid",
        "first_name": "Doc",
        "last_name": "Docson the Third",
        "email": "DocDocsonTheThird@kmk.com",
        "specialty": specialties[1],
        "agenda": {
            str(number_of_day_of_week): {"start": 8, "finish": 18.5},
            str((number_of_day_of_week + 1) % 7): {"start": 7, "finish": 16},
        },
    }

    db.collection("physicians").document(a_physician_information["id"]).set(
        a_physician_information
    )
    db.collection("physicians").document(another_physician_information["id"]).set(
        another_physician_information
    )
    db.collection("physicians").document(other_physician_information["id"]).set(
        other_physician_information
    )

    a_patient_data = {
        key: value
        for key, value in a_patient_information.items()
        if key not in ["birth_date", "sex", "blood_type"]
    }
    db.collection("patients").document(a_patient_information["id"]).set(a_patient_data)
    other_patient_data = {
        key: value
        for key, value in other_patient_information.items()
        if key not in ["birth_date", "sex", "blood_type"]
    }
    db.collection("patients").document(other_patient_information["id"]).set(
        other_patient_data
    )
    record_data = {
        key: value
        for key, value in a_patient_information.items()
        if key not in ["role", "email"]
    }
    record_data["observations"] = [observation_one, observation_two]
    db.collection("records").document(a_patient_information["id"]).set(record_data)

    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})

    for blood_type in blood_types:
        db.collection("blood_types").document().set({"type": blood_type})

    for gender in genders:
        db.collection("genders").document().set({"gender": gender})
