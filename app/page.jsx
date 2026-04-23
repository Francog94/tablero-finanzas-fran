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
  "Indumentaria / Club"
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

function money(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

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
  marginTop: "16px",
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

  const movimientosFiltrados = useMemo(() => {
  return movimientos.filter((m) => {
    const texto = `${m.categoria} ${m.descripcion}`.toLowerCase();
    const matchTexto = texto.includes(filtroTexto.toLowerCase());
    const matchTipo = filtroTipo === "Todos" ? true : m.tipo === filtroTipo;
    const matchMes = m.fecha.startsWith(mesSeleccionado);

    return matchTexto && matchTipo && matchMes;
  });
}, [movimientos, filtroTexto, filtroTipo, mesSeleccionado]);

  const totalGastos = useMemo(
    () =>
      movimientosFiltrados
        .filter((m) => m.tipo === "Gasto")
        .reduce((acc, m) => acc + Number(m.monto || 0), 0),
    [movimientosFiltrados]
  );

  const totalIngresos = useMemo(
    () =>
      movimientosFiltrados
        .filter((m) => m.tipo === "Ingreso")
        .reduce((acc, m) => acc + Number(m.monto || 0), 0),
    [movimientosFiltrados]
  );

  const neto = totalIngresos - totalGastos;

  const porCategoria = useMemo(() => {
    const mapa = {};

    movimientosFiltrados
      .filter((m) => m.tipo === "Gasto")
      .forEach((m) => {
        mapa[m.categoria] = (mapa[m.categoria] || 0) + Number(m.monto || 0);
      });

    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [movimientosFiltrados]);

  const porDia = useMemo(() => {
    const mapa = {};

    movimientosFiltrados.forEach((m) => {
      if (!mapa[m.fecha]) {
        mapa[m.fecha] = {
          fecha: m.fecha,
          gastos: 0,
          ingresos: 0,
        };
      }

      if (m.tipo === "Gasto") mapa[m.fecha].gastos += Number(m.monto || 0);
      if (m.tipo === "Ingreso") mapa[m.fecha].ingresos += Number(m.monto || 0);
    });

    return Object.values(mapa)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .map((x) => ({
        ...x,
        neto: x.ingresos - x.gastos,
        fechaCorta: x.fecha.slice(5),
      }));
  }, [movimientosFiltrados]);

  const resumenTipo = [
    { name: "Gastos", value: totalGastos },
    { name: "Ingresos", value: totalIngresos },
  ];

  function iniciarEdicion(mov) {
  setEditandoId(mov.id);
  setEditData({
    tipo: mov.tipo,
    fecha: mov.fecha,
    categoria: mov.categoria,
    descripcion: mov.descripcion,
    monto: String(mov.monto),
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

  function PieChartSimple({ data }) {
    const total = data.reduce((a, b) => a + b.value, 0);
    let acumulado = 0;

    if (!data.length || total === 0) {
      return <div style={{ color: "#94a3b8" }}>No hay datos</div>;
    }

    return (
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <svg width="260" height="260" viewBox="0 0 42 42">
          {data.map((item, i) => {
            const porcentaje = (item.value / total) * 100;
            const dash = `${porcentaje} ${100 - porcentaje}`;
            const offset = 25 - acumulado;
            acumulado += porcentaje;

            return (
              <circle
                key={i}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="6"
                strokeDasharray={dash}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>

        <div style={{ display: "grid", gap: 10 }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: COLORS[i % COLORS.length],
                  display: "inline-block",
                }}
              />
              <span style={{ color: "#cbd5e1" }}>
                {item.name}: <strong>{money(item.value)}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function BarsSimple({ data }) {
    const max = Math.max(...data.map((x) => x.value), 1);

    return (
      <div style={{ display: "grid", gap: 14 }}>
        {data.map((item, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#cbd5e1" }}>{item.name}</span>
              <strong>{money(item.value)}</strong>
            </div>
            <div
              style={{
                height: 14,
                background: "#1e293b",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(item.value / max) * 100}%`,
                  height: "100%",
                  background: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function LineSimple({ data }) {
    if (!data.length) return <div style={{ color: "#94a3b8" }}>No hay datos</div>;

    const width = 760;
    const height = 260;
    const pad = 30;

    const valores = data.flatMap((d) => [d.gastos, d.ingresos, d.neto]);
    const max = Math.max(...valores, 1);

    const getX = (i) =>
      pad + (i * (width - pad * 2)) / Math.max(data.length - 1, 1);

    const getY = (v) => height - pad - (v / max) * (height - pad * 2);

    const makePath = (key) =>
      data
        .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`)
        .join(" ");

    return (
      <div style={{ overflowX: "auto" }}>
        <svg width={width} height={height} style={{ maxWidth: "100%" }}>
          <path d={makePath("gastos")} fill="none" stroke="#ef4444" strokeWidth="3" />
          <path d={makePath("ingresos")} fill="none" stroke="#10b981" strokeWidth="3" />
          <path d={makePath("neto")} fill="none" stroke="#3b82f6" strokeWidth="3" />

          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="11"
            >
              {d.fechaCorta}
            </text>
          ))}
        </svg>

        <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ color: "#ef4444" }}>■ Gastos</span>
          <span style={{ color: "#10b981" }}>■ Ingresos</span>
          <span style={{ color: "#3b82f6" }}>■ Neto</span>
        </div>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Tablero financiero Fran</h1>
        <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
          Con gráficos y conectado a Supabase.
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
            <div style={{ ...valueStyle, color: neto >= 0 ? "#34d399" : "#f87171" }}>
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

            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} />
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
            <input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} style={inputStyle} />
          </div>

          <button onClick={agregarMovimiento} style={buttonStyle}>Agregar</button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Gastos por categoría</h2>
            <PieChartSimple data={porCategoria} />
          </div>

          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Ingresos vs gastos</h2>
            <BarsSimple data={resumenTipo} />
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <h2 style={{ marginTop: 0 }}>Evolución por día</h2>
          <LineSimple data={porDia} />
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
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Cargando movimientos...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#94a3b8", borderBottom: "1px solid #334155" }}>
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
          onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
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
          onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
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
          onChange={(e) => setEditData({ ...editData, categoria: e.target.value })}
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
            setEditData({ ...editData, descripcion: e.target.value })
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
          onChange={(e) => setEditData({ ...editData, monto: e.target.value })}
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
            style={{ ...buttonStyle, marginTop: 0, background: "#15803d" }}
          >
            Guardar
          </button>
          <button
            onClick={() => setEditandoId(null)}
            style={{ ...buttonStyle, marginTop: 0, background: "#475569" }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => iniciarEdicion(m)}
            style={{ ...buttonStyle, marginTop: 0, background: "#1d4ed8" }}
          >
            Editar
          </button>
          <button
            onClick={() => borrarMovimiento(m.id)}
            style={{ ...buttonStyle, background: "#7f1d1d", marginTop: 0 }}
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
                      <td colSpan="6" style={{ ...thtdStyle, textAlign: "center", color: "#94a3b8" }}>
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
