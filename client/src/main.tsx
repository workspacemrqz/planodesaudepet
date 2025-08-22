import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/plan-icons.css";

// Verificar se o elemento root existe
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Falha na inicialização:', error);
  
  // Mostrar erro de inicialização simples
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <div style="font-size: 48px; margin-bottom: 20px;">🚨</div>
      <h1 style="font-size: 24px; margin-bottom: 16px;">Falha na inicialização</h1>
      <p style="font-size: 16px; margin-bottom: 24px; max-width: 500px;">
        Erro: ${error instanceof Error ? error.message : String(error)}
      </p>
      <button onclick="window.location.reload()" style="
        background: #E1AC33;
        color: #1a5a5c;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      " onmouseover="this.style.background='#d4a02b'" onmouseout="this.style.background='#E1AC33'">
        Tentar Novamente
      </button>
    </div>
  `;
  document.body.appendChild(errorDiv);
}
