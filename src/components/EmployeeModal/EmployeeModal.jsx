import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
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
  const { user, refreshUserToken } = useAuth();
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

  const originalRole = employee?.userRole || 'Editor';
  const isDirty = isEditing ? userRole !== originalRole : true;

  const { mutate: addEmployee, isLoading: isAdding } = useMutation({
    mutationFn: async (newEmployee) => {
      const res = await authFetch(`/users/employees/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: async (data) => {
      const emp = data?.employee_user;
      const temp = data?.temporary_password;
      const link = data?.password_reset_link;
      if (!emp?.email) {
        setAlertInfo({ open: true, title: 'Erro ao Adicionar Funcionário', message: 'Resposta inválida do servidor. Tente novamente.', isSuccess: false });
        return;
      }
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, emp.email);
        setAlertInfo({ open: true, title: 'Funcionário Adicionado com Sucesso!', message: `O funcionário ${emp.name || ''} foi adicionado e um e-mail foi enviado para ${emp.email} com instruções para redefinir a senha.<br /><br />Senha temporária (caso necessário): <strong>${temp || ''}</strong>`, isSuccess: true });
      } catch {
        setAlertInfo({ open: true, title: 'Funcionário Adicionado com Sucesso!', message: `O funcionário ${emp.name || ''} foi adicionado.<br />Senha temporária: <strong>${temp || ''}</strong><br />Link para redefinir senha: <a href='${link || '#'}' target='_blank' rel='noopener noreferrer'>Redefinir Senha</a><br /><br /><em>Nota: Não foi possível enviar o e-mail automaticamente. Compartilhe estas informações com o funcionário.</em>`, isSuccess: true });
      }
      queryClient.invalidateQueries(['employees']);
    },
    onError: () => {
      setAlertInfo({ open: true, title: 'Erro ao Adicionar Funcionário', message: 'Não foi possível adicionar o funcionário. Tente novamente.', isSuccess: false });
    },
  });

  const { mutate: updateEmployee, isLoading: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await authFetch(`/users/${employee.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: async () => {
      setAlertInfo({
        open: true,
        title: 'Sucesso',
        message: 'Função atualizada com sucesso!',
        isSuccess: true,
      });
      queryClient.invalidateQueries(['employees']);
      
      if (user && employee.userId === user.uid) {
        try {
          await refreshUserToken();
          queryClient.invalidateQueries(['userProfile', user.uid]);
        } catch (error) {
          console.error('Erro ao atualizar token:', error);
        }
      }
      
      setTimeout(onClose, 1500);
    },
    onError: () => {
      setAlertInfo({ open: true, title: 'Erro ao Atualizar', message: 'Erro ao atualizar. Tente novamente.', isSuccess: false });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      if (!isDirty) {
        setAlertInfo({
          open: true,
          title: 'Nada para salvar',
          message: 'Nenhuma alteração foi feita na função do funcionário.',
          isSuccess: false,
        });
        return;
      }
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

            <button
              type='submit'
              className={`${styles.submitButton} ${isEditing ? styles.submitEdit : styles.submitAdd}`}
              disabled={isLoading || (isEditing && !isDirty)}
              aria-disabled={isLoading || (isEditing && !isDirty)}
            >
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