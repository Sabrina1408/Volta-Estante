import { useState } from "react";
import reactLogo from "../../assets/react.svg";

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
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={fetchFromApi}>Fetch from API</button>
        <p>{apiMessage && <p>API Response: {apiMessage}</p>}</p>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
};

export default Home;
