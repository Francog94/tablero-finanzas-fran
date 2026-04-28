"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

function PieChartSimple({ data }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  let acumulado = 0;

  if (!data.length || total === 0) {
    return <div style={{ color: "#94a3b8" }}>No hay datos</div>;
  }

  const colores = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <svg width="220" height="220" viewBox="0 0 42 42">
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
              stroke={colores[i % colores.length]}
              strokeWidth="6"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>

      <div style={{ display: "grid", gap: 8 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: colores[i % colores.length],
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

  if (!data.length) {
    return <div style={{ color: "#94a3b8" }}>No hay datos</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.name}</span>
            <strong>{money(item.value)}</strong>
          </div>
          <div style={{ height: 10, background: "#1e293b", borderRadius: 999 }}>
            <div
              style={{
                width: `${(item.value / max) * 100}%`,
                height: "100%",
                background: i === 0 ? "#ef4444" : "#10b981",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineSimple({ data }) {
  if (!data.length) {
    return <div style={{ color: "#94a3b8" }}>No hay datos</div>;
  }

  const width = 760;
  const height = 260;
  const pad = 30;

  const valores = data.flatMap((d) => [d.gastos, d.ingresos, d.neto]);
  const max = Math.max(...valores.map((v) => Math.abs(v)), 1);
  const min = Math.min(...valores, 0);
  const range = max - min || 1;

  const getX = (i) => pad + (i * (width - pad * 2)) / Math.max(data.length - 1, 1);
  const getY = (v) => height - pad - ((v - min) / range) * (height - pad * 2);

  const makePath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`).join(" ");

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

export default function Page() {
  const [movimientos, setMovimientos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [tipo, setTipo] = useState("Gasto");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7));

  const [editandoId, setEditandoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [editData, setEditData] = useState({
    tipo: "Gasto",
    fecha: "",
    categoria: "",
    descripcion: "",
    monto: "",
  });

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);
        cargarMovimientos(data.user.id);
        cargarCategorias(data.user.id);
      } else {
        setLoading(false);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        cargarMovimientos(session.user.id);
        cargarCategorias(session.user.id);
      } else {
        setUser(null);
        setMovimientos([]);
        setCategorias([]);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function cargarMovimientos(userId) {
    setLoading(true);

    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .eq("user_id", userId)
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

  async function cargarCategorias(userId) {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("user_id", userId)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error cargando categorías:", error);
      return;
    }

    setCategorias(data || []);
  }

  async function asegurarCategoria(nombreCategoria) {
  const nombreLimpio = nombreCategoria.trim();
  if (!nombreLimpio || !user) return;

  const existe = categorias.some(
    (c) => c.nombre.toLowerCase() === nombreLimpio.toLowerCase()
  );

  if (existe) return;

  const { data, error } = await supabase
    .from("categorias")
    .insert([{ nombre: nombreLimpio, user_id: user.id }])
    .select();

  if (error) {
  console.error("Error creando categoría:", error);
  alert("Error creando categoría: " + error.message);
  return;
}

  if (data?.[0]) {
    setCategorias((prev) =>
      [...prev, data[0]].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
    );
  }
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

  const resumenTipo = [
    { name: "Gastos", value: totalGastos },
    { name: "Ingresos", value: totalIngresos },
  ];

  const porDia = useMemo(() => {
    const mapa = {};

    movimientosFiltrados.forEach((m) => {
      if (!mapa[m.fecha]) {
        mapa[m.fecha] = { fecha: m.fecha, gastos: 0, ingresos: 0 };
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

  const resumen = useMemo(() => {
    if (!movimientosFiltrados.length) return null;

    const diasUnicos = [...new Set(movimientosFiltrados.map((m) => m.fecha))].length;
    const promedio = diasUnicos ? totalGastos / diasUnicos : 0;

    const mapaCat = {};
    movimientosFiltrados
      .filter((m) => m.tipo === "Gasto")
      .forEach((m) => {
        mapaCat[m.categoria] = (mapaCat[m.categoria] || 0) + Number(m.monto || 0);
      });

    const topCategoria = Object.entries(mapaCat).sort((a, b) => b[1] - a[1])[0];

    const mapaDia = {};
    movimientosFiltrados.forEach((m) => {
      if (!mapaDia[m.fecha]) mapaDia[m.fecha] = 0;
      if (m.tipo === "Gasto") mapaDia[m.fecha] += Number(m.monto || 0);
    });

    const peorDia = Object.entries(mapaDia).sort((a, b) => b[1] - a[1])[0];

    return {
      promedio,
      topCategoria,
      peorDia,
      estado: totalIngresos - totalGastos >= 0 ? "positivo" : "negativo",
    };
  }, [movimientosFiltrados, totalGastos, totalIngresos]);

  async function agregarMovimiento() {
    if (saving) return;
    setErrorMsg("");
    if (!categoria.trim() || !descripcion.trim() || !monto || !user) {
      setErrorMsg("Completá categoría, descripción y monto para guardar el movimiento.");
      return;
    }

    const categoriaLimpia = categoria.trim();
    const descripcionLimpia = descripcion.trim();
    const montoNumero = Number(monto);
    if (!Number.isFinite(montoNumero) || montoNumero <= 0) {
      setErrorMsg("El monto debe ser un número mayor a 0.");
      return;
    }
    setSaving(true);

    const nuevo = {
      tipo,
      fecha,
      categoria: categoriaLimpia,
      descripcion: descripcionLimpia,
      monto: montoNumero,
      user_id: user.id,
    };

    const { data, error } = await supabase.from("movimientos").insert([nuevo]).select();

    if (error) {
      console.error("Error guardando movimiento:", error);
      alert("Error guardando movimiento");
      setSaving(false);
      return;
    }

    if (data?.[0]) {
  setMovimientos((prev) => [data[0], ...prev]);
}

await asegurarCategoria(categoriaLimpia);

setCategoria("");
setDescripcion("");
setMonto("");
setSaving(false);
  }

  async function borrarMovimiento(id) {
    if (!user) return;
    const confirmar = window.confirm("¿Seguro que querés borrar este movimiento?");
    if (!confirmar) return;
    const { error } = await supabase
      .from("movimientos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

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
    if (!user) return;
    if (saving) return;
    setErrorMsg("");
    const categoriaLimpia = editData.categoria.trim();
    const descripcionLimpia = editData.descripcion.trim();
    const montoNumero = Number(editData.monto);
    if (!categoriaLimpia || !descripcionLimpia || !editData.fecha) {
      setErrorMsg("Completá todos los campos antes de guardar la edición.");
      return;
    }
    if (!Number.isFinite(montoNumero) || montoNumero <= 0) {
      setErrorMsg("El monto editado debe ser un número mayor a 0.");
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from("movimientos")
      .update({
        tipo: editData.tipo,
        fecha: editData.fecha,
        categoria: categoriaLimpia,
        descripcion: descripcionLimpia,
        monto: montoNumero,
      })
      .eq("id", editandoId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error editando movimiento:", error);
      alert("Error editando movimiento");
      setSaving(false);
      return;
    }

    setMovimientos((prev) =>
      prev.map((m) =>
        m.id === editandoId
          ? {
              ...m,
              tipo: editData.tipo,
              fecha: editData.fecha,
              categoria: categoriaLimpia,
              descripcion: descripcionLimpia,
              monto: montoNumero,
            }
          : m
      )
    );

    await asegurarCategoria(categoriaLimpia);

    setEditandoId(null);
    setEditData({ tipo: "Gasto", fecha: "", categoria: "", descripcion: "", monto: "" });
    setSaving(false);
  }

  function exportarCsv() {
    if (!movimientosFiltrados.length) return;
    const filas = [
      ["fecha", "tipo", "categoria", "descripcion", "monto"],
      ...movimientosFiltrados.map((m) => [
        m.fecha,
        m.tipo,
        m.categoria,
        m.descripcion,
        String(m.monto ?? 0),
      ]),
    ];
    const csv = filas
      .map((fila) =>
        fila
          .map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimientos-${mesSeleccionado || "todos"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function autenticar(modo) {
    if (authLoading) return;
    setAuthError("");
    const email = authEmail.trim();
    const password = authPassword;

    if (!email || !password) {
      setAuthError("Completá email y contraseña.");
      return;
    }

    if (modo === "registro" && password.length < 6) {
      setAuthError("La contraseña para registrarte debe tener al menos 6 caracteres.");
      return;
    }

    setAuthLoading(true);

    const authFn =
      modo === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { data, error } = await authFn({ email, password });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    if (data?.user) {
      setUser(data.user);
      cargarMovimientos(data.user.id);
      cargarCategorias(data.user.id);
      setAuthEmail("");
      setAuthPassword("");
    }

    setAuthLoading(false);
  }

  if (!user) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h1>Ingresar al tablero</h1>
            <p style={{ color: "#94a3b8", marginTop: 0 }}>
              Accedé con tu usuario o creá una cuenta para empezar a cargar movimientos.
            </p>

            {authError && <p style={{ color: "#fca5a5" }}>{authError}</p>}

            <div style={{ display: "grid", gap: "12px", maxWidth: "420px" }}>
              <input
                type="email"
                placeholder="tu-email@dominio.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
              <button style={buttonStyle} onClick={() => autenticar("login")} disabled={authLoading}>
                {authLoading ? "Procesando..." : "Iniciar sesión"}
              </button>

              <button
                style={{ ...buttonStyle, background: "#15803d" }}
                onClick={() => autenticar("registro")}
                disabled={authLoading}
              >
                {authLoading ? "Procesando..." : "Registrarme"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <style>{`
        .desktop-table { display: block; }
        .mobile-cards { display: none; }
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: grid; gap: 14px; }
        }
      `}</style>

      <div style={containerStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>Tablero financiero</h1>
            <p style={{ color: "#94a3b8", margin: 0 }}>Sesión activa: {user?.email}</p>
          </div>

          <button
            style={{ ...buttonStyle, background: "#dc2626" }}
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
              setMovimientos([]);
              setCategorias([]);
            }}
          >
            Cerrar sesión
          </button>
        </div>

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
          {errorMsg && <p style={{ color: "#fca5a5", marginTop: 0 }}>{errorMsg}</p>}

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
  onChange={(e) => {
    const value = e.target.value;

    if (value === "__nueva__") {
      const nueva = prompt("Nombre de la nueva categoría:");

      if (nueva && nueva.trim()) {
        setCategoria(nueva.trim());
      }

      return;
    }

    setCategoria(value);
  }}
  style={inputStyle}
>
  <option value="">Categoría</option>

  {categorias.map((cat) => (
    <option key={cat.id} value={cat.nombre}>
      {cat.nombre}
    </option>
  ))}

  <option value="__nueva__">+ Nueva categoría</option>
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
            <button onClick={agregarMovimiento} style={buttonStyle} disabled={saving}>
              {saving ? "Guardando..." : "Agregar"}
            </button>
          </div>
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

        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <h2 style={{ marginTop: 0 }}>Resumen del mes</h2>

          {!resumen ? (
            <div style={{ color: "#94a3b8" }}>No hay datos</div>
          ) : (
            <div style={{ display: "grid", gap: 10, color: "#cbd5e1" }}>
              <div>
                📊 Promedio diario de gastos: <strong>{money(resumen.promedio)}</strong>
              </div>

              {resumen.topCategoria && (
                <div>
                  🏆 Categoría con más gasto: <strong>{resumen.topCategoria[0]} ({money(resumen.topCategoria[1])})</strong>
                </div>
              )}

              {resumen.peorDia && (
                <div>
                  🔥 Día con más gasto: <strong>{resumen.peorDia[0]} ({money(resumen.peorDia[1])})</strong>
                </div>
              )}

              <div>
                {resumen.estado === "positivo" ? (
                  <span style={{ color: "#10b981" }}>💰 Estás en superávit</span>
                ) : (
                  <span style={{ color: "#ef4444" }}>⚠️ Estás en déficit</span>
                )}
              </div>
            </div>
          )}
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

              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
                <option value="Todos">Todos</option>
                <option value="Gasto">Gasto</option>
                <option value="Ingreso">Ingreso</option>
              </select>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={setMesActual} style={buttonStyle}>Este mes</button>
                <button onClick={setMesAnterior} style={buttonStyle}>Mes pasado</button>
                <button onClick={setTodos} style={buttonStyle}>Todos</button>
                <button onClick={exportarCsv} style={{ ...buttonStyle, background: "#0f766e" }}>
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#94a3b8" }}>Cargando movimientos...</p>
          ) : (
            <>
              <div className="desktop-table" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", minWidth: "720px", borderCollapse: "collapse" }}>
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
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.nombre}>
              {cat.nombre}
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
          onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
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
          <button onClick={guardarEdicion} style={{ ...buttonStyle, background: "#15803d" }}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={() => setEditandoId(null)} style={{ ...buttonStyle, background: "#475569" }}>
            Cancelar
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => iniciarEdicion(m)} style={{ ...buttonStyle, background: "#1d4ed8" }}>
            Editar
          </button>
          <button onClick={() => borrarMovimiento(m.id)} style={{ ...buttonStyle, background: "#7f1d1d" }}>
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

              <div className="mobile-cards">
                {movimientosFiltrados.map((m) => (
                  <div
                    key={m.id}
                    style={{ ...cardStyle, padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{m.categoria}</strong>
                      <span style={{ color: "#94a3b8" }}>{m.tipo}</span>
                    </div>

                    <div style={{ color: "#94a3b8" }}>{m.descripcion}</div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{m.fecha}</span>
                      <strong>{money(m.monto)}</strong>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button onClick={() => iniciarEdicion(m)} style={buttonStyle}>
                        Editar
                      </button>
                      <button onClick={() => borrarMovimiento(m.id)} style={{ ...buttonStyle, background: "#7f1d1d" }}>
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
