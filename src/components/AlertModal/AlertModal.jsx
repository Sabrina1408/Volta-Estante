import React from 'react';
import Modal from '../Modal/Modal';
import styles from './AlertModal.module.css';

const AlertModal = ({ open, title = 'Aviso', message, onClose, okText = 'OK' }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.ok} onClick={onClose}>{okText}</button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;
