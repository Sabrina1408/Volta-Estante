import { NavLink, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AlertModal from '../AlertModal/AlertModal';

const NavBar = () => {
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim() === "") {
      setAlertMessage('Por favor, insira um código de livro válido.');
      setShowAlert(true);
      return;
    }
    navigate(`/search?q=${search}`);
    setSearch("");
    setIsMenuOpen(false);
  };

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={styles.brand} onClick={handleLinkClick}>
        Volta à Estante
      </NavLink>

      <button
        className={styles.hamburger}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Abrir menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <div className={`${styles.navContent} ${isMenuOpen ? styles.activeMenu : ""}`}>
        <ul>
          {!user && (
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                Home
              </NavLink>
            </li>
          )}

          {user && (
            <>
              <li>
                <NavLink to="/estoque" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Estoque
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/vendas" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Vendas
                </NavLink>
              </li>
              <li>
                <NavLink to="/logs" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Logs
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {user && (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="search"
            placeholder="Digite aqui o código do livro..."
            max={20}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className={styles.searchInput}
          />
          <button type="submit" aria-label="Pesquisar" className={styles.searchButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </button>
        </form>
        )}

    <AlertModal open={showAlert} onClose={() => setShowAlert(false)} title="Aviso" message={alertMessage} />

        <ul>
          {user ? (
            <>
              <li>
                <NavLink to="/perfil" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Perfil
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/cadastro" className={({ isActive }) => (isActive ? styles.active : "")} onClick={handleLinkClick}>
                  Cadastre-se
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;