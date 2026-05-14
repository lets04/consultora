import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useRole } from "../context/AuthContext";
import { ROLE_LABELS } from "../types/role";
import { apiPut } from "@/api/client";

export function Topbar({ title }: { title: string }) {
  const role = useRole();
  const { userName } = useAuth();

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegistroInput, setShowRegistroInput] = useState(false);
  const [registro, setRegistro] = useState("");
  const initials = (userName ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11.5, color: "#64748b" }}>
          {userName} · {ROLE_LABELS[role]}
        </span>
        <div className="topbar-profile-wrapper">
          <button
            className={`avatar-circle ${role === "admin" ? "admin" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="topbar-dropdown">
              <button onClick={() => setShowRegistroInput(!showRegistroInput)}>
                Registro Ministerial
              </button>
              {showRegistroInput && (
                <div className="registro-mini-form">
                  <input
                    type="text"
                    placeholder="Ej: RM-458721"
                    value={registro}
                    onChange={(e) => setRegistro(e.target.value)}
                  />

                  <button
                    className="save-registro-btn"
                    onClick={async () => {
                      try {
                        await apiPut("/api/registro-ministerial", {
                          registroMinisterial: registro,
                        });

                        alert("Registro ministerial actualizado");

                        setShowRegistroInput(false);
                      } catch {
                        alert("Error al guardar");
                      }
                    }}
                  >
                    Guardar
                  </button>
                </div>
              )}

              {/* <button>Configuración</button> */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
