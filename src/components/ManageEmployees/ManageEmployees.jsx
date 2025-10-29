import { useState } from 'react';
import styles from './ManageEmployees.module.css';
import { FaSearch, FaUserPlus, FaPencilAlt, FaTrash } from 'react-icons/fa';

// Dados de exemplo para popular a tabela
const mockEmployees = [
  { id: 'USR-001', name: 'Ana Silva', email: 'ana.silva@email.com', role: 'ADMIN' },
  { id: 'USR-002', name: 'Bruno Costa', email: 'bruno.costa@email.com', role: 'EDITOR' },
  { id: 'USR-003', name: 'Carlos Pereira', email: 'carlos.pereira@email.com', role: 'READER' },
  { id: 'USR-004', name: 'Daniela Martins', email: 'daniela.martins@email.com', role: 'EDITOR' },
  { id: 'USR-005', name: 'Eduardo Lima', email: 'eduardo.lima@email.com', role: 'READER' },
];

const ManageEmployees = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra os funcionários com base no termo de busca (nome ou email)
  const filteredEmployees = mockEmployees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mapeia a role para um texto e uma classe de estilo
  const getRoleInfo = (role) => {
    switch (role) {
      case 'ADMIN':
        return { text: 'Administrador', className: styles.roleAdmin };
      case 'EDITOR':
        return { text: 'Editor', className: styles.roleEditor };
      case 'READER':
        return { text: 'Leitor', className: styles.roleReader };
      default:
        return { text: role, className: '' };
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.employeesCard}>
        <header className={styles.cardHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Gerenciar Funcionários</h1>
            <p className={styles.subtitle}>Adicione, edite ou remova funcionários do sistema</p>
          </div>
          <button className={styles.addButton}>
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
              {filteredEmployees.map((employee) => {
                const roleInfo = getRoleInfo(employee.role);
                return (
                  <tr key={employee.id}>
                    <td data-label="Nome">{employee.name}</td>
                    <td data-label="Email">{employee.email}</td>
                    <td data-label="ID">{employee.id}</td>
                    <td data-label="Função">
                      <span className={`${styles.roleTag} ${roleInfo.className}`}>
                        {roleInfo.text}
                      </span>
                    </td>
                    <td data-label="Ações" className={styles.actionsCell}>
                      <button className={`${styles.actionButton} ${styles.editButton}`} title="Editar">
                        <FaPencilAlt />
                      </button>
                      <button className={`${styles.actionButton} ${styles.deleteButton}`} title="Excluir">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;