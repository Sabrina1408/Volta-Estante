import React from 'react';
import Modal from '../Modal/Modal';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ open, title = 'Confirmar', message, onClose, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>{cancelText}</button>
          <button className={`${styles.confirm} ${variant === 'danger' ? styles.danger : ''}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;