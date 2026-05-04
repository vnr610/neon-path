import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard against missing env vars — shows a clear error instead of a black page
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  document.getElementById("root")!.innerHTML = `
    <div style="
      min-height:100vh;display:flex;flex-direction:column;align-items:center;
      justify-content:center;background:#080b0f;color:#f5f5f5;
      font-family:'Courier New',monospace;padding:2rem;text-align:center;gap:1rem;
    ">
      <div style="font-size:2rem">⚠️</div>
      <h1 style="font-size:1.2rem;color:#3b82f6;letter-spacing:0.1em">CONFIGURATION ERROR</h1>
      <p style="color:#555;font-size:0.85rem;max-width:400px">
        Missing environment variables.<br/>
        Set <code style="color:#86efac">VITE_SUPABASE_URL</code> and
        <code style="color:#86efac">VITE_SUPABASE_PUBLISHABLE_KEY</code>
        in your deployment settings.
      </p>
    </div>
  `;
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
