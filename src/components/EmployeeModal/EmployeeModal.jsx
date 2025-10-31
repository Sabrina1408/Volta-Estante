import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import styles from './EmployeeModal.module.css';
import { FaTimes } from 'react-icons/fa';

const EmployeeModal = ({ isOpen, onClose, employee }) => {
  const [userId, setUserId] = useState('');
  // Start empty so edit mode can show the actual user's role (or blank if none)
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { authFetch } = useApi();
  const queryClient = useQueryClient();
  const isEditing = !!employee;

  useEffect(() => {
    if (employee) {
      setUserId(employee.userId);
      // If employee has a role, normalize it and show it; otherwise leave blank
      setUserRole(employee.userRole ? String(employee.userRole).toUpperCase() : '');
    } else {
      // Reset form when opening for a new employee: default to EDITOR
      setUserId('');
      setUserRole('EDITOR');
    }
    setError('');
    setSuccess('');
  }, [employee, isOpen]);

  const { mutate: addEmployee, isLoading: isAdding } = useMutation({
    mutationFn: (newEmployee) =>
      authFetch(`/users/employees/${newEmployee.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole: newEmployee.userRole }),
      }).then(res => res.json()),
    onSuccess: () => {
      setSuccess('Funcionário adicionado com sucesso!');
      queryClient.invalidateQueries(['employees']);
      setTimeout(onClose, 1500);
    },
    onError: (err) => setError(`Erro ao adicionar: ${err.message}`),
  });

  const { mutate: updateEmployee, isLoading: isUpdating } = useMutation({
    mutationFn: (updatedData) =>
      authFetch(`/users/${employee.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      }).then(res => res.json()),
    onSuccess: () => {
      setSuccess('Função atualizada com sucesso!');
      queryClient.invalidateQueries(['employees']);
      setTimeout(onClose, 1500);
    },
    onError: (err) => setError(`Erro ao atualizar: ${err.message}`),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isEditing) {
      updateEmployee({ userRole });
    } else {
      if (!userId) {
        setError('O ID do usuário é obrigatório.');
        return;
      }
      addEmployee({ userId, userRole });
    }
  };

  if (!isOpen) return null;

  const isLoading = isAdding || isUpdating;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}><FaTimes /></button>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>{isEditing ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</h2>
          
          {error && <p className="error">{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="userId">ID do Usuário (Firebase UID)</label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={isEditing}
              placeholder="Cole o UID do Firebase do novo funcionário"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="userRole">Função</label>
            <select id="userRole" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
              <option value="ADMIN">Administrador</option>
              <option value="EDITOR">Editor</option>
              <option value="LEITOR">Leitor</option>
              {/* If the employee has a role not present in the above list, include it so the select displays it */}
              {isEditing && userRole && !["EDITOR", "LEITOR", "ADMIN"].includes(userRole) && (
                <option value={userRole}>{userRole}</option>
              )}
            </select>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Funcionário')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;