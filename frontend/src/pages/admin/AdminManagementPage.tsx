import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../../api/client";

interface AdminDto {
  id: number;
  email: string;
  role: string;
}

export function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<AdminDto[]>("/api/admins");
      setAdmins(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await apiPost<AdminDto, typeof formData>("/api/admins", {
        email: formData.email,
        password: formData.password,
      });
      setFormData({ email: "", password: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      await loadAdmins();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear administrador");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteAdmin(id: number) {
    setError(null);
    try {
      await apiDelete("/api/admins/" + id);
      setDeleteConfirm(null);
      await loadAdmins();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar administrador");
    }
  }

  if (loading) {
    return <div className="empty-hint">Cargando administradores…</div>;
  }

  return (
    <>
      <div className="sec-header">
        <h2>Gestión de Administradores</h2>
      </div>

      <div className="card">
        <div className="form-section-title">Crear nuevo administrador</div>
        <form
          onSubmit={handleCreateAdmin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>
              Usuario
            </label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={creating}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13 }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingrese la contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              disabled={creating}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={creating || !formData.email || !formData.password}
            style={{ alignSelf: "flex-start" }}
          >
            {creating ? "Creando..." : "+ Crear administrador"}
          </button>

          {error && (
            <div
              style={{
                color: "#dc2626",
                fontSize: 13,
                padding: 8,
                background: "#fee2e2",
                borderRadius: 4,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                color: "#059669",
                fontSize: 13,
                padding: 8,
                background: "#d1fae5",
                borderRadius: 4,
              }}
            >
              ✓ Administrador creado correctamente
            </div>
          )}
        </form>
      </div>

      <div className="card">
        <div className="form-section-title">Administradores registrados</div>

        {admins.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 14 }}>
            No hay administradores registrados
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td style={{ fontWeight: 500 }}>{admin.email}</td>
                  <td>
                    <span className="bs info" style={{ fontSize: 12 }}>
                      {admin.role === "administrador" ? "Administrador" : admin.role}
                    </span>
                  </td>
                  <td>
                    {deleteConfirm === admin.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() =>
                            handleDeleteAdmin(admin.id)
                          }
                          style={{ fontSize: 11, padding: "4px 10px" }}
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setDeleteConfirm(null)}
                          style={{ fontSize: 11, padding: "4px 10px" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => setDeleteConfirm(admin.id)}
                        style={{ fontSize: 11, padding: "4px 10px" }}
                      >
                        🗑 Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
