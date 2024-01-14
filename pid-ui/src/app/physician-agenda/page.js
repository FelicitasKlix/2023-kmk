"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import ConfirmationModal from "../components/ConfirmationModal";
import { redirect } from "../components/userCheck";
import { toast } from "react-toastify";

const PhysicianAgenda = () => {
    const [isLoading, setIsLoading] = useState(true);
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [appointments, setAppointments] = useState([]);
    const [isAddObservationModalOpen, setIsAddObervationModalOpen] =
        useState(false);
    const [patientId, setPatientId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [newObservationContent, setNewObservationContent] = useState("");
    const [appointmentAttended, setAppointmentAttended] = useState(true);
    const [appointmentToClose, setAppointmentToClose] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
    const [disabledCloseAppointmentButton, setDisabledCloseAppointmentButton] =
        useState(false);
    const [studies, setStudies] = useState([]);
    const [study, setStudy] = useState("");
    const [labs, setLabs] = useState([]);
    const [lab, setLab] = useState("");
    const [detail, setNewDetailContent] = useState("");

    const [reviews, setReviews] = useState({
        puntuality: {
            name: "Puntualidad",
            rating: -1,
        },
        cleanliness: {
            name: "Limpieza",
            rating: -1,
        },
        attendance: {
            name: "Asistencia",
            rating: -1,
        },
        treat: {
            name: "Trato",
            rating: -1,
        },
        communication: {
            name: "Comunicacion",
            rating: -1,
        },
    });

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(
                `${apiURL}appointments/physician`,
                {
                    httpsAgent: agent,
                }
            );
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            toast.error("Error al obtener los turnos");
            console.error(error);
        }
    };

    const handleOpenAppointmentClosureModal = (appointment) => {
        setIsAddObervationModalOpen(true);
        setAppointmentToClose(appointment);
        setPatientId(appointment.patient.id);
    };

    const handleAppointmentClosure = async () => {
        setDisabledCloseAppointmentButton(true);
        console.log(appointmentToClose.id);
        console.log(appointmentAttended);
        console.log(startTime);
        let hour = startTime.split(":")[0];
        let minutes = startTime.split(":")[1];
        let date = new Date(appointmentToClose.date * 1000);
        date.setHours(hour);
        date.setMinutes(minutes);
        console.log((date.getTime() / 1000).toString());

        try {
            const response = await axios.put(
                `${apiURL}appointments/close-appointment/${appointmentToClose.id}`,
                {
                    attended: appointmentAttended,
                    start_time: (date.getTime() / 1000).toString(),
                },
                {
                    httpsAgent: agent,
                }
            );
        } catch (error) {
            toast.error("Error al cerrar el turno");
            console.error(error);
        }

        try{
            const response = await axios.post(
                `${apiURL}studies/request`,
                {
                    title: study,
                    appointment_id: appointmentToClose.id,
                    laboratory_id: lab,
                    details: detail
                },
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Estudio solicitado exitosamente");
        } catch(error){
            console.error(error);
            toast.error("Error al solicitar estudio");
        }

        try {
            const response = await axios.post(
                `${apiURL}records/update`,
                {
                    appointment_id: appointmentToClose.id,
                    attended: appointmentAttended.toString(),
                    real_start_time: (date.getTime() / 1000).toString(),
                    observation: newObservationContent,
                },
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Turno cerrado exitosamente");
            fetchAppointments();
            setIsAddObervationModalOpen(false);
        } catch (error) {
            toast.error("Error al agregar la observación");
            console.error(error);
        }
        try {
            let reviewsToSend = {};
            Object.keys(reviews).forEach((review) => {
                if (reviews[review].rating >= 0)
                    reviewsToSend[review] = reviews[review].rating;
            });
            console.log(reviewsToSend);
            const response = await axios.post(
                `${apiURL}users/add-score`,
                {
                    appointment_id: appointmentToClose.id,
                    ...reviewsToSend,
                },
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Puntaje cargado exitosamente");
        } catch (error) {
            toast.error("Error al agregar la puntaje");
            console.error(error);
        }
        setDisabledCloseAppointmentButton(false);
    };

    const handleDeleteClick = (appointmentId) => {
        setAppointmentIdToDelete(appointmentId);
        setShowModal(true);
    };

    const handleDeleteAppointment = async () => {
        setShowModal(false);
        toast.info("Eliminando turno...");
        try {
            await axios.delete(
                `${apiURL}appointments/${appointmentIdToDelete}`,
                {
                    httpsAgent: agent,
                }
            );
            toast.success("Turno eliminado exitosamente");
            fetchAppointments();
            setAppointmentIdToDelete(null); // Limpiar el ID del turno después de eliminar
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar turno");
        }
    };

    const fetchStudies = async () => {
        const response = await axios.get(`${apiURL}studies`, {
            httpsAgent: agent,
        });
        console.log(response.data.studies);
        response.data.studies == undefined
            ? setStudies([])
            : setStudies(response.data.studies);
    };

    const fetchLabs = async () => {
        const response = await axios.get(`${apiURL}labs/approved-laboratories`, {
            httpsAgent: agent,
        });
        console.log(response.data);
        response.data.appoved_laboratories == undefined
            ? setLabs([])
            : setLabs(response.data.appoved_laboratories);
    };

    const MODAL_STYLES = {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
        marginTop: "6rem",
    };

    const OVERLAY_STYLE = {
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0, .8)",
        zIndex: "1000",
        overflowY: "auto",
        marginTop: "6rem",
    };

    const handleCloseEditModal = () => {
        setIsAddObervationModalOpen(false);
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        fetchAppointments()
            .then(() => setIsLoading(false)) // Marcar como cargado cuando la respuesta llega
            .catch(() => {
                setIsLoading(false); // Asegúrate de marcar como cargado en caso de error
            });

        fetchStudies();
        fetchLabs();
    }, []);

    return (
        <div className={styles.dashboard}>
            {isAddObservationModalOpen && (
                <Modal
                    ariaHideApp={false}
                    isOpen={isAddObservationModalOpen}
                    onRequestClose={handleCloseEditModal}
                    // style={customStyles}
                >
                    <div
                        className={styles["new-record-section"]}
                        onSubmit={handleAppointmentClosure}
                    >
                        <div className={styles["title"]}>Gestion del Turno</div>
                        <div className={styles["appointment"]}>
                            <div className={styles["subtitle"]}>
                                El paciente fue atendido?
                            </div>
                            <select
                                className={styles["select"]}
                                name='attended'
                                id='attended'
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setAppointmentAttended(e.target.value);
                                }}
                            >
                                <option value={true}>Si</option>
                                <option value={false}>No</option>
                            </select>

                            <div className={styles["subtitle"]}>
                                Horario real de atencion:{" "}
                            </div>

                            <input
                                type='time'
                                id='time'
                                name='time'
                                onChange={(date) => {
                                    setStartTime(date.target.value.toString());
                                    console.log(date.target.value.toString());
                                }}
                                disabled={appointmentAttended == "false"}
                                required
                                className={`${
                                    appointmentAttended == "false"
                                        ? styles["disabled-input"]
                                        : ""
                                }`}
                            />

                            <div className={styles["subtitle"]}>
                                Observaciones
                            </div>

                            <textarea
                                id='observation'
                                value={newObservationContent}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setNewObservationContent(e.target.value);
                                }}
                                placeholder='Escribe una nueva observación'
                                required
                                className={`${styles["observation-input"]} ${
                                    appointmentAttended === "false"
                                        ? styles["disabled-input"]
                                        : ""
                                }`}
                                wrap='soft'
                                disabled={appointmentAttended == "false"}
                            />
                        </div>
                        </div>
                        <div
                        className={styles["studies-request-section"]}
                        //onSubmit={handleStudiesRequest}
                    >
                        <div className={styles["title"]}>Laboratorios</div>
                        <div className={styles["appointment"]}>
                            <div className={styles["subtitle"]}>
                                Seleccione un estudio:
                            </div>
                            <select
                                className={styles["select"]}
                                //name='study'
                                id='study'
                                value={study}
                                required
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setStudy(e.target.value);
                                }}
                            >
                                <option value=''>Selecciona un estudio</option>
                                {studies.map((study) => (
                                    <option key={study} value={study}>
                                        {study
                                            .charAt(0)
                                            .toUpperCase() +
                                            study.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <div className={styles["subtitle"]}>
                                Seleccione un laboratorio:{" "}
                            </div>
                            <select
                                className={styles["select"]}
                                //name='study'
                                id='laboratorio'
                                value={lab}
                                required
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setLab(e.target.value);
                                }}
                            >
                                <option value=''>Selecciona un laboratorio</option>
                                {labs.map((lab) => (
                                    <option key={lab.id} value={lab.id}>
                                        {lab.id}
                                        {/* {lab.email
                                            .charAt(0)
                                            .toUpperCase() +
                                            (lab.email).slice(1)} */}
                                    </option>
                                ))}
                            </select>

                            <div className={styles["subtitle"]}>
                                Detalle
                            </div>

                            <textarea
                                id='detalle'
                                value={detail}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setNewDetailContent(e.target.value);
                                }}
                                placeholder='Escribe un detalle del estudio'
                                required
                                className={`${styles["observation-input"]} ${
                                    appointmentAttended === "false"
                                        ? styles["disabled-input"]
                                        : ""
                                }`}
                                wrap='soft'
                                disabled={appointmentAttended == "false"}
                            />
                        </div>

                        <div
                            key={reviews.key}
                            className={styles["reviews-container"]}
                        >
                            {Object.keys(reviews).length > 0 ? (
                                <>
                                    {Object.keys(reviews).map((review) => (
                                        <div
                                            key={review}
                                            className={styles["review"]}
                                        >
                                            <div
                                                className={
                                                    styles[
                                                        "review-cards-container"
                                                    ]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["review-card"]
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles[
                                                                "review-card-title"
                                                            ]
                                                        }
                                                    >
                                                        {reviews[review].name}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                "review-card-content"
                                                            ]
                                                        }
                                                    >
                                                        <select
                                                            onChange={(e) =>
                                                                setReviews({
                                                                    ...reviews,
                                                                    [review]: {
                                                                        name: reviews[
                                                                            review
                                                                        ].name,
                                                                        rating: Number(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ),
                                                                    },
                                                                })
                                                            }
                                                        >
                                                            <option value={-1}>
                                                                N/A
                                                            </option>
                                                            <option value={0}>
                                                                Muy Malo
                                                            </option>
                                                            <option value={1}>
                                                                Malo
                                                            </option>
                                                            <option value={2}>
                                                                Neutro
                                                            </option>
                                                            <option value={3}>
                                                                Bueno
                                                            </option>
                                                            <option value={4}>
                                                                Muy Bueno
                                                            </option>
                                                            <option value={5}>
                                                                Excelente
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                // If there are no reviews, display the message
                                <div className={styles["subtitle"]}>
                                    No hay reviews
                                </div>
                            )}
                        </div>

                        <button
                            className={`${styles["edit-button"]} ${
                                !newObservationContent ||
                                !startTime ||
                                disabledCloseAppointmentButton
                                    ? styles["disabled-button"]
                                    : ""
                            }`}
                            onClick={handleAppointmentClosure}
                            disabled={
                                !newObservationContent ||
                                !startTime ||
                                disabledCloseAppointmentButton
                            }
                        >
                            Agregar
                        </button>
                    </div>
                </Modal>
            )}

            <PhysicianTabBar highlight={"TurnosDelDia"} />

            <Header role='physician' />

            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className={styles["tab-content"]}>
                        <div className={styles.form}>
                            <div className={styles["title"]}>
                                Mis Proximos Turnos
                            </div>
                            <Image
                                src='/refresh_icon.png'
                                alt='Refrescar'
                                className={styles["refresh-icon"]}
                                width={200}
                                height={200}
                                onClick={() => {
                                    toast.info("Actualizando...");
                                    fetchAppointments();
                                }}
                            />
                            <div className={styles["appointments-section"]}>
                                {appointments.length > 0 ? (
                                    // If there are appointments, map through them and display each appointment
                                    <div>
                                        {/* ... */}
                                        {appointments.map((appointment) => (
                                            <div
                                                key={appointment.id}
                                                className={
                                                    styles["appointment"]
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles["subtitle"]
                                                    }
                                                >
                                                    Paciente:{" "}
                                                    {appointment.patient
                                                        .first_name +
                                                        " " +
                                                        appointment.patient
                                                            .last_name}
                                                </div>
                                                <p>
                                                    Fecha y hora:
                                                    {new Date(
                                                        appointment.date * 1000
                                                    ).toLocaleString("es-AR")}
                                                </p>
                                                <div
                                                    className={
                                                        styles[
                                                            "appointment-buttons-container"
                                                        ]
                                                    }
                                                >
                                                    <button
                                                        className={
                                                            styles[
                                                                "standard-button"
                                                            ]
                                                        }
                                                        onClick={() => {
                                                            handleOpenAppointmentClosureModal(
                                                                appointment
                                                            );
                                                        }}
                                                    >
                                                        Finalizar Turno
                                                    </button>
                                                    <Link
                                                        href={{
                                                            pathname:
                                                                "/medical-records?patientId",
                                                            query: appointment
                                                                .patient.id,
                                                        }}
                                                        as={`medical-records?patientId=${appointment.patient.id}`}
                                                    >
                                                        <button
                                                            className={
                                                                styles[
                                                                    "standard-button"
                                                                ]
                                                            }
                                                        >
                                                            Ver Historia Clinica
                                                        </button>
                                                    </Link>

                                                    <button
                                                        className={
                                                            styles[
                                                                "delete-button"
                                                            ]
                                                        }
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                appointment.id
                                                            )
                                                        }
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // If there are no appointments, display the message
                                    <div className={styles["subtitle"]}>
                                        No hay turnos pendientes
                                    </div>
                                )}
                                {/* ... */}
                            </div>
                            {/* Modal de confirmación */}
                            <ConfirmationModal
                                isOpen={showModal}
                                closeModal={() => setShowModal(false)}
                                confirmAction={handleDeleteAppointment}
                                message='¿Estás seguro de que deseas cancelar este turno?'
                            />
                        </div>
                    </div>

                    <Footer />
                </>
            )}
        </div>
    );
};

export default PhysicianAgenda;
