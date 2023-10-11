import pytest
import time
from datetime import datetime, timedelta
import requests
from .config import *
from firebase_admin import auth, firestore

db = firestore.client()

today_date = datetime.fromtimestamp(round(time.time()))
number_of_day_of_week = int(today_date.date().strftime("%w"))
next_week_day = today_date + timedelta(days=7)
next_week_day_first_block = next_week_day.replace(hour=9)
next_week_day_second_block = next_week_day.replace(hour=10)
next_week_day_third_block = next_week_day.replace(hour=11)

specialties = [
    "pediatrics",
    "dermatology",
    "gastroenterology",
    "radiology",
    "urology",
    "ophtalmology",
    "endocrynology",
    "neurology",
    "cardiology",
    "family medicine",
    "psychiatry",
]


a_KMK_user_information = {
    "display_name": "KMK Test User",
    "email": "deleteApppointmentTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

another_KMK_user_information = {
    "display_name": "Second KMK Test User",
    "email": "deleteApppointmentSecondTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

other_KMK_user_information = {
    "display_name": "Third KMK Test User",
    "email": "deleteApppointmentThirdTestUser@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

a_KMK_physician_information = {
    "display_name": "First KMK Test Physician",
    "email": "deleteApppointmentFirstTestPhysician@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

another_KMK_physician_information = {
    "display_name": "Second KMK Test Physician",
    "email": "deleteApppointmentSecondTestPhysician@kmk.com",
    "email_verified": True,
    "password": "verySecurePassword123",
}

an_appointment_data = {
    "date": round(next_week_day_first_block.timestamp()),
}

another_appointment_data = {
    "date": round(next_week_day_second_block.timestamp()),
}

other_appointment_data = {
    "date": round(next_week_day_third_block.timestamp()),
}


@pytest.fixture(autouse=True)
def create_users():
    first_created_user = auth.create_user(**a_KMK_user_information)
    second_created_user = auth.create_user(**another_KMK_user_information)
    third_created_user = auth.create_user(**other_KMK_user_information)
    pytest.first_user_id = first_created_user.uid
    pytest.second_user_id = second_created_user.uid
    pytest.third_user_id = third_created_user.uid
    yield
    auth.delete_user(pytest.first_user_id)
    auth.delete_user(pytest.second_user_id)
    auth.delete_user(pytest.third_user_id)


@pytest.fixture(autouse=True)
def create_physicians(create_users):
    first_created_physician = auth.create_user(**a_KMK_physician_information)
    second_created_physician = auth.create_user(**another_KMK_physician_information)
    pytest.first_physician_id = first_created_physician.uid
    pytest.second_physician_id = second_created_physician.uid

    db.collection("physicians").document(pytest.first_physician_id).set(
        {
            **a_KMK_physician_information,
            "specialty": specialties[0],
            "approved": "approved",
            "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
        }
    )
    db.collection("physicians").document(pytest.second_physician_id).set(
        {
            **a_KMK_physician_information,
            "specialty": specialties[0],
            "approved": "approved",
            "agenda": {str(number_of_day_of_week): {"start": 8, "finish": 18.5}},
        }
    )
    yield
    auth.delete_user(pytest.first_physician_id)
    auth.delete_user(pytest.second_physician_id)
    db.collection("physicians").document(pytest.first_physician_id).delete()
    db.collection("physicians").document(pytest.second_physician_id).delete()


@pytest.fixture(autouse=True)
def create_test_environment(create_physicians):
    db.collection("patients").document(pytest.first_user_id).set(
        {"id": pytest.first_user_id, "first_name": "KMK", "last_name": "First"}
    )
    db.collection("patients").document(pytest.second_user_id).set(
        {
            "id": pytest.second_user_id,
            "first_name": "KMK",
            "last_name": "Second",
        }
    )
    db.collection("patients").document(pytest.third_user_id).set(
        {
            "id": pytest.third_user_id,
            "first_name": "KMK",
            "last_name": "Third",
        }
    )

    response_from_login_endpoint_for_first_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_user_information["email"],
            "password": a_KMK_user_information["password"],
        },
    )

    pytest.first_bearer = response_from_login_endpoint_for_first_user.json()["token"]

    response_from_login_endpoint_for_second_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": another_KMK_user_information["email"],
            "password": another_KMK_user_information["password"],
        },
    )

    pytest.second_bearer = response_from_login_endpoint_for_second_user.json()["token"]

    response_from_login_endpoint_for_third_user = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": other_KMK_user_information["email"],
            "password": other_KMK_user_information["password"],
        },
    )

    pytest.third_bearer = response_from_login_endpoint_for_third_user.json()["token"]

    first_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json={
            **an_appointment_data,
            "physician_id": pytest.first_physician_id,
        },
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    an_appointment_data["id"] = first_appointment_creation_response.json()[
        "appointment_id"
    ]

    second_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json={
            **another_appointment_data,
            "physician_id": pytest.second_physician_id,
        },
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    another_appointment_data["id"] = second_appointment_creation_response.json()[
        "appointment_id"
    ]

    third_appointment_creation_response = requests.post(
        "http://localhost:8080/appointments",
        json={
            **other_appointment_data,
            "physician_id": pytest.second_physician_id,
        },
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    other_appointment_data["id"] = third_appointment_creation_response.json()[
        "appointment_id"
    ]
    yield


@pytest.fixture(autouse=True)
def load_and_delete_specialties(create_test_environment):
    for specialty in specialties:
        db.collection("specialties").document().set({"name": specialty})
    yield
    specilaties_doc = db.collection("specialties").list_documents()
    for specialty_doc in specilaties_doc:
        specialty_doc.delete()


def test_delete_appointment_of_a_valid_appointment_returns_a_200_code():
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_delete_endpoint.status_code == 200


def test_delete_appointment_of_a_valid_appointment_returns_a_message_indicating_successful_deletion():
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert (
        response_to_delete_endpoint.json()["message"]
        == "Appointment cancelled successfully"
    )


def test_delete_appointment_of_a_valid_appointment_removes_appointment_from_firestore():
    assert (
        db.collection("appointments").document(an_appointment_data["id"]).get().exists
        == True
    )

    requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert (
        db.collection("appointments").document(an_appointment_data["id"]).get().exists
        == False
    )


def test_delete_appointment_with_no_authorization_header_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}"
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_empty_authorization_header_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": ""},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_empty_bearer_token_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer "},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_non_bearer_token_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": pytest.first_bearer},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_with_invalid_bearer_token_returns_401_code():
    response_to_appointment_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": "Bearer smth"},
    )

    assert response_to_appointment_delete_endpoint.status_code == 401
    assert (
        response_to_appointment_delete_endpoint.json()["detail"]
        == "User must be logged in"
    )


