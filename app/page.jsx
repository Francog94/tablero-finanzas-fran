"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const CATEGORIAS = [
  "Fútbol / Club",
  "Comida / Trabajo",
  "Transporte",
  "Ocio / Kiosco",
  "Apuestas",
  "Entrenamiento / Familia",
  "Hogar",
  "Servicios",
  "Reintegro / Club",
  "Indumentaria / Club",
  "Sueldo",
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function money(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e2e8f0",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const cardStyle = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "16px",
};

const labelStyle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px",
};

const valueStyle = {
  fontSize: "28px",
  fontWeight: 700,
  marginTop: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

const buttonStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const thtdStyle = {
  padding: "12px 8px",
};

export default function Page() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tipo, setTipo] = useState("Gasto");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [editandoId, setEditandoId] = useState(null);
  const [editData, setEditData] = useState({
    tipo: "Gasto",
    fecha: "",
    categoria: "",
    descripcion: "",
    monto: "",
  });

  useEffect(() => {
    cargarMovimientos();
  }, []);

  async function cargarMovimientos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("Error cargando movimientos:", error);
      alert("Error cargando movimientos");
    } else {
      setMovimientos(data || []);
    }

    setLoading(false);
  }

  const setMesActual = () => {
    setMesSeleccionado(new Date().toISOString().slice(0, 7));
  };

  const setMesAnterior = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    setMesSeleccionado(d.toISOString().slice(0, 7));
  };

  const setTodos = () => {
    setMesSeleccionado("");
  };

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const texto = `${m.categoria || ""} ${m.descripcion || ""}`.toLowerCase();
      const matchTexto = texto.includes(filtroTexto.toLowerCase());
      const matchTipo = filtroTipo === "Todos" ? true : m.tipo === filtroTipo;
      const matchMes = mesSeleccionado ? m.fecha.startsWith(mesSeleccionado) : true;

      return matchTexto && matchTipo && matchMes;
    });
  }, [movimientos, filtroTexto, filtroTipo, mesSeleccionado]);

  const totalGastos = useMemo(() => {
    return movimientosFiltrados
      .filter((m) => m.tipo === "Gasto")
      .reduce((acc, m) => acc + Number(m.monto || 0), 0);
  }, [movimientosFiltrados]);

  const totalIngresos = useMemo(() => {
    return movimientosFiltrados
      .filter((m) => m.tipo === "Ingreso")
      .reduce((acc, m) => acc + Number(m.monto || 0), 0);
  }, [movimientosFiltrados]);

  const neto = totalIngresos - totalGastos;

  async function agregarMovimiento() {
    if (!categoria || !descripcion || !monto) return;

    const nuevo = {
      tipo,
      fecha,
      categoria,
      descripcion,
      monto: Number(monto),
    };

    const { data, error } = await supabase
      .from("movimientos")
      .insert([nuevo])
      .select();

    if (error) {
      console.error("Error guardando movimiento:", error);
      alert("Error guardando movimiento");
      return;
    }

    if (data && data.length > 0) {
      setMovimientos((prev) => [data[0], ...prev]);
    }

    setCategoria("");
    setDescripcion("");
    setMonto("");
  }

  async function borrarMovimiento(id) {
    const { error } = await supabase.from("movimientos").delete().eq("id", id);

    if (error) {
      console.error("Error borrando movimiento:", error);
      alert("Error borrando movimiento");
      return;
    }

    setMovimientos((prev) => prev.filter((m) => m.id !== id));
  }

  function iniciarEdicion(m) {
    setEditandoId(m.id);
    setEditData({
      tipo: m.tipo,
      fecha: m.fecha,
      categoria: m.categoria,
      descripcion: m.descripcion,
      monto: String(m.monto),
    });
  }

  async function guardarEdicion() {
    const { error } = await supabase
      .from("movimientos")
      .update({
        tipo: editData.tipo,
        fecha: editData.fecha,
        categoria: editData.categoria,
        descripcion: editData.descripcion,
        monto: Number(editData.monto),
      })
      .eq("id", editandoId);

    if (error) {
      console.error("Error editando movimiento:", error);
      alert("Error editando movimiento");
      return;
    }

    setMovimientos((prev) =>
      prev.map((m) =>
        m.id === editandoId
          ? {
              ...m,
              tipo: editData.tipo,
              fecha: editData.fecha,
              categoria: editData.categoria,
              descripcion: editData.descripcion,
              monto: Number(editData.monto),
            }
          : m
      )
    );

    setEditandoId(null);
    setEditData({
      tipo: "Gasto",
      fecha: "",
      categoria: "",
      descripcion: "",
      monto: "",
    });
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          Tablero financiero Fran
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
          Control mensual conectado a Supabase.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <h3 style={labelStyle}>Total gastos</h3>
            <div style={{ ...valueStyle, color: "#f87171" }}>{money(totalGastos)}</div>
          </div>

          <div style={cardStyle}>
            <h3 style={labelStyle}>Total ingresos</h3>
            <div style={{ ...valueStyle, color: "#34d399" }}>{money(totalIngresos)}</div>
          </div>

          <div style={cardStyle}>
            <h3 style={labelStyle}>Neto</h3>
            <div
              style={{
                ...valueStyle,
                color: neto >= 0 ? "#34d399" : "#f87171",
              }}
            >
              {money(neto)}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={labelStyle}>Movimientos</h3>
            <div style={valueStyle}>{movimientosFiltrados.length}</div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <h2 style={{ marginTop: 0 }}>Agregar movimiento</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
              <option value="Gasto">Gasto</option>
              <option value="Ingreso">Ingreso</option>
            </select>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={inputStyle}
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={inputStyle}
            >
              <option value="">Categoría</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <button onClick={agregarMovimiento} style={buttonStyle}>
              Agregar
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>Movimientos</h2>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                style={{ ...inputStyle, minWidth: 180 }}
              />

              <input
                placeholder="Buscar"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                style={{ ...inputStyle, minWidth: 220 }}
              />

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ ...inputStyle, minWidth: 160 }}
              >
                <option value="Todos">Todos</option>
                <option value="Gasto">Gasto</option>
                <option value="Ingreso">Ingreso</option>
              </select>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={setMesActual} style={buttonStyle}>
                  Este mes
                </button>
                <button onClick={setMesAnterior} style={buttonStyle}>
                  Mes pasado
                </button>
                <button onClick={setTodos} style={buttonStyle}>
                  Todos
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Cargando movimientos...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      color: "#94a3b8",
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    <th style={thtdStyle}>Fecha</th>
                    <th style={thtdStyle}>Tipo</th>
                    <th style={thtdStyle}>Categoría</th>
                    <th style={thtdStyle}>Descripción</th>
                    <th style={thtdStyle}>Monto</th>
                    <th style={thtdStyle}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosFiltrados.map((m) => (
                    <tr key={m.id} style={{ borderTop: "1px solid #1e293b" }}>
                      <td style={thtdStyle}>
                        {editandoId === m.id ? (
                          <input
                            type="date"
                            value={editData.fecha}
                            onChange={(e) =>
                              setEditData({ ...editData, fecha: e.target.value })
                            }
                            style={inputStyle}
                          />
                        ) : (
                          m.fecha
                        )}
                      </td>

                      <td style={thtdStyle}>
                        {editandoId === m.id ? (
                          <select
                            value={editData.tipo}
                            onChange={(e) =>
                              setEditData({ ...editData, tipo: e.target.value })
                            }
                            style={inputStyle}
                          >
                            <option value="Gasto">Gasto</option>
                            <option value="Ingreso">Ingreso</option>
                          </select>
                        ) : (
                          m.tipo
                        )}
                      </td>

                      <td style={thtdStyle}>
                        {editandoId === m.id ? (
                          <select
                            value={editData.categoria}
                            onChange={(e) =>
                              setEditData({ ...editData, categoria: e.target.value })
                            }
                            style={inputStyle}
                          >
                            <option value="">Categoría</option>
                            {CATEGORIAS.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        ) : (
                          m.categoria
                        )}
                      </td>

                      <td style={thtdStyle}>
                        {editandoId === m.id ? (
                          <input
                            value={editData.descripcion}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                descripcion: e.target.value,
                              })
                            }
                            style={inputStyle}
                          />
                        ) : (
                          m.descripcion
                        )}
                      </td>

                      <td style={thtdStyle}>
                        {editandoId === m.id ? (
                          <input
                            type="number"
                            value={editData.monto}
                            onChange={(e) =>
                              setEditData({ ...editData, monto: e.target.value })
                            }
                            style={inputStyle}
                          />
                        ) : (
                          money(m.monto)
                        )}
                      </td>

                      <td style={thtdStyle}>
                        {editandoId === m.id ? (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              onClick={guardarEdicion}
                              style={{
                                ...buttonStyle,
                                background: "#15803d",
                              }}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditandoId(null)}
                              style={{
                                ...buttonStyle,
                                background: "#475569",
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => iniciarEdicion(m)}
                              style={{
                                ...buttonStyle,
                                background: "#1d4ed8",
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => borrarMovimiento(m.id)}
                              style={{
                                ...buttonStyle,
                                background: "#7f1d1d",
                              }}
                            >
                              Borrar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {movimientosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          ...thtdStyle,
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        No hay movimientos para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
