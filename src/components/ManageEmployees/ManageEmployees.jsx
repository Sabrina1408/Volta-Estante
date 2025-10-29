import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import styles from './ManageEmployees.module.css';
import { FaSearch, FaUserPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';
import EmployeeModal from '../EmployeeModal/EmployeeModal';

const ManageEmployees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  // Busca os funcionários da API
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => authFetch('/users').then((res) => res.json()),
    select: (data) => (data ? Object.values(data) : []), // Transforma o objeto em um array
  });

  // Mutação para deletar um funcionário
  const { mutate: deleteEmployee } = useMutation({
    mutationFn: (userId) => authFetch(`/users/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setAlertMessage('Funcionário excluído com sucesso!');
      setAlertOpen(true);
    },
    onError: (err) => {
      setAlertMessage(`Erro ao excluir funcionário: ${err.message}`);
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
    const employeeToDelete = employees.find(emp => emp.userId === userId);
    if (employeeToDelete && employeeToDelete.userRole === 'Admin') {
      alert('Não é possível excluir um usuário com o papel de Administrador.');
    } else {
      if (window.confirm(`Tem certeza que deseja excluir o funcionário ${userName}?`)) {
        deleteEmployee(userId);
      }
    }
  };

  // Filtra os funcionários com base no termo de busca (nome ou email)
  const filteredEmployees = (employees || []).filter(
    (employee) =>
      (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mapeia a role para um texto e uma classe de estilo
  const getRoleInfo = (role) => {
    switch (role) {
      case 'Admin':
        return { text: 'Administrador', className: styles.roleAdmin };
      case 'Editor':
        return { text: 'Editor', className: styles.roleEditor };
      default:
        return { text: role, className: '' };
    }
  };

  if (isLoading) return <p>Carregando funcionários...</p>;
  if (error) return <p className="error">Erro ao carregar funcionários: {error.message}</p>;


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
    </div>
  );
};

export default ManageEmployees;