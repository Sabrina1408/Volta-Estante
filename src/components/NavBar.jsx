import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = () => {
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
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Dashboard
          </NavLink>
        </li>
      </ul>
      <ul>
        <li>
          <NavLink to="/perfil" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Perfil
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Login
          </NavLink>
        </li>
        <li>
          <NavLink to="/cadastrar" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            Cadastre-se
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