def test_delete_appointment_of_another_users_appointment_returns_a_400_code_and_message():
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {pytest.second_bearer}"},
    )

    assert response_to_delete_endpoint.status_code == 400
    assert response_to_delete_endpoint.json()["detail"] == "Invalid appointment id"


def test_delete_appointment_that_doent_exist_returns_a_400_code_and_message():
    response_to_delete_endpoint = requests.delete(
        "http://localhost:8080/appointments/invalidapointmentid",
        headers={"Authorization": f"Bearer {pytest.first_bearer}"},
    )

    assert response_to_delete_endpoint.status_code == 400
    assert response_to_delete_endpoint.json()["detail"] == "Invalid appointment id"


def test_delete_appointment_by_a_physician_by_the_physician_of_that_appointment_returns_a_200_code():
    physician_token = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        },
    ).json()["token"]
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {physician_token}"},
    )

    assert response_to_delete_endpoint.status_code == 200


def test_delete_appointment_by_a_physician_of_a_valid_appointment_returns_a_message_indicating_successful_deletion():
    physician_token = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        },
    ).json()["token"]
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {physician_token}"},
    )

    assert (
        response_to_delete_endpoint.json()["message"]
        == "Appointment cancelled successfully"
    )


def test_delete_appointment_by_a_physician_of_a_valid_appointment_removes_appointment_from_firestore():
    assert (
        db.collection("appointments").document(an_appointment_data["id"]).get().exists
        == True
    )

    physician_token = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": a_KMK_physician_information["email"],
            "password": a_KMK_physician_information["password"],
        },
    ).json()["token"]
    requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {physician_token}"},
    )

    assert (
        db.collection("appointments").document(an_appointment_data["id"]).get().exists
        == False
    )


def test_delete_appointment_by_a_physician_who_isnt_assigned_to_it_returns_a_400_code_and_message():
    physician_token = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": another_KMK_physician_information["email"],
            "password": another_KMK_physician_information["password"],
        },
    ).json()["token"]
    response_to_delete_endpoint = requests.delete(
        f"http://localhost:8080/appointments/{an_appointment_data['id']}",
        headers={"Authorization": f"Bearer {physician_token}"},
    )

    assert response_to_delete_endpoint.status_code == 400
    assert response_to_delete_endpoint.json()["detail"] == "Invalid appointment id"


def test_appointment_deletion_removes_date_reccord_from_physicians_object_in_firestore():
    assert (
        db.collection("physicians")
        .document(pytest.second_physician_id)
        .get()
        .to_dict()["appointments"]
        .get(str(another_appointment_data["date"]))
        == True
    )

    physician_token = requests.post(
        "http://localhost:8080/users/login",
        json={
            "email": another_KMK_physician_information["email"],
            "password": another_KMK_physician_information["password"],
        },
    ).json()["token"]
    requests.delete(
        f"http://localhost:8080/appointments/{another_appointment_data['id']}",
        headers={"Authorization": f"Bearer {physician_token}"},
    )

    assert (
        db.collection("physicians")
        .document(pytest.second_physician_id)
        .get()
        .to_dict()["appointments"]
        .get(str(another_appointment_data["date"]))
        == None
    )