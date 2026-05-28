import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { apiGet } from "../../api/client";
import type { Estudiante } from "../../types/student";
import { StudentCursosTab } from "./detail/StudentCursosTab";
import { StudentInfoTab } from "./detail/StudentInfoTab";
import { StudentNotasTab } from "./detail/StudentNotasTab";

type Tab = "info" | "cursos" | "notas";

export function StudentDetailPage() {
  const { ci } = useParams<{ ci: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isConcluido = searchParams.get("from") === "concluidos";
  const isGerente = searchParams.get("from") === "gerente";
  const fromCursos = searchParams.get("from") === "cursos";
  const fallbackPath =
    isConcluido || fromCursos ? "/estudiantes/concluidos" : "/estudiantes";
  const [e, setE] = useState<Estudiante | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>(
    isConcluido ? "notas" : fromCursos ? "cursos" : "info",
  );

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  useEffect(() => {
    if (!ci) {
      setE(null);
      return;
    }
    let cancelled = false;
    setE(undefined);
    apiGet<Estudiante>(`/api/students/${encodeURIComponent(ci)}`)
      .then((data) => {
        if (!cancelled) setE(data);
      })
      .catch(() => {
        if (!cancelled) setE(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ci]);

  if (e === undefined) {
    return <div className="empty-hint">Cargando…</div>;
  }

  if (!e) {
    return (
      <div className="empty-hint">
        Estudiante no encontrado.{" "}
        <button type="button" className="btn-secondary" onClick={handleBack}>
          Volver
        </button>
      </div>
    );
  }

  const initials = e.nombre
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <>
      <div className="sec-header">
        <h2></h2>
        <button type="button" className="btn-secondary" onClick={handleBack}>
          ← Volver
        </button>
      </div>
      <div className="student-profile">
        <div className="student-avatar">{initials}</div>
        <div>
          <div className="student-name">{e.nombre}</div>
          <div className="student-ci">CI: {e.ci}</div>
        </div>
      </div>

      <div className="detail-tabs">
        {isGerente
          ? (
              [
                ["info", "Información"],
                ["cursos", "Cursos"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={"detail-tab" + (tab === id ? " active" : "")}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))
          : fromCursos
            ? ([["cursos", "Cursos"]] as const).map(([id, label]) => (
                <button key={id} type="button" className={"detail-tab active"}>
                  {label}
                </button>
              ))
            : isConcluido
              ? ([["notas", "Notas"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={"detail-tab active"}
                  >
                    {label}
                  </button>
                ))
              : ([["info", "Información"]] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={"detail-tab active"}
                  >
                    {label}
                  </button>
                ))}
      </div>
      {tab === "info" && <StudentInfoTab e={e} />}
      {isGerente && tab === "cursos" && <StudentCursosTab e={e} mode="all" />}

      {fromCursos && tab === "cursos" && (
        <StudentCursosTab e={e} mode="certificado" />
      )}

      {isConcluido && tab === "cursos" && (
        <StudentCursosTab e={e} mode="examen" />
      )}
      {isConcluido && tab === "notas" && <StudentNotasTab e={e} />}
    </>
  );
}
