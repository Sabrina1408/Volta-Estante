import { useState, useEffect } from 'react';
import styles from './ProfileCard.module.css';
import { FaEnvelope } from 'react-icons/fa';

const ProfileCard = ({ user, onSave, onCancel, isSaving }) => {
  // Estado para os campos editáveis do formulário
  const [name, setName] = useState('');
  const [seboName, setSeboName] = useState('');

  // Popula o formulário com os dados do usuário quando o componente é montado ou o usuário muda
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSeboName(user.nameSebo || '');
    }
  }, [user]);

  // Função para lidar com o salvamento das alterações
  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ name, seboName });
    }
  };

  // Função para formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data indisponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Renderiza um estado de carregamento se não houver dados do usuário
  if (!user) {
    return <div className={styles.profileCardContainer}><p>Carregando perfil...</p></div>;
  }

  const isRoleAdmin = user.userRole === 'ADMIN';

  return (
    <div className={styles.profileCardContainer}>
      <form className={styles.profileCard} onSubmit={handleSave}>
        <header className={styles.cardHeader}>
          <h2 className={styles.title}>Informações do Perfil</h2>
          <p className={styles.subtitle}>Visualize e edite suas informações pessoais</p>
        </header>

        <main className={styles.cardContent}>
          <div className={styles.formGrid}>
            {/* Campo Nome Completo */}
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Nome Completo</label>
              <input id="fullName" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* Campo E-mail */}
            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <div className={styles.inputWrapper}>
                <FaEnvelope className={styles.inputIcon} />
                <input id="email" type="email" value={user.email} readOnly className={styles.readOnlyInput} />
              </div>
            </div>

            {/* Campo Nome do Sebo */}
            <div className={styles.formGroup}>
              <label htmlFor="seboName">Nome do Sebo</label>
              <input id="seboName" type="text" value={seboName} onChange={(e) => setSeboName(e.target.value)} />
            </div>

            {/* Campo Função */}
            <div className={styles.formGroup}>
              <label htmlFor="role">Função</label>
              <div 
                id="role" 
                className={`${styles.readOnlyInput} ${styles.roleTag} ${isRoleAdmin ? styles.adminRole : ''}`}
              >
                {isRoleAdmin ? 'Administrador' : user.userRole}
              </div>
            </div>
          </div>

          <p className={styles.memberSince}>
            Membro desde {formatDate(user.memberSince)}
          </p>
        </main>

        <footer className={styles.cardFooter}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className={styles.saveButton} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default ProfileCard;