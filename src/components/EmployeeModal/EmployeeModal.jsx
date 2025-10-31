import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import styles from './EmployeeModal.module.css';
import { FaTimes } from 'react-icons/fa';
import AlertModal from '../AlertModal/AlertModal';

const EmployeeModal = ({ isOpen, onClose, employee }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('Editor');
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    title: '',
    message: '',
    isSuccess: false,
  });

  const { authFetch } = useApi();
  const queryClient = useQueryClient();
  const isEditing = !!employee;

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setUserRole(employee.userRole || 'Editor');
    } else {
      setName('');
      setEmail('');
      setUserRole('Editor');
    }
  }, [employee, isOpen]);

  const { mutate: addEmployee, isLoading: isAdding } = useMutation({
    mutationFn: (newEmployee) =>
      authFetch(`/users/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      const { employee_user, temporary_password, password_reset_link } = data;
      setAlertInfo({
        open: true,
        title: 'Funcionário Adicionado com Sucesso!',
        message: `O funcionário ${employee_user.name} foi adicionado. <br /> Senha temporária: <strong>${temporary_password}</strong> <br /> Peça para que o usuário acesse o link para redefinir a senha: <a href='${password_reset_link}' target='_blank' rel='noopener noreferrer'>Redefinir Senha</a>`,
        isSuccess: true,
      });
      queryClient.invalidateQueries(['employees']);
      setTimeout(onClose, 5000);
    },
    onError: (err) => {
      setAlertInfo({
        open: true,
        title: 'Erro ao Adicionar Funcionário',
        message: err.message,
        isSuccess: false,
      });
    },
  });

  const { mutate: updateEmployee, isLoading: isUpdating } = useMutation({
    mutationFn: (updatedData) =>
      authFetch(`/users/${employee.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      }).then((res) => res.json()),
    onSuccess: () => {
      setAlertInfo({
        open: true,
        title: 'Sucesso',
        message: 'Função atualizada com sucesso!',
        isSuccess: true,
      });
      queryClient.invalidateQueries(['employees']);
      setTimeout(onClose, 1500);
    },
    onError: (err) => {
      setAlertInfo({
        open: true,
        title: 'Erro ao Atualizar',
        message: err.message,
        isSuccess: false,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateEmployee({ userRole });
    } else {
      addEmployee({ name, email, userRole });
    }
  };

  if (!isOpen) return null;

  const isLoading = isAdding || isUpdating;

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{isEditing ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</h2>

            {!isEditing && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor='name'>Nome</label>
                  <input
                    id='name'
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder='Nome do funcionário'
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor='email'>Email</label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder='Email do funcionário'
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor='userRole'>Função</label>
              <select
                id='userRole'
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value='Admin' disabled>Administrador</option>
                <option value='Editor'>Editor</option>
                <option value='Reader'>Leitor</option>
              </select>
            </div>

            <button type='submit' disabled={isLoading}>
              {isLoading
                ? 'Salvando...'
                : isEditing
                ? 'Salvar Alterações'
                : 'Adicionar Funcionário'}
            </button>
          </form>
        </div>
      </div>
      <AlertModal
        open={alertInfo.open}
        onClose={() => setAlertInfo({ ...alertInfo, open: false })}
        title={alertInfo.title}
        message={alertInfo.message}
        isSuccess={alertInfo.isSuccess}
      />
    </>
  );
};

export default EmployeeModal;
