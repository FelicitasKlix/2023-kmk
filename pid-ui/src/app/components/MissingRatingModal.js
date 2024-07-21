import React from 'react';
import Modal from 'react-modal';
import styles from '../styles/ConfirmationModal.module.css';

const MissingRatingModal = ({ isOpen, closeModal, confirmAction, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Puntuación"
            className={styles.modal}
            overlayClassName={styles.overlay}
            ariaHideApp={false}
        >
            <h2>Puntuar</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles["buttons-container"]}>
                <button onClick={closeModal} className={styles["cancel-button"]}>Cancelar</button>
                <button onClick={confirmAction} className={styles["confirm-button"]}>Confirmar</button>
            </div>
        </Modal>
    );
};

export default MissingRatingModal;
