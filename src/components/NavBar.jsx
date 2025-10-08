import { NavLink, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";
import { useState } from "react";

const NavBar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (search.trim() === "") {
      alert("Por favor, insira um código de livro válido.");
      return;
    }

    navigate(`/search?q=${search}`);
    setSearch("");
  };

  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/estoque"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Estoque
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Dashboard
          </NavLink>
        </li>
      </ul>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
        </button>
      </form>
      <ul>
        <li>
          <NavLink
            to="/perfil"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Perfil
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Login
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/cadastrar"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Cadastre-se
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
