
  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import "./styles/index.css";
  import { seedTestData } from "./app/lib/seed-data";

  // Seed test friends & classes if localStorage is empty
  seedTestData();

  createRoot(document.getElementById("root")!).render(<App />);
  
