"use client";

import { useMemo, useState } from "react";

type Movimiento = {
  id: number;
  tipo: "Gasto" | "Ingreso";
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
};

const inicial: Movimiento[] = [
  {
    id: 1,
    tipo: "Gasto",
    fecha: "2026-04-19",
    categoria: "Fútbol / Club",
    descripcion: "Viático jugador 2013",
    monto: 30000,
  },
  {
    id: 2,
    tipo: "Gasto",
    fecha: "2026-04-19",
    categoria: "Fútbol / Club",
    descripcion: "Viático jugador 2013",
    monto: 15000,
  },
  {
    id: 3,
    tipo: "Gasto",
    fecha: "2026-04-19",
    categoria: "Fútbol / Club",
    descripcion: "Viático jugador 2013",
    monto: 15000,
  },
  {
    id: 4,
    tipo: "Gasto",
    fecha: "2026-04-19",
    categoria: "Fútbol / Club",
    descripcion: "Buffet Club El Triunfo",
    monto: 43500,
  },
  {
    id: 5,
    tipo: "Gasto",
    fecha: "2026-04-19",
    categoria: "Ocio / Kiosco",
    descripcion: "Kiosco fin de semana",
    monto: 78200,
  },
  {
    id: 6,
    tipo: "Ingreso",
    fecha: "2026-04-20",
    categoria: "Reintegro / Club",
    descripcion: "Aportes para remeras Club El Triunfo",
    monto: 67500,
  },
];

function formatoMoneda(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function Page() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(inicial);
  const [tipo, setTipo] = useState<"Gasto" | "Ingreso">("Gasto");
  const [fecha, setFecha] = useState("2026-04-20");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  const totalGastos = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === "Gasto")
        .reduce((acc, m) => acc + m.monto, 0),
    [movimientos]
  );

  const totalIngresos = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === "Ingreso")
        .reduce((acc, m) => acc + m.monto, 0),
    [movimientos]
  );

  const neto = totalIngresos - totalGastos;

  const agregarMovimiento = () => {
    if (!categoria || !descripcion || !monto) return;

    const nuevo: Movimiento = {
      id: Date.now(),
      tipo,
      fecha,
      categoria,
      descripcion,
      monto: Number(monto),
    };

    setMovimientos((prev) => [nuevo, ...prev]);
    setCategoria("");
    setDescripcion("");
    setMonto("");
  };

  const borrarMovimiento = (id: number) => {
    setMovimientos((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          Tablero financiero Fran
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
          Versión simple para dejar online primero. Después la hacemos más linda
          y más picante.
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
            <div style={valueStyle}>{formatoMoneda(totalGastos)}</div>
          </div>
          <div style={cardStyle}>
            <h3 style={labelStyle}>Total ingresos</h3>
            <div style={valueStyle}>{formatoMoneda(totalIngresos)}</div>
          </div>
          <div style={cardStyle}>
            <h3 style={labelStyle}>Neto</h3>
            <div style={valueStyle}>{formatoMoneda(neto)}</div>
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
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "Gasto" | "Ingreso")}
              style={inputStyle}
            >
              <option value="Gasto">Gasto</option>
              <option value="Ingreso">Ingreso</option>
            </select>

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={inputStyle}
            />

            <input
              placeholder="Categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={inputStyle}
            />

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

          <button onClick={agregarMovimiento} style={buttonStyle}>
            Agregar
          </button>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Movimientos</h2>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "12px",
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                  <th style={thtdStyle}>Fecha</th>
                  <th style={thtdStyle}>Tipo</th>
                  <th style={thtdStyle}>Categoría</th>
                  <th style={thtdStyle}>Descripción</th>
                  <th style={thtdStyle}>Monto</th>
                  <th style={thtdStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => (
                  <tr key={m.id} style={{ borderTop: "1px solid #334155" }}>
                    <td style={thtdStyle}>{m.fecha}</td>
                    <td style={thtdStyle}>{m.tipo}</td>
                    <td style={thtdStyle}>{m.categoria}</td>
                    <td style={thtdStyle}>{m.descripcion}</td>
                    <td style={thtdStyle}>{formatoMoneda(m.monto)}</td>
                    <td style={thtdStyle}>
                      <button
                        onClick={() => borrarMovimiento(m.id)}
                        style={{
                          ...buttonStyle,
                          background: "#7f1d1d",
                          marginTop: 0,
                        }}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "16px",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  marginTop: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "12px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const thtdStyle: React.CSSProperties = {
  padding: "12px 8px",
};
// update 2
