import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import styles from './ManageEmployees.module.css';
import { FaSearch, FaUserPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import EmployeeModal from '../EmployeeModal/EmployeeModal';
import AlertModal from '../AlertModal/AlertModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { getFriendlyError } from '../../utils/errorMessages';

const ManageEmployees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const { authFetch } = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => authFetch('/users').then((res) => res.json()),
    select: (data) => (data ? Object.values(data) : []),
  });

  const { mutate: deleteEmployee } = useMutation({
    mutationFn: async (userId) => {
      const res = await authFetch(`/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('EMPLOYEE_DELETE_FAILED');
      if (res.status === 204) return null;
      return await res.json().catch(() => null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setAlertMessage(getFriendlyError('EMPLOYEE_DELETE_SUCCESS'));
      setAlertOpen(true);
    },
    onError: (_err) => {
      setAlertMessage(getFriendlyError('EMPLOYEE_DELETE_FAILED'));
      setAlertOpen(true);
    },
  });

  const handleOpenModal = (employee = null) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleDelete = (userId, userName) => {
    const employee = employees.find(emp => emp.userId === userId);
    if (employee && employee.userRole === 'Admin') {
      setAlertMessage('Não é possível excluir um usuário com o papel de Administrador.');
      setAlertOpen(true);
    } else {
      setEmployeeToDelete({ userId, userName });
      setConfirmOpen(true);
    }
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.userId);
      setConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  const filteredEmployees = (employees || []).filter(
    (employee) =>
      (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleInfo = (role) => {
    switch (role) {
      case 'Admin':
        return { text: 'Administrador', className: styles.roleAdmin };
      case 'Editor':
        return { text: 'Editor', className: styles.roleEditor };
      case 'Reader':
        return { text: 'Leitor', className: styles.roleReader };
      default:
        return { text: role, className: '' };
    }
  };

  if (isLoading) return <p>Carregando funcionários...</p>;
  if (error) return <p className="error">{getFriendlyError('EMPLOYEE_LOAD_FAILED')}</p>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.employeesCard}>
        <header className={styles.cardHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Gerenciar Funcionários</h1>
            <p className={styles.subtitle}>Adicione, edite ou remova funcionários do sistema</p>
          </div>
          <button className={styles.addButton} onClick={() => handleOpenModal()}>
            <FaUserPlus />
            <span>Adicionar Funcionário</span>
          </button>
        </header>

        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.employeesTable}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>ID</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees && filteredEmployees.map((employee) => {
                const roleInfo = getRoleInfo(employee.userRole);
                return (
                  <tr key={employee.userId}>
                    <td data-label="Nome">{employee.name}</td>
                    <td data-label="Email">{employee.email}</td>
                    <td data-label="ID">{employee.userId}</td>
                    <td data-label="Função">
                      <span className={`${styles.roleTag} ${roleInfo.className}`}>
                        {roleInfo.text}
                      </span>
                    </td>
                    <td data-label="Ações" className={styles.actionsCell}>
                      <button
                        onClick={() => handleOpenModal(employee)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.userId, employee.name)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees?.length === 0 && (
                <tr><td colSpan="5">Nenhum funcionário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employee={selectedEmployee}
      />
      <AlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Aviso"
        message={alertMessage}
      />
      <ConfirmModal
        open={confirmOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmar exclusão"
        message={
          employeeToDelete
            ? `Tem certeza que deseja excluir o funcionário ${employeeToDelete.userName}?`
            : 'Tem certeza que deseja excluir este funcionário?'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default ManageEmployees;