"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/styles.module.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import https from "https";
import { Header, Footer, PhysicianTabBar } from "../components/header";
import { toast } from "react-toastify";

const PhysicianPendingAppointments = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [appointments, setAppointments] = useState([]);
    useState(false);

    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${apiURL}appointments`, {
                httpsAgent: agent,
            });
            response.data.appointments == undefined
                ? setAppointments([])
                : setAppointments(response.data.appointments);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDenyAppointment = async (appointmentId) => {
        console.log(appointmentId);
        try {
            await axios.delete(`${apiURL}appointments/${appointmentId}`, {
                httpsAgent: agent,
            });
            toast.info("Turno eliminado exitosamente");
            fetchAppointments();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };

        // userCheck(router);
        fetchAppointments();
    }, []);

    return (
        <div className={styles.dashboard}>
            <Header />
            <PhysicianTabBar highlight={"TurnosPorAprobar"} />

            <div className={styles["tab-content"]}>
                <div className={styles.form}>
                    <div className={styles["title"]}>
                        Turnos solicitados sin confirmar
                    </div>
                    <Image
                        src="/refresh_icon.png"
                        alt="Notificaciones"
                        className={styles["refresh-icon"]}
                        width={200}
                        height={200}
                        onClick={() => {
                            fetchAppointments();
                            toast.info("Turnos actualizados");
                        }}
                    />
                    <div className={styles["appointments-section"]}>
                        {appointments.length > 0 ? (
                            // If there are appointments, map through them and display each appointment
                            <div>
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={styles["appointment"]}
                                    >
                                        <div className={styles["subtitle"]}>
                                            Paciente:{" "}
                                            {appointment.patient.first_name +
                                                " " +
                                                appointment.patient.last_name}
                                        </div>
                                        <p>
                                            Fecha y hora:{" "}
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
                                                    styles["approve-button"]
                                                }
                                                onClick={() => {}}
                                            >
                                                Confirmar{" "}
                                            </button>

                                            <button
                                                className={
                                                    styles["delete-button"]
                                                }
                                                onClick={() =>
                                                    handleDenyAppointment(
                                                        appointment.id
                                                    )
                                                }
                                            >
                                                Rechazar
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
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PhysicianPendingAppointments;
