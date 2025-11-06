import { useState, useEffect } from 'react';
import styles from './ProfileCard.module.css';
import { FaEnvelope } from 'react-icons/fa';

const ProfileCard = ({ user, onSave, onCancel, isSaving, onLogout }) => {

  const [name, setName] = useState('');
  const [seboName, setSeboName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSeboName(user.nameSebo || '');
    }
  }, [user]);

  const isDirty = (
    (name || '').trim() !== ((user?.name || '')).trim() ||
    (seboName || '').trim() !== ((user?.nameSebo || '')).trim()
  );

  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ name, seboName });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data indisponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!user) {
    return <div className={styles.profileCardContainer}><p>Carregando perfil...</p></div>;
  }

  const isRoleAdmin = user.userRole === "Admin";
  const isRoleReader = user.userRole === "Reader";

  return (
    <div className={styles.profileCardContainer}>
      <form className={styles.profileCard} onSubmit={handleSave}>
        <header className={styles.cardHeader}>
          <h2 className={styles.title}>Informações do Perfil</h2>
          <p className={styles.subtitle}>Visualize e edite suas informações pessoais</p>
        </header>

        <main className={styles.cardContent}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Nome Completo</label>
              <input id="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <div className={styles.inputWrapper}>
                <FaEnvelope className={styles.inputIcon} />
                <input id="email" type="email" value={user.email} readOnly className={styles.readOnlyInput} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="seboName">Nome do Sebo</label>
              <input 
                id="seboName" 
                type="text" 
                value={seboName} 
                onChange={(e) => setSeboName(e.target.value)}
                readOnly={isRoleReader}
                className={isRoleReader ? styles.readOnlyInput : ''}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Função</label>
              <div className={styles.inputWrapper}>
                <input
                  id="role"
                  type="text"
                  value={user.userRole || 'N/A'}
                  readOnly
                  className={`${styles.readOnlyInput} ${styles.roleTag} ${isRoleAdmin ? styles.adminRole : ''}`}
                />
              </div>
            </div>
          </div>

          <p className={styles.memberSince}>
            Membro desde {formatDate(user.registeredAt)}
          </p>
        </main>

        <footer className={styles.cardFooter}>
          <div className={styles.leftActions}>
            <button type="button" className={styles.logoutButton} onClick={onLogout}>
              Sair da Conta
            </button>
          </div>
          <div className={styles.rightActions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving || !isDirty}
              aria-disabled={isSaving || !isDirty}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
};

export default ProfileCard;