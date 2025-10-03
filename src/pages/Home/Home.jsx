// CSS
import styles from "./Home.module.css";
// Hooks
import { useState } from "react";

const Home = () => {
  const [count, setCount] = useState(0);
  const [apiMessage, setApiMessage] = useState("");

  const fetchFromApi = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/about");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApiMessage(data.version);
    } catch (error) {
      console.error("Error fetching from API:", error);
      setApiMessage(`Error connecting to API: ${error.message}`);
    }
  };

  return (
    <div className={styles.home}>
      <h1>Home</h1>
      <div className="card">
        <button onClick={fetchFromApi}>Fetch from API</button>
        <p>{apiMessage && <p>API Response: {apiMessage}</p>}</p>
      </div>
    </div>
  );
};

export default Home;
