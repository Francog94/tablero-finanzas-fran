"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseConfigError(url, anonKey) {
  if (!url || !anonKey) {
    return "Falta configurar NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno de build de Vercel.";
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return "NEXT_PUBLIC_SUPABASE_URL debe comenzar con https://";
    }
  } catch (_error) {
    return "NEXT_PUBLIC_SUPABASE_URL no tiene un formato válido de URL.";
  }

  if (!anonKey || anonKey.trim().length < 20) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY parece inválida. Verificá que sea la clave anon pública correcta del proyecto.";
  }

  return "";
}

const supabaseConfigError = getSupabaseConfigError(supabaseUrl, supabaseAnonKey);
let supabaseInitError = "";
let supabase = null;

if (!supabaseConfigError) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (...args) => fetch(...args),
      },
    });
  } catch (error) {
    supabaseInitError =
      error?.message || "No se pudo inicializar el cliente de Supabase.";
    console.error("Error creando cliente Supabase:", error);
  }
}

function money(n, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

function usuarioVisible(user, perfilFinanciero) {
  if (perfilFinanciero?.alias?.trim()) return perfilFinanciero.alias.trim();

  const email = user?.email || "";
  if (!email.includes("@")) return "Usuario";

  const [nombre] = email.split("@");
  return `${nombre.slice(0, 6)}@...`;
}


function iconoCategoria(nombre) {
  const n = String(nombre || "").toLowerCase();

  if (n.includes("seguro")) return "🚗";
  if (n.includes("vacacion") || n.includes("viaje")) return "✈️";
  if (n.includes("super") || n.includes("mercado") || n.includes("aliment")) return "🛒";
  if (n.includes("fiesta") || n.includes("salida") || n.includes("ocio")) return "🎉";
  if (n.includes("combustible") || n.includes("nafta") || n.includes("ypf") || n.includes("shell")) return "⛽";
  if (n.includes("hogar") || n.includes("casa")) return "🏠";
  if (n.includes("cuota") || n.includes("tarjeta")) return "💳";
  if (n.includes("suscrip")) return "📱";
  if (n.includes("cena") || n.includes("restaurant") || n.includes("restaurante")) return "🍽️";
  if (n.includes("transporte") || n.includes("peaje")) return "🚕";
  if (n.includes("salud") || n.includes("farmacia")) return "💊";
  if (n.includes("educ")) return "🎓";
  if (n.includes("limpieza")) return "🧹";
  if (n.includes("sueldo") || n.includes("ingreso")) return "💰";

  return "💸";
}

const EMOJIS_CATEGORIA = ["💸", "🍽️", "🛒", "🚗", "⛽", "🏠", "🎉", "✈️", "💳", "📱", "💊", "🎓", "🧹", "💰", "🐶", "🧾"];

const pageStyle = {
  minHeight: "100dvh",
  width: "100%",
  background: "radial-gradient(circle at top, #0f172a 0%, #020617 55%)",
  color: "#e2e8f0",
  padding: "max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))",
  fontFamily: "Inter, Arial, sans-serif",
  overflowX: "hidden",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1240px",
  margin: "0 auto",
  paddingInline: "0",
};

const cardStyle = {
  background: "linear-gradient(180deg, #111827 0%, #0b1220 100%)",
  border: "1px solid #263244",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 10px 30px rgba(2, 6, 23, 0.35)",
};

const labelStyle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px",
};

const valueStyle = {
  fontSize: "clamp(24px, 6vw, 30px)",
  fontWeight: 700,
  marginTop: "10px",
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  wordBreak: "break-word",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
  outline: "none",
};

const buttonStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.28)",
};

const thtdStyle = {
  padding: "12px 8px",
};

function PieChartSimple({ data, currency = "ARS" }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  let acumulado = 0;

  if (!data.length || total === 0) {
    return <div style={{ color: "#94a3b8" }}>No hay datos</div>;
  }

  const colores = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%" }}>
      <svg width="220" height="220" viewBox="0 0 42 42" style={{ width: "100%", maxWidth: 220, height: "auto" }}>
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

      <div style={{ display: "grid", gap: 8, width: "100%" }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: colores[i % colores.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#cbd5e1", fontSize: 14 }}>{item.name}</span>
            </div>
            <strong style={{ color: "#e2e8f0", fontSize: 14 }}>{money(item.value, currency)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsSimple({ data, currency = "ARS" }) {
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
            <strong>{money(item.value, currency)}</strong>
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

  const [perfilFinanciero, setPerfilFinanciero] = useState(null);
  const [saldoInicial, setSaldoInicial] = useState("0");
  const [moneda, setMoneda] = useState("ARS");
  const [perfilLoading, setPerfilLoading] = useState(true);
  const [perfilError, setPerfilError] = useState("");
  const [perfilSaving, setPerfilSaving] = useState(false);
  const [aliasPerfil, setAliasPerfil] = useState("");

  const [tipo, setTipo] = useState("Gasto");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [tabActiva, setTabActiva] = useState("resumen");
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [menuNavegacionAbierto, setMenuNavegacionAbierto] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [cargaRapidaTexto, setCargaRapidaTexto] = useState("");
  const [cargaRapidaPreview, setCargaRapidaPreview] = useState([]);
  const [cargaRapidaError, setCargaRapidaError] = useState("");
  const [cargaRapidaSaving, setCargaRapidaSaving] = useState(false);
  const [cargaRapidaSuccess, setCargaRapidaSuccess] = useState("");
  const [importarResumenTexto, setImportarResumenTexto] = useState("");
  const [importarResumenPreview, setImportarResumenPreview] = useState([]);
  const [importarResumenError, setImportarResumenError] = useState("");
  const [importarResumenSaving, setImportarResumenSaving] = useState(false);
  const [importarResumenSuccess, setImportarResumenSuccess] = useState("");
  const [importarResumenUsarFechaPago, setImportarResumenUsarFechaPago] = useState(true);
  const [importarResumenFechaPago, setImportarResumenFechaPago] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [categoriaGestionMsg, setCategoriaGestionMsg] = useState("");
  const [categoriaGestionError, setCategoriaGestionError] = useState("");
  const [categoriaEliminando, setCategoriaEliminando] = useState(null);
  const [categoriaDestinoReasignacion, setCategoriaDestinoReasignacion] = useState("");
  const [categoriaGestionLoading, setCategoriaGestionLoading] = useState(false);
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);
  const [categoriaEditNombre, setCategoriaEditNombre] = useState("");
  const [categoriaEditIcono, setCategoriaEditIcono] = useState("💸");
  const supabaseRuntimeError = supabaseConfigError || supabaseInitError;
  const [editData, setEditData] = useState({
    tipo: "Gasto",
    fecha: "",
    categoria: "",
    descripcion: "",
    monto: "",
  });
  const menuUsuarioRef = useRef(null);
  const menuNavegacionRef = useRef(null);

  const nombreMostradoUsuario = useMemo(
    () => usuarioVisible(user, perfilFinanciero),
    [user, perfilFinanciero]
  );

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMovimientos([]);
    setCategorias([]);
    setPerfilFinanciero(null);
    setSaldoInicial("0");
    setMoneda("ARS");
    setAliasPerfil("");
    setPerfilError("");
    setPerfilLoading(false);
    setMenuUsuarioAbierto(false);
    setMenuNavegacionAbierto(false);
  };

  function navegarA(tab) {
    setTabActiva(tab);
    setMenuUsuarioAbierto(false);
    setMenuNavegacionAbierto(false);
  }

  useEffect(() => {
    function manejarClickFuera(event) {
      if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(event.target)) {
        setMenuUsuarioAbierto(false);
      }
      if (menuNavegacionRef.current && !menuNavegacionRef.current.contains(event.target)) {
        setMenuNavegacionAbierto(false);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function init() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error obteniendo usuario:", error);
          return;
        }

        if (data?.user) {
          setUser(data.user);
          await Promise.all([
            cargarMovimientos(data.user.id),
            cargarCategorias(data.user.id),
            cargarPerfilFinanciero(data.user.id),
          ]);
        }
      } catch (error) {
        console.error("Error inicializando sesión:", error);
      } finally {
        setLoading(false);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        cargarMovimientos(session.user.id);
        cargarCategorias(session.user.id);
        cargarPerfilFinanciero(session.user.id);
      } else {
        setUser(null);
        setMovimientos([]);
        setCategorias([]);
        setPerfilFinanciero(null);
        setSaldoInicial("0");
        setMoneda("ARS");
        setPerfilError("");
        setPerfilLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!importarResumenUsarFechaPago || !importarResumenFechaPago) return;
    setImportarResumenPreview((prev) =>
      prev.map((fila) => ({
        ...fila,
        fecha: importarResumenFechaPago,
      }))
    );
  }, [importarResumenUsarFechaPago, importarResumenFechaPago]);

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

  async function cargarPerfilFinanciero(userId) {
    if (!supabase || !userId) {
      setPerfilLoading(false);
      return;
    }

    setPerfilLoading(true);
    setPerfilError("");

    const { data, error } = await supabase
      .from("perfil_financiero")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error cargando perfil financiero:", error);
      setPerfilError("No se pudo cargar tu perfil financiero. Intentá nuevamente.");
      setPerfilFinanciero(null);
      setSaldoInicial("0");
      setMoneda("ARS");
      setPerfilLoading(false);
      return;
    }

    if (!data) {
      setPerfilFinanciero(null);
      setSaldoInicial("0");
      setMoneda("ARS");
      setPerfilLoading(false);
      return;
    }

    setPerfilFinanciero(data);
    setSaldoInicial(String(data.saldo_inicial ?? 0));
    setMoneda(data.moneda || "ARS");
    setAliasPerfil(data.alias || "");
    setPerfilLoading(false);
  }

  async function guardarPerfilInicial() {
    if (!user || perfilSaving) return;
    setPerfilError("");
    const saldoNumero = Number(saldoInicial);

    if (!Number.isFinite(saldoNumero)) {
      setPerfilError("El saldo inicial debe ser un número válido.");
      return;
    }

    setPerfilSaving(true);
    const payload = {
      user_id: user.id,
      saldo_inicial: saldoNumero,
      moneda: moneda || "ARS",
      alias: aliasPerfil.trim() || null,
    };

    const { data, error } = await supabase
      .from("perfil_financiero")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Error guardando perfil inicial:", error);
      setPerfilError(`No se pudo guardar el perfil: ${error.message}`);
      setPerfilSaving(false);
      return;
    }

    setPerfilFinanciero(data);
    setSaldoInicial(String(data.saldo_inicial ?? 0));
    setMoneda(data.moneda || "ARS");
    setAliasPerfil(data.alias || "");
    setPerfilSaving(false);
  }

  async function guardarConfiguracionPerfil() {
    if (!user || !perfilFinanciero || perfilSaving) return;
    setPerfilError("");
    const saldoNumero = Number(saldoInicial);

    if (!Number.isFinite(saldoNumero)) {
      setPerfilError("El saldo inicial debe ser un número válido.");
      return;
    }

    setPerfilSaving(true);
    const { data, error } = await supabase
      .from("perfil_financiero")
      .update({
        saldo_inicial: saldoNumero,
        moneda: moneda || "ARS",
        alias: aliasPerfil.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error guardando configuración de perfil:", error);
      setPerfilError(`No se pudo guardar la configuración: ${error.message}`);
      setPerfilSaving(false);
      return;
    }

    setPerfilFinanciero(data);
    setSaldoInicial(String(data.saldo_inicial ?? 0));
    setMoneda(data.moneda || "ARS");
    setAliasPerfil(data.alias || "");
    setPerfilSaving(false);
  }

  async function borrarTodosMisDatos() {
    if (!user || perfilSaving || loading) return;

    const confirmado = window.confirm(
      "Esto eliminará todos tus movimientos, categorías y perfil financiero. No se puede deshacer."
    );
    if (!confirmado) return;

    const confirmacionTexto = window.prompt('Escribí BORRAR para confirmar.');
    if (confirmacionTexto !== "BORRAR") {
      alert("Confirmación inválida. No se borró ningún dato.");
      return;
    }

    setPerfilSaving(true);
    setErrorMsg("");
    setPerfilError("");

    const { error: errorMovimientos } = await supabase
      .from("movimientos")
      .delete()
      .eq("user_id", user.id);
    if (errorMovimientos) {
      setPerfilSaving(false);
      setPerfilError(`No se pudieron borrar movimientos: ${errorMovimientos.message}`);
      return;
    }

    const { error: errorCategorias } = await supabase
      .from("categorias")
      .delete()
      .eq("user_id", user.id);
    if (errorCategorias) {
      setPerfilSaving(false);
      setPerfilError(`No se pudieron borrar categorías: ${errorCategorias.message}`);
      return;
    }

    const { error: errorPerfil } = await supabase
      .from("perfil_financiero")
      .delete()
      .eq("user_id", user.id);
    if (errorPerfil) {
      setPerfilSaving(false);
      setPerfilError(`No se pudo borrar el perfil financiero: ${errorPerfil.message}`);
      return;
    }

    setMovimientos([]);
    setCategorias([]);
    setPerfilFinanciero(null);
    setSaldoInicial("0");
    setMoneda("ARS");
    setAliasPerfil("");
    setTabActiva("resumen");
    setPerfilSaving(false);
  }

  function prepararEliminacionCuenta() {
    alert(
      "Para eliminar la cuenta definitivamente se requiere una función segura del servidor."
    );
    // La eliminación real de auth.users requiere backend/Edge Function con service role, nunca NEXT_PUBLIC.
    // Punto de integración futuro: Supabase Edge Function "delete-user-account".
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
      .insert([{ nombre: nombreLimpio, user_id: user.id, icono: iconoCategoria(nombreLimpio) }])
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
  const monedaActiva = perfilFinanciero?.moneda || moneda || "ARS";
  const saldoInicialNumero = Number(perfilFinanciero?.saldo_inicial ?? saldoInicial ?? 0);
  const totalIngresosGlobal = useMemo(() => {
    return movimientos
      .filter((m) => m.tipo === "Ingreso")
      .reduce((acc, m) => acc + Number(m.monto || 0), 0);
  }, [movimientos]);

  const totalGastosGlobal = useMemo(() => {
    return movimientos
      .filter((m) => m.tipo === "Gasto")
      .reduce((acc, m) => acc + Number(m.monto || 0), 0);
  }, [movimientos]);

  const saldoActual = saldoInicialNumero + totalIngresosGlobal - totalGastosGlobal;

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

  function normalizarMonto(textoMonto) {
    const limpio = String(textoMonto || "")
      .toLowerCase()
      .replace(/\bars\b/g, "")
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");
    const numero = Number(limpio);
    return Number.isFinite(numero) ? numero : NaN;
  }

  function sugerirCategoria(descripcion, tipoDetectado) {
    const texto = (descripcion || "").toLowerCase();
    const esTokenFecha = (token) =>
      /^\d{1,2}[-/](?:[A-Za-z]{3}|\d{1,2})[-/]\d{2,4}$/.test(String(token || "").trim());
    if (texto.includes("nafta") || texto.includes("combustible") || texto.includes("ypf") || texto.includes("shell") || texto.includes("axion")) return "Combustible";
    if (texto.includes("peaje")) return "Transporte";
    if (texto.includes("super") || texto.includes("supermercado") || texto.includes("carrefour") || texto.includes("coto") || texto.includes("día") || texto.includes("changomas")) return "Supermercado";
    if (texto.includes("farmacia")) return "Salud";
    if (texto.includes("colegio") || texto.includes("cuota") || texto.includes("escuela")) return "Educación";
    if (texto.includes("meli+") || texto.includes("netflix") || texto.includes("spotify") || texto.includes("disney") || texto.includes("prime") || texto.includes("suscripción") || texto.includes("suscripcion")) return "Suscripciones";
    if (texto.includes("limpieza") || texto.includes("laura")) return "Limpieza";
    if (texto.includes("cochera") || texto.includes("garage") || texto.includes("estacionamiento")) return "Auto";
    if (texto.includes("transferencia") || texto.includes("pago")) return "Transferencias";
    if (texto.includes("luz") || texto.includes("gas") || texto.includes("agua")) return "Servicios";
    if (tipoDetectado === "Ingreso") return "Ingreso";
    const tokens = (descripcion || "").trim().split(/\s+/).filter(Boolean);
    const primera = esTokenFecha(tokens[0]) ? tokens[1] : tokens[0];
    return primera ? primera[0].toUpperCase() + primera.slice(1) : "General";
  }

  function extraerFechaDesdeTexto(lineaOriginal) {
    let linea = lineaOriginal.trim();
    const hoy = new Date();
    const lower = linea.toLowerCase();
    const meses = {
      jan: "01",
      ene: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      abr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      ago: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
      dic: "12",
    };

    if (lower.startsWith("hoy")) {
      return {
        fechaDetectada: hoy.toISOString().slice(0, 10),
        textoSinFecha: linea.replace(/^hoy\b/i, "").trim(),
      };
    }
    if (lower.startsWith("ayer")) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return {
        fechaDetectada: d.toISOString().slice(0, 10),
        textoSinFecha: linea.replace(/^ayer\b/i, "").trim(),
      };
    }

    const matchMesTexto = linea.match(
      /\b(\d{1,2})-(jan|ene|feb|mar|apr|abr|may|jun|jul|aug|ago|sep|oct|nov|dec|dic)-(\d{2,4})\b/i
    );
    if (matchMesTexto) {
      const dia = matchMesTexto[1].padStart(2, "0");
      const mesClave = matchMesTexto[2].toLowerCase();
      const mes = meses[mesClave];
      const anioRaw = matchMesTexto[3];
      const anio =
        anioRaw.length === 2
          ? Number(anioRaw) < 50
            ? `20${anioRaw}`
            : `19${anioRaw}`
          : anioRaw;

      if (mes) {
        linea = linea.replace(matchMesTexto[0], "").trim();
        return {
          fechaDetectada: `${anio}-${mes}-${dia}`,
          textoSinFecha: linea,
        };
      }
    }

    const match = linea.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/);
    if (!match) {
      return {
        fechaDetectada: new Date().toISOString().slice(0, 10),
        textoSinFecha: linea,
      };
    }

    const dia = match[1].padStart(2, "0");
    const mes = match[2].padStart(2, "0");
    const anio = match[3]
      ? match[3].length === 2
        ? Number(match[3]) < 50
          ? `20${match[3]}`
          : `19${match[3]}`
        : match[3]
      : String(new Date().getFullYear());

    linea = linea.replace(match[0], "").trim();
    return {
      fechaDetectada: `${anio}-${mes}-${dia}`,
      textoSinFecha: linea,
    };
  }

  function extraerMontoDesdeTexto(lineaOriginal) {
    const matches = [...lineaOriginal.matchAll(/(?:\bARS\b\s*|\$)?\s*\d[\d.,]*/gi)];
    if (!matches.length) return { monto: NaN, textoSinMonto: lineaOriginal.trim() };

    const ultimo = matches[matches.length - 1];
    const bruto = ultimo[0];
    const monto = normalizarMonto(bruto);
    const inicio = ultimo.index ?? 0;
    const fin = inicio + bruto.length;
    const textoSinMonto = `${lineaOriginal.slice(0, inicio)} ${lineaOriginal.slice(fin)}`.replace(/\s+/g, " ").trim();

    return { monto, textoSinMonto };
  }

  function extraerDatosPago(descripcionOriginal) {
    const texto = String(descripcionOriginal || "");
    const lower = texto.toLowerCase();
    let medioPago = "";
    let cuotas = "";

    if (lower.includes("visa")) medioPago = "Visa";
    else if (lower.includes("mastercard")) medioPago = "Mastercard";
    else if (lower.includes("debito") || lower.includes("débito")) medioPago = "Débito";
    else if (lower.includes("credito") || lower.includes("crédito")) medioPago = "Crédito";

    const matchFraccion = texto.match(/\b(\d{1,2}\s*\/\s*\d{1,2})\b/i);
    if (matchFraccion) cuotas = matchFraccion[1].replace(/\s/g, "");

    if (!cuotas && (lower.includes("cuota") || lower.includes("cuotas"))) {
      const n = texto.match(/\b(\d{1,2})\s*cuotas?\b/i);
      cuotas = n ? n[1] : "cuotas";
    }

    return { medio_pago: medioPago || undefined, cuotas: cuotas || undefined };
  }

  function parsearLineaCargaRapida(linea, indice) {
    const texto = linea.trim();
    if (!texto) return null;

    const { fechaDetectada, textoSinFecha } = extraerFechaDesdeTexto(texto);
    const { monto, textoSinMonto } = extraerMontoDesdeTexto(textoSinFecha);
    if (!Number.isFinite(monto) || monto <= 0) return null;

    const descripcion = textoSinMonto.trim();
    if (!descripcion) return null;

    const lower = descripcion.toLowerCase();
    const tipoDetectado =
      lower.includes("ingreso") ||
      lower.includes("cobro") ||
      lower.includes("sueldo") ||
      lower.includes("haberes") ||
      lower.includes("extra") ||
      lower.includes("horas extra")
        ? "Ingreso"
        : "Gasto";

    const datosPago = extraerDatosPago(descripcion);

    return {
      tempId: `${Date.now()}-${indice}`,
      fecha: fechaDetectada,
      tipo: tipoDetectado,
      categoria: sugerirCategoria(descripcion, tipoDetectado),
      descripcion,
      monto,
      ...datosPago,
    };
  }

  function parsearLineaImportarResumen(linea, indice) {
    const usarFechaResumen = importarResumenUsarFechaPago && Boolean(importarResumenFechaPago);
    const fechaResumen = importarResumenFechaPago;
    const base = parsearLineaCargaRapida(linea, indice);
    if (base) {
      return {
        ...base,
        fecha: usarFechaResumen ? fechaResumen : base.fecha,
      };
    }

    const texto = String(linea || "").replace(/\s+/g, " ").trim();
    if (!texto) return null;

    const { fechaDetectada, textoSinFecha } = extraerFechaDesdeTexto(texto);
    const { monto, textoSinMonto } = extraerMontoDesdeTexto(textoSinFecha);

    if (!Number.isFinite(monto) || monto <= 0) return null;

    const descripcion = textoSinMonto.trim();
    if (descripcion.length < 3) return null;

    const lower = descripcion.toLowerCase();
    const tipoDetectado =
      lower.includes("pago recibido") ||
      lower.includes("acreditacion") ||
      lower.includes("acreditación") ||
      lower.includes("transferencia recibida") ||
      lower.includes("ingreso")
        ? "Ingreso"
        : "Gasto";

    return {
      tempId: `resumen-${Date.now()}-${indice}`,
      fecha: usarFechaResumen ? fechaResumen : fechaDetectada,
      tipo: tipoDetectado,
      categoria: sugerirCategoria(descripcion, tipoDetectado),
      descripcion,
      monto,
      ...extraerDatosPago(descripcion),
    };
  }

  async function parsearDesdeImagen(_file) {
    setCargaRapidaError("Carga por imagen disponible próximamente.");
    return [];
  }

  async function parsearDesdePDF(_file) {
    setCargaRapidaError("Carga por PDF disponible próximamente.");
    return [];
  }

  const futureImportParsers = { parsearDesdeImagen, parsearDesdePDF };
  void futureImportParsers;

  function procesarCargaRapida() {
    setCargaRapidaError("");
    const lineas = cargaRapidaTexto
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!lineas.length) {
      setCargaRapidaError("Pegá al menos una línea para procesar.");
      setCargaRapidaSuccess("");
      return;
    }

    const parseados = lineas
      .map((linea, i) => parsearLineaCargaRapida(linea, i))
      .filter(Boolean);

    if (!parseados.length) {
      setCargaRapidaError("No se pudieron detectar movimientos válidos. Revisá formato y montos.");
      setCargaRapidaSuccess("");
      return;
    }

    setCargaRapidaPreview(parseados);
    setCargaRapidaSuccess("");
  }

  function actualizarFilaCargaRapida(tempId, field, value) {
    setCargaRapidaPreview((prev) =>
      prev.map((fila) =>
        fila.tempId === tempId
          ? {
              ...fila,
              [field]: field === "monto" ? Number(value) : value,
            }
          : fila
      )
    );
  }

  async function confirmarCargaRapida() {
    if (!user || !cargaRapidaPreview.length || cargaRapidaSaving) return;
    setCargaRapidaError("");
    setCargaRapidaSuccess("");

    const validas = cargaRapidaPreview.filter(
      (r) =>
        r.fecha &&
        r.tipo &&
        r.categoria?.trim() &&
        r.descripcion?.trim() &&
        Number.isFinite(Number(r.monto)) &&
        Number(r.monto) > 0
    );

    if (validas.length !== cargaRapidaPreview.length) {
      setCargaRapidaError("Hay filas inválidas en la previsualización. Corregilas antes de guardar.");
      return;
    }

    setCargaRapidaSaving(true);
    const payload = validas.map((r) => ({
      fecha: r.fecha,
      tipo: r.tipo,
      categoria: r.categoria.trim(),
      descripcion: r.descripcion.trim(),
      monto: Number(r.monto),
      user_id: user.id,
    }));

    const { data, error } = await supabase.from("movimientos").insert(payload).select();
    if (error) {
      setCargaRapidaError(`No se pudo guardar: ${error.message}`);
      setCargaRapidaSaving(false);
      return;
    }

    if (data?.length) {
      setMovimientos((prev) =>
        [...data, ...prev].sort(
          (a, b) => b.fecha.localeCompare(a.fecha) || Number(b.id) - Number(a.id)
        )
      );
      const categoriasUnicas = [...new Set(payload.map((x) => x.categoria))];
      await Promise.all(categoriasUnicas.map((cat) => asegurarCategoria(cat)));
      setCargaRapidaSuccess(`✔️ ${data.length} movimientos guardados correctamente`);
      setTimeout(() => setCargaRapidaSuccess(""), 3500);
    }

    setCargaRapidaTexto("");
    setCargaRapidaPreview([]);
    setCargaRapidaSaving(false);
  }

  function procesarImportarResumen() {
    setImportarResumenError("");
    setImportarResumenSuccess("");
    if (importarResumenUsarFechaPago && !importarResumenFechaPago) {
      setImportarResumenError("Elegí la fecha de pago del resumen antes de procesar.");
      return;
    }

    const lineas = importarResumenTexto
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (!lineas.length) {
      setImportarResumenError("Pegá al menos una línea para importar.");
      return;
    }

    const parseados = lineas
      .map((linea, i) => parsearLineaImportarResumen(linea, i))
      .filter(Boolean);

    if (!parseados.length) {
      setImportarResumenError("No se detectaron movimientos válidos en el texto pegado.");
      return;
    }

    setImportarResumenPreview(parseados);
  }

  function actualizarFilaImportarResumen(tempId, field, value) {
    if (field === "fecha" && importarResumenUsarFechaPago) return;
    setImportarResumenPreview((prev) =>
      prev.map((fila) =>
        fila.tempId === tempId
          ? {
              ...fila,
              [field]: field === "monto" ? Number(value) : value,
            }
          : fila
      )
    );
  }

  async function confirmarImportarResumen() {
    if (!user || !importarResumenPreview.length || importarResumenSaving) return;
    setImportarResumenError("");
    setImportarResumenSuccess("");

    const validas = importarResumenPreview.filter(
      (r) =>
        r.fecha &&
        r.tipo &&
        r.categoria?.trim() &&
        r.descripcion?.trim() &&
        Number.isFinite(Number(r.monto)) &&
        Number(r.monto) > 0
    );

    if (validas.length !== importarResumenPreview.length) {
      setImportarResumenError("Hay filas inválidas en la previsualización. Corregilas antes de guardar.");
      return;
    }

    setImportarResumenSaving(true);
    const payload = validas.map((r) => ({
      fecha: r.fecha,
      tipo: r.tipo,
      categoria: r.categoria.trim(),
      descripcion: r.descripcion.trim(),
      monto: Number(r.monto),
      user_id: user.id,
    }));

    const { data, error } = await supabase.from("movimientos").insert(payload).select();
    if (error) {
      setImportarResumenError(`No se pudo guardar: ${error.message}`);
      setImportarResumenSaving(false);
      return;
    }

    if (data?.length) {
      setMovimientos((prev) =>
        [...data, ...prev].sort(
          (a, b) => b.fecha.localeCompare(a.fecha) || Number(b.id) - Number(a.id)
        )
      );
      const categoriasUnicas = [...new Set(payload.map((x) => x.categoria))];
      await Promise.all(categoriasUnicas.map((cat) => asegurarCategoria(cat)));
      setImportarResumenSuccess(`✔️ ${data.length} movimientos guardados correctamente`);
      setTimeout(() => setImportarResumenSuccess(""), 3500);
    }

    setImportarResumenTexto("");
    setImportarResumenPreview([]);
    setImportarResumenSaving(false);
  }

  function formatearFecha(fechaIso) {
    if (!fechaIso) return "--/--/----";
    const [anio, mes, dia] = fechaIso.split("-");
    if (!anio || !mes || !dia) return fechaIso;
    return `${dia}/${mes}/${anio}`;
  }

  async function eliminarCategoriaSinMovimientos(cat) {
    if (!user || !cat) return;
    const confirmar = window.confirm(`¿Eliminar la categoría "${cat.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    setCategoriaGestionLoading(true);
    setCategoriaGestionError("");
    setCategoriaGestionMsg("");

    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", cat.id)
      .eq("user_id", user.id);

    if (error) {
      setCategoriaGestionError(`No se pudo eliminar la categoría: ${error.message}`);
      setCategoriaGestionLoading(false);
      return;
    }

    setCategorias((prev) => prev.filter((c) => c.id !== cat.id));
    if (categoria === cat.nombre) setCategoria("");
    if (editData.categoria === cat.nombre) {
      setEditData((prev) => ({ ...prev, categoria: "" }));
    }
    setCategoriaGestionMsg(`Categoría "${cat.nombre}" eliminada.`);
    setCategoriaGestionLoading(false);
  }

  function intentarEliminarCategoria(cat) {
    const movimientosAsociados = movimientos.filter((m) => m.categoria === cat.nombre).length;
    setCategoriaGestionError("");
    setCategoriaGestionMsg("");
    if (movimientosAsociados === 0) {
      eliminarCategoriaSinMovimientos(cat);
      return;
    }

    setCategoriaEliminando({ ...cat, movimientosAsociados });
    const primeraDisponible = categorias.find((c) => c.id !== cat.id);
    setCategoriaDestinoReasignacion(primeraDisponible?.nombre || "");
  }

  async function confirmarReasignarYEliminarCategoria() {
    if (!user || !categoriaEliminando) return;
    if (!categoriaDestinoReasignacion) {
      setCategoriaGestionError("Seleccioná una categoría de destino para mover los movimientos.");
      return;
    }
    if (categoriaDestinoReasignacion === categoriaEliminando.nombre) {
      setCategoriaGestionError("La categoría de destino debe ser distinta.");
      return;
    }

    setCategoriaGestionLoading(true);
    setCategoriaGestionError("");
    setCategoriaGestionMsg("");

    const { error: errorUpdate } = await supabase
      .from("movimientos")
      .update({ categoria: categoriaDestinoReasignacion })
      .eq("user_id", user.id)
      .eq("categoria", categoriaEliminando.nombre);

    if (errorUpdate) {
      setCategoriaGestionError(`No se pudieron reasignar los movimientos: ${errorUpdate.message}`);
      setCategoriaGestionLoading(false);
      return;
    }

    const { error: errorDelete } = await supabase
      .from("categorias")
      .delete()
      .eq("id", categoriaEliminando.id)
      .eq("user_id", user.id);

    if (errorDelete) {
      setCategoriaGestionError(`Se reasignaron movimientos, pero no se pudo eliminar la categoría: ${errorDelete.message}`);
      setCategoriaGestionLoading(false);
      return;
    }

    setMovimientos((prev) =>
      prev.map((m) =>
        m.categoria === categoriaEliminando.nombre
          ? { ...m, categoria: categoriaDestinoReasignacion }
          : m
      )
    );
    setCategorias((prev) => prev.filter((c) => c.id !== categoriaEliminando.id));
    if (categoria === categoriaEliminando.nombre) setCategoria(categoriaDestinoReasignacion);
    if (editData.categoria === categoriaEliminando.nombre) {
      setEditData((prev) => ({ ...prev, categoria: categoriaDestinoReasignacion }));
    }

    setCategoriaGestionMsg(
      `Se movieron ${categoriaEliminando.movimientosAsociados} movimientos a "${categoriaDestinoReasignacion}" y se eliminó "${categoriaEliminando.nombre}".`
    );
    setCategoriaEliminando(null);
    setCategoriaDestinoReasignacion("");
    setCategoriaGestionLoading(false);
  }

  function iniciarEdicionCategoria(cat) {
    setCategoriaGestionError("");
    setCategoriaGestionMsg("");
    setCategoriaEditandoId(cat.id);
    setCategoriaEditNombre(cat.nombre);
    setCategoriaEditIcono(cat.icono || iconoCategoria(cat.nombre));
  }

  function cancelarEdicionCategoria() {
    setCategoriaEditandoId(null);
    setCategoriaEditNombre("");
    setCategoriaEditIcono("💸");
  }

  async function guardarEdicionCategoria(cat) {
    if (!user) return;
    const nombreNuevo = categoriaEditNombre.trim();
    if (!nombreNuevo) {
      setCategoriaGestionError("El nombre de la categoría no puede estar vacío.");
      return;
    }

    const nombreViejo = cat.nombre;
    const iconoNuevo = categoriaEditIcono || "💸";
    const existeNombre = categorias.some((c) => c.id !== cat.id && c.nombre.toLowerCase() === nombreNuevo.toLowerCase());
    if (existeNombre) {
      setCategoriaGestionError("Ya existe otra categoría con ese nombre.");
      return;
    }

    setCategoriaGestionLoading(true);
    setCategoriaGestionError("");
    setCategoriaGestionMsg("");

    const { data: categoriaActualizada, error: errorCategoria } = await supabase
      .from("categorias")
      .update({ nombre: nombreNuevo, icono: iconoNuevo })
      .eq("id", cat.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (errorCategoria) {
      setCategoriaGestionLoading(false);
      setCategoriaGestionError(`No se pudo actualizar la categoría: ${errorCategoria.message}`);
      return;
    }

    if (nombreNuevo !== nombreViejo) {
      const { error: errorMovs } = await supabase
        .from("movimientos")
        .update({ categoria: nombreNuevo })
        .eq("user_id", user.id)
        .eq("categoria", nombreViejo);

      if (errorMovs) {
        setCategoriaGestionLoading(false);
        setCategoriaGestionError(`Se actualizó la categoría, pero falló la actualización de movimientos: ${errorMovs.message}`);
        return;
      }
    }

    setCategorias((prev) => prev.map((c) => (c.id === cat.id ? categoriaActualizada : c)).sort((a, b) => a.nombre.localeCompare(b.nombre)));
    if (nombreNuevo !== nombreViejo) {
      setMovimientos((prev) => prev.map((m) => (m.categoria === nombreViejo ? { ...m, categoria: nombreNuevo } : m)));
    }
    if (categoria === nombreViejo) setCategoria(nombreNuevo);
    if (editData.categoria === nombreViejo) setEditData((prev) => ({ ...prev, categoria: nombreNuevo }));

    setCategoriaGestionMsg(`Categoría "${nombreViejo}" actualizada correctamente.`);
    setCategoriaGestionLoading(false);
    cancelarEdicionCategoria();
  }

  async function autenticar(modo) {
    if (authLoading) return;
    setAuthError("");
    if (!supabase) {
      setAuthError(
        supabaseRuntimeError || "Supabase no está disponible. Revisá la configuración del entorno."
      );
      return;
    }
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
    try {
      const { data, error } =
        modo === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) {
        setAuthError(error.message || "No se pudo autenticar. Revisá tus datos.");
        return;
      }

      if (data?.user) {
        setUser(data.user);
        await Promise.all([
          cargarMovimientos(data.user.id),
          cargarCategorias(data.user.id),
          cargarPerfilFinanciero(data.user.id),
        ]);
        setAuthEmail("");
        setAuthPassword("");
        return;
      }

      setAuthError("La autenticación se completó pero no devolvió usuario. Volvé a intentar.");
    } catch (error) {
      const message =
        error?.message ||
        "Ocurrió un error inesperado durante la autenticación.";
      setAuthError(message);
      console.error("Error en autenticar:", error);
    } finally {
      setAuthLoading(false);
    }
  }

  if (!user) {
    return (
      <main style={pageStyle} className="app-shell">
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #020617;
            overflow-x: hidden;
          }
          body { min-height: 100dvh; width: 100%; }
          *, *::before, *::after { box-sizing: border-box; }
          .app-container { width: 100%; max-width: 1240px; margin: 0 auto; }
          @media (max-width: 768px) {
            .app-shell { padding: max(10px, env(safe-area-inset-top)) 10px max(14px, env(safe-area-inset-bottom)); }
            .app-container { max-width: none; margin: 0; }
          }
        `}</style>
        <div style={containerStyle} className="app-container">
          <div style={cardStyle}>
            <h1>Ingresar al tablero</h1>
            <p style={{ color: "#94a3b8", marginTop: 0 }}>
              Accedé con tu usuario o creá una cuenta para empezar a cargar movimientos.
            </p>

            {supabaseRuntimeError && (
              <div
                style={{
                  border: "1px solid #7f1d1d",
                  background: "rgba(127, 29, 29, 0.2)",
                  color: "#fecaca",
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              >
                <strong>Error de configuración de Supabase:</strong> {supabaseRuntimeError}
                <br />
                Verificá URL del proyecto, clave anon y que las variables estén cargadas en Vercel para
                Production (y redeploy).
              </div>
            )}

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
              <button
                style={buttonStyle}
                onClick={() => autenticar("login")}
                disabled={authLoading || Boolean(supabaseRuntimeError)}
              >
                {authLoading ? "Procesando..." : "Iniciar sesión"}
              </button>

              <button
                style={{ ...buttonStyle, background: "#15803d" }}
                onClick={() => autenticar("registro")}
                disabled={authLoading || Boolean(supabaseRuntimeError)}
              >
                {authLoading ? "Procesando..." : "Registrarme"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!perfilLoading && user && !perfilFinanciero) {
    return (
      <main style={pageStyle} className="app-shell">
        <div style={containerStyle}>
          <div style={{ ...cardStyle, maxWidth: 680, margin: "40px auto" }}>
            <h1 style={{ marginTop: 0 }}>Configurá tu saldo inicial</h1>
            <p style={{ color: "#94a3b8" }}>
              Indicá cuánto dinero tenés actualmente como punto de partida.
            </p>
            {perfilError && <p style={{ color: "#fca5a5" }}>{perfilError}</p>}
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ color: "#cbd5e1", display: "grid", gap: 6 }}>
                Saldo inicial
                <input
                  type="number"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  style={inputStyle}
                  placeholder="0"
                />
              </label>
              <label style={{ color: "#cbd5e1", display: "grid", gap: 6 }}>
                Moneda
                <input value="ARS" readOnly style={{ ...inputStyle, opacity: 0.85 }} />
              </label>
            </div>
            <div style={{ marginTop: 14 }}>
              <button onClick={guardarPerfilInicial} style={buttonStyle} disabled={perfilSaving}>
                {perfilSaving ? "Guardando..." : "Guardar y entrar al tablero"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle} className="app-shell">
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #020617;
          overflow-x: hidden;
        }
        body {
          min-height: 100dvh;
          width: 100%;
        }
        *, *::before, *::after { box-sizing: border-box; }
        .app-container { width: 100%; max-width: 1240px; margin: 0 auto; }
        .desktop-table { display: block; }
        .mobile-cards { display: none; }
        .app-shell button { transition: transform .15s ease, filter .2s ease, opacity .2s ease; }
        .app-shell button:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .app-shell button:disabled { opacity: .65; cursor: not-allowed; transform: none; }
        .app-shell input:focus,
        .app-shell select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, .25);
        }
        .desktop-table table tbody tr:hover { background: rgba(30, 41, 59, 0.45); }
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: grid; gap: 14px; }
          .app-shell { padding: max(10px, env(safe-area-inset-top)) 16px max(14px, env(safe-area-inset-bottom)); }
          .app-container { max-width: none; margin: 0; }
          .header-row { position: relative; justify-content: space-between !important; align-items: center !important; margin-bottom: 16px !important; }
          .header-title { display: none !important; }
          .user-menu-btn,
          .nav-menu-btn { width: 40px !important; height: 40px !important; }
          .desktop-tabs-wrap { display: none !important; }
          .mobile-menu-wrap { display: block !important; }
          .user-menu-dropdown {
            left: 0 !important;
            right: auto !important;
            min-width: 180px !important;
            max-width: calc(100vw - 32px) !important;
          }
          .nav-menu-dropdown {
            right: 0 !important;
            left: auto !important;
            min-width: 180px !important;
            max-width: min(240px, calc(100vw - 32px));
          }
          .mobile-tight-card { padding: 14px !important; }
          .mobile-saldo { font-size: clamp(30px, 8vw, 34px) !important; }
          .mobile-periodo { font-size: clamp(24px, 7vw, 28px) !important; }
          .mobile-filtros button,
          .mobile-filtros input,
          .mobile-filtros select { padding: 8px 10px !important; }
          .mobile-chart-title { font-size: 20px !important; }
        }
      `}</style>

      <div style={containerStyle} className="app-container">
        <div
          className="header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div className="mobile-menu-wrap" style={{ position: "relative", display: "none" }} ref={menuUsuarioRef}>
            <button
              onClick={() => {
                setMenuUsuarioAbierto((prev) => !prev);
                setMenuNavegacionAbierto(false);
              }}
              aria-label="Abrir menú de configuración"
              className="user-menu-btn"
              style={{
                ...buttonStyle,
                width: 44,
                height: 44,
                padding: "0",
                borderRadius: "12px",
                background: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "none",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ⚙️
            </button>

            {menuUsuarioAbierto && (
              <div
                className="user-menu-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  left: 0,
                  right: "auto",
                  minWidth: "220px",
                  background: "#0b1220",
                  border: "1px solid #263244",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px rgba(2, 6, 23, 0.35)",
                  overflow: "hidden",
                  zIndex: 20,
                }}
              >
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #1e293b", color: "#cbd5e1", fontWeight: 600 }}>
                  {nombreMostradoUsuario}
                </div>
                <button onClick={() => navegarA("ajustes")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>⚙️ Ajustes</button>
                <button onClick={() => navegarA("configuracion")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>💰 Saldo inicial</button>
                <button onClick={() => { setMenuUsuarioAbierto(false); setMenuNavegacionAbierto(false); cerrarSesion(); }} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>🚪 Cerrar sesión</button>
                <button onClick={() => { setMenuUsuarioAbierto(false); setMenuNavegacionAbierto(false); prepararEliminacionCuenta(); }} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}>🗑️ Eliminar cuenta</button>
              </div>
            )}
          </div>

          <h1 className="header-title" style={{ fontSize: "20px", margin: 0, letterSpacing: "-0.01em", color: "#cbd5e1" }}>Tablero financiero</h1>

          <div className="mobile-menu-wrap" style={{ position: "relative", display: "none" }} ref={menuNavegacionRef}>
            <button
              onClick={() => {
                setMenuNavegacionAbierto((prev) => !prev);
                setMenuUsuarioAbierto(false);
              }}
              aria-label="Abrir menú de navegación"
              className="nav-menu-btn"
              style={{
                ...buttonStyle,
                width: 44,
                height: 44,
                padding: "0",
                borderRadius: "12px",
                background: "#1e293b",
                border: "1px solid #334155",
                boxShadow: "none",
                fontSize: "20px",
                lineHeight: 1,
              }}
            >
              ☰
            </button>

            {menuNavegacionAbierto && (
              <div
                className="nav-menu-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  left: "auto",
                  minWidth: "220px",
                  background: "#0b1220",
                  border: "1px solid #263244",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px rgba(2, 6, 23, 0.35)",
                  overflow: "hidden",
                  zIndex: 30,
                }}
              >
                <button onClick={() => navegarA("resumen")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>Resumen</button>
                <button onClick={() => navegarA("movimientos")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>Movimientos</button>
                <button onClick={() => navegarA("agregar")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>Agregar</button>
                <button onClick={() => navegarA("importar")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>Importar</button>
                <button onClick={() => navegarA("categorias")} style={{ width: "100%", textAlign: "left", padding: "11px 14px", background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer" }}>Categorías</button>
              </div>
            )}
          </div>
        </div>

        <div
          className="desktop-tabs-wrap"
          style={{
            ...cardStyle,
            marginBottom: "16px",
            padding: "10px",
            background: "linear-gradient(180deg, #0f172a 0%, #0b1220 100%)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              onClick={() => setTabActiva("resumen")}
              style={{
                ...buttonStyle,
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "10px",
                background:
                  tabActiva === "resumen"
                    ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                    : "#1e293b",
                border: tabActiva === "resumen" ? "1px solid #60a5fa" : "1px solid #334155",
                boxShadow:
                  tabActiva === "resumen" ? "0 8px 20px rgba(37, 99, 235, 0.28)" : "none",
                color: "#ffffff",
              }}
            >
              Resumen
            </button>
            <button
              onClick={() => setTabActiva("movimientos")}
              style={{
                ...buttonStyle,
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "10px",
                background:
                  tabActiva === "movimientos"
                    ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                    : "#1e293b",
                border: tabActiva === "movimientos" ? "1px solid #60a5fa" : "1px solid #334155",
                boxShadow:
                  tabActiva === "movimientos" ? "0 8px 20px rgba(37, 99, 235, 0.28)" : "none",
                color: "#ffffff",
              }}
            >
              Movimientos
            </button>
            <button
              onClick={() => setTabActiva("agregar")}
              style={{
                ...buttonStyle,
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "10px",
                background:
                  tabActiva === "agregar"
                    ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                    : "#1e293b",
                border: tabActiva === "agregar" ? "1px solid #60a5fa" : "1px solid #334155",
                boxShadow:
                  tabActiva === "agregar" ? "0 8px 20px rgba(37, 99, 235, 0.28)" : "none",
                color: "#ffffff",
              }}
            >
              Agregar
            </button>
            <button
              onClick={() => setTabActiva("importar")}
              style={{
                ...buttonStyle,
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "10px",
                background:
                  tabActiva === "importar"
                    ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                    : "#1e293b",
                border: tabActiva === "importar" ? "1px solid #60a5fa" : "1px solid #334155",
                boxShadow:
                  tabActiva === "importar" ? "0 8px 20px rgba(37, 99, 235, 0.28)" : "none",
                color: "#ffffff",
              }}
            >
              Importar
            </button>
            <button
              onClick={() => setTabActiva("categorias")}
              style={{
                ...buttonStyle,
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "10px",
                background:
                  tabActiva === "categorias"
                    ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                    : "#1e293b",
                border: tabActiva === "categorias" ? "1px solid #60a5fa" : "1px solid #334155",
                boxShadow:
                  tabActiva === "categorias" ? "0 8px 20px rgba(37, 99, 235, 0.28)" : "none",
                color: "#ffffff",
              }}
            >
              Categorías
            </button>
            <button
              onClick={() => setTabActiva("configuracion")}
              style={{
                ...buttonStyle,
                padding: "10px 12px",
                fontSize: "14px",
                borderRadius: "10px",
                background:
                  tabActiva === "configuracion"
                    ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                    : "#1e293b",
                border: tabActiva === "configuracion" ? "1px solid #60a5fa" : "1px solid #334155",
                boxShadow:
                  tabActiva === "configuracion" ? "0 8px 20px rgba(37, 99, 235, 0.28)" : "none",
                color: "#ffffff",
              }}
            >
              Saldo inicial
            </button>
          </div>
        </div>

        {perfilError && (
          <div
            style={{
              ...cardStyle,
              border: "1px solid #7f1d1d",
              background: "rgba(127, 29, 29, 0.2)",
              color: "#fecaca",
              marginBottom: "24px",
            }}
          >
            {perfilError}
          </div>
        )}

        {tabActiva === "resumen" && (
          <>
            <div
              className="mobile-tight-card"
              style={{
                ...cardStyle,
                marginBottom: "16px",
                padding: "16px",
                borderRadius: "22px",
                background: "linear-gradient(145deg, #0b2a4a 0%, #123f48 100%)",
                border: "1px solid #1e4a66",
              }}
            >
              <h3 style={{ ...labelStyle, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px", fontSize: "12px", color: "#cfe9ff" }}>Saldo disponible</h3>
              <div className="mobile-saldo" style={{ ...valueStyle, fontSize: "clamp(30px, 8vw, 34px)", marginTop: 0, color: saldoActual >= 0 ? "#86efac" : "#fca5a5" }}>
                {money(saldoActual, monedaActiva)}
              </div>
              <div style={{ color: "#bfdbfe", fontSize: "12px", marginTop: "6px" }}>Calculado con todos los movimientos</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => {
                    setTabActiva("agregar");
                    setTipo("Ingreso");
                  }}
                  style={{
                    border: "1px solid rgba(167, 243, 208, 0.45)",
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#dcfce7",
                    borderRadius: 12,
                    padding: "8px 10px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  + Ingreso
                </button>
                <button
                  onClick={() => {
                    setTabActiva("agregar");
                    setTipo("Gasto");
                  }}
                  style={{
                    border: "1px solid rgba(254, 202, 202, 0.45)",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#fee2e2",
                    borderRadius: 12,
                    padding: "8px 10px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  - Gasto
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div className="mobile-tight-card" style={{ ...cardStyle, padding: "12px 14px", borderRadius: "16px" }}>
                <h3 style={{ ...labelStyle, textTransform: "uppercase", letterSpacing: ".04em", fontSize: "12px" }}>Gastos del período</h3>
                <div className="mobile-periodo" style={{ ...valueStyle, fontSize: "clamp(20px, 5.5vw, 24px)", color: "#f87171", marginTop: "6px" }}>{money(totalGastos, monedaActiva)}</div>
              </div>

              <div className="mobile-tight-card" style={{ ...cardStyle, padding: "12px 14px", borderRadius: "16px" }}>
                <h3 style={{ ...labelStyle, textTransform: "uppercase", letterSpacing: ".04em", fontSize: "12px" }}>Ingresos del período</h3>
                <div className="mobile-periodo" style={{ ...valueStyle, fontSize: "clamp(20px, 5.5vw, 24px)", color: "#34d399", marginTop: "6px" }}>{money(totalIngresos, monedaActiva)}</div>
              </div>
            </div>

            <div className="mobile-tight-card mobile-filtros" style={{ ...cardStyle, marginBottom: "12px", padding: "12px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: "Día", value: new Date().toISOString().slice(0, 10), onClick: () => setMesSeleccionado(new Date().toISOString().slice(0, 10)) },
                  { label: "Semana", value: new Date().toISOString().slice(0, 7), onClick: () => setMesSeleccionado(new Date().toISOString().slice(0, 7)) },
                  { label: "Mes", value: new Date().toISOString().slice(0, 7), onClick: () => setMesSeleccionado(new Date().toISOString().slice(0, 7)) },
                  { label: "Año", value: new Date().toISOString().slice(0, 4), onClick: () => setMesSeleccionado(new Date().toISOString().slice(0, 4)) },
                  { label: "Todos", value: "", onClick: setTodos },
                ].map((chip) => {
                  const activo = chip.value ? mesSeleccionado === chip.value : !mesSeleccionado;
                  return (
                    <button
                      key={chip.label}
                      onClick={chip.onClick}
                      style={{
                        padding: "7px 10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "999px",
                        border: activo ? "1px solid #60a5fa" : "1px solid #334155",
                        background: activo ? "rgba(37, 99, 235, 0.3)" : "#1e293b",
                        color: "#e2e8f0",
                        minHeight: 32,
                      }}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: "12px", textAlign: "center", padding: "14px" }}>
              <h2 className="mobile-chart-title" style={{ marginTop: 0, marginBottom: "10px", fontSize: "20px" }}>Gastos por categoría</h2>
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <div style={{ width: "100%", maxWidth: 200 }}>
                  <PieChartSimple data={porCategoria} currency={monedaActiva} />
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: "16px", padding: "14px 16px" }}>
              <div style={{ display: "grid", gap: 8 }}>
                {porCategoria.slice(0, 5).map((item, idx) => {
                  const total = porCategoria.reduce((acc, cat) => acc + Number(cat.value || 0), 0);
                  const porcentaje = total ? Math.round((item.value / total) * 100) : 0;
                  const categoriaEncontrada = categorias.find((cat) => cat.nombre === item.name);
                  const iconoResumen = categoriaEncontrada?.icono || iconoCategoria(item.name);
                  return (
                    <div key={item.name} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto auto", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 16 }}>{iconoResumen}</span>
                      <span style={{ color: "#e2e8f0", fontSize: 14 }}>{item.name}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>{porcentaje}%</span>
                      <strong style={{ fontSize: 14 }}>{money(item.value, monedaActiva)}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ ...cardStyle, marginBottom: "84px", padding: "14px 16px", opacity: 0.9 }}>
              <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "18px" }}>Resumen del mes</h2>

              {!resumen ? (
                <div style={{ color: "#94a3b8", fontSize: 14 }}>No hay datos</div>
              ) : (
                <div style={{ display: "grid", gap: 8, color: "#cbd5e1", fontSize: 14 }}>
                  <div>• Promedio diario: <strong>{money(resumen.promedio, monedaActiva)}</strong></div>
                  {resumen.peorDia && <div>• Día con más gasto: <strong>{resumen.peorDia[0]} ({money(resumen.peorDia[1], monedaActiva)})</strong></div>}
                  <div>
                    {resumen.estado === "positivo" ? (
                      <span style={{ color: "#10b981" }}>• Estado: superávit</span>
                    ) : (
                      <span style={{ color: "#ef4444" }}>• Estado: déficit</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setTabActiva("agregar")}
              style={{
                position: "fixed",
                right: "18px",
                bottom: "22px",
                width: "52px",
                height: "52px",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#fff",
                fontSize: "28px",
                lineHeight: 1,
                cursor: "pointer",
                boxShadow: "0 12px 26px rgba(37, 99, 235, 0.4)",
                zIndex: 20,
              }}
              aria-label="Agregar movimiento"
            >
              +
            </button>
          </>
        )}

        {tabActiva === "movimientos" && (
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
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
                              money(m.monto, monedaActiva)
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
                      {editandoId === m.id ? (
                        <>
                          <input
                            type="date"
                            value={editData.fecha}
                            onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
                            style={inputStyle}
                          />

                          <select
                            value={editData.tipo}
                            onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}
                            style={inputStyle}
                          >
                            <option value="Gasto">Gasto</option>
                            <option value="Ingreso">Ingreso</option>
                          </select>

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

                          <input
                            value={editData.descripcion}
                            onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                            style={inputStyle}
                          />

                          <input
                            type="number"
                            value={editData.monto}
                            onChange={(e) => setEditData({ ...editData, monto: e.target.value })}
                            style={inputStyle}
                          />

                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button onClick={guardarEdicion} style={{ ...buttonStyle, background: "#15803d" }}>
                              {saving ? "Guardando..." : "Guardar"}
                            </button>
                            <button onClick={() => setEditandoId(null)} style={{ ...buttonStyle, background: "#475569" }}>
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{m.categoria}</strong>
                            <span style={{ color: "#94a3b8" }}>{m.tipo}</span>
                          </div>

                          <div style={{ color: "#94a3b8" }}>{m.descripcion}</div>

                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{m.fecha}</span>
                            <strong>{money(m.monto, monedaActiva)}</strong>
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button onClick={() => iniciarEdicion(m)} style={buttonStyle}>
                              Editar
                            </button>
                            <button onClick={() => borrarMovimiento(m.id)} style={{ ...buttonStyle, background: "#7f1d1d" }}>
                              Borrar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tabActiva === "agregar" && (
          <>
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
                        <div style={{ ...cardStyle, marginBottom: "24px" }}>
              <h2 style={{ marginTop: 0 }}>Carga rápida</h2>
              <p style={{ color: "#94a3b8", marginTop: 0 }}>
                Pegá texto libre, una línea por movimiento. Podés incluir fecha y monto en formatos simples.
              </p>
              {cargaRapidaError && <p style={{ color: "#fca5a5", marginTop: 0 }}>{cargaRapidaError}</p>}
              {cargaRapidaSuccess && <p style={{ color: "#86efac", marginTop: 0 }}>{cargaRapidaSuccess}</p>}

              <textarea
                value={cargaRapidaTexto}
                onChange={(e) => setCargaRapidaTexto(e.target.value)}
                placeholder={`hoy supermercado 12500\nayer combustible 30000\n16/04 peaje 4177,19\nsueldo abril 2800000`}
                style={{ ...inputStyle, minHeight: 130, resize: "vertical", fontFamily: "inherit" }}
              />
              <p style={{ color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
                Revisá la previsualización antes de guardar. Nada se carga automáticamente.
              </p>

              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={procesarCargaRapida} style={buttonStyle}>
                  Procesar
                </button>
                <button
                  onClick={() => setCargaRapidaPreview([])}
                  style={{ ...buttonStyle, background: "#475569", boxShadow: "none" }}
                >
                  Limpiar previsualización
                </button>
              </div>

              {cargaRapidaPreview.length > 0 && (
                <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                  <h3 style={{ margin: 0 }}>Previsualización editable ({cargaRapidaPreview.length})</h3>
                  {cargaRapidaPreview.map((fila) => (
                    <div
                      key={fila.tempId}
                      style={{
                        border: "1px solid #334155",
                        borderRadius: 12,
                        padding: 12,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 8,
                      }}
                    >
                      <input
                        type="date"
                        value={fila.fecha}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "fecha", e.target.value)}
                        style={inputStyle}
                      />
                      <select
                        value={fila.tipo}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "tipo", e.target.value)}
                        style={inputStyle}
                      >
                        <option value="Gasto">Gasto</option>
                        <option value="Ingreso">Ingreso</option>
                      </select>
                      <input
                        value={fila.categoria}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "categoria", e.target.value)}
                        style={inputStyle}
                        placeholder="Categoría"
                      />
                      <input
                        value={fila.descripcion}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "descripcion", e.target.value)}
                        style={inputStyle}
                        placeholder="Descripción"
                      />
                      <input
                        type="number"
                        value={fila.monto}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "monto", e.target.value)}
                        style={inputStyle}
                        placeholder="Monto"
                      />
                      <input
                        value={fila.medio_pago || ""}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "medio_pago", e.target.value)}
                        style={inputStyle}
                        placeholder="Medio de pago (opcional)"
                      />
                      <input
                        value={fila.cuotas || ""}
                        onChange={(e) => actualizarFilaCargaRapida(fila.tempId, "cuotas", e.target.value)}
                        style={inputStyle}
                        placeholder="Cuotas (opcional)"
                      />
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={confirmarCargaRapida}
                      style={{ ...buttonStyle, background: "#15803d", boxShadow: "0 8px 20px rgba(21, 128, 61, .28)" }}
                      disabled={cargaRapidaSaving}
                    >
                      {cargaRapidaSaving ? "Guardando..." : "Confirmar y guardar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tabActiva === "importar" && (
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Importar resumen</h2>
            <p style={{ color: "#94a3b8", marginTop: 0 }}>
              Pegá movimientos copiados desde banco, tarjeta o billetera virtual para procesarlos en bloque.
            </p>
            {importarResumenError && <p style={{ color: "#fca5a5", marginTop: 0 }}>{importarResumenError}</p>}
            {importarResumenSuccess && <p style={{ color: "#86efac", marginTop: 0 }}>{importarResumenSuccess}</p>}

            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#cbd5e1" }}>
                <input
                  type="checkbox"
                  checked={importarResumenUsarFechaPago}
                  onChange={(e) => setImportarResumenUsarFechaPago(e.target.checked)}
                />
                Usar fecha del resumen (recomendado)
              </label>
              <label style={{ color: "#cbd5e1", display: "grid", gap: 6 }}>
                Fecha de pago del resumen
                <input
                  type="date"
                  value={importarResumenFechaPago}
                  onChange={(e) => setImportarResumenFechaPago(e.target.value)}
                  style={inputStyle}
                  disabled={!importarResumenUsarFechaPago}
                />
              </label>
              {importarResumenUsarFechaPago ? (
                <p style={{ color: "#93c5fd", margin: 0 }}>
                  Los movimientos se guardarán con fecha: {formatearFecha(importarResumenFechaPago)}
                </p>
              ) : (
                <p style={{ color: "#94a3b8", margin: 0 }}>
                  Se usará la fecha original detectada en cada línea del resumen.
                </p>
              )}
            </div>

            <textarea
              value={importarResumenTexto}
              onChange={(e) => setImportarResumenTexto(e.target.value)}
              placeholder={`16/04/2026 SUPERMERCADO 84.200,00\n17/04/2026 COMBUSTIBLE 35.500,50\n18/04/2026 SUSCRIPCION 3.490,00\n19/04/2026 TRANSFERENCIA RECIBIDA 50.000,00`}
              style={{ ...inputStyle, minHeight: 130, resize: "vertical", fontFamily: "inherit" }}
            />
            <p style={{ color: "#94a3b8", marginTop: 8, marginBottom: 0 }}>
              Revisá la previsualización antes de guardar. Nada se carga automáticamente.
            </p>

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={procesarImportarResumen} style={buttonStyle}>
                Procesar resumen
              </button>
              <button
                onClick={() => setImportarResumenPreview([])}
                style={{ ...buttonStyle, background: "#475569", boxShadow: "none" }}
              >
                Limpiar previsualización
              </button>
            </div>

            {importarResumenPreview.length > 0 && (
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <h3 style={{ margin: 0 }}>Previsualización editable ({importarResumenPreview.length})</h3>
                {importarResumenPreview.map((fila) => (
                  <div
                    key={fila.tempId}
                    style={{
                      border: "1px solid #334155",
                      borderRadius: 12,
                      padding: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 8,
                    }}
                  >
                    <input
                      type="date"
                      value={fila.fecha}
                      onChange={(e) => actualizarFilaImportarResumen(fila.tempId, "fecha", e.target.value)}
                      style={inputStyle}
                      disabled={importarResumenUsarFechaPago}
                    />
                    <select
                      value={fila.tipo}
                      onChange={(e) => actualizarFilaImportarResumen(fila.tempId, "tipo", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="Gasto">Gasto</option>
                      <option value="Ingreso">Ingreso</option>
                    </select>
                    <input
                      value={fila.categoria}
                      onChange={(e) => actualizarFilaImportarResumen(fila.tempId, "categoria", e.target.value)}
                      style={inputStyle}
                      placeholder="Categoría"
                    />
                    <input
                      value={fila.descripcion}
                      onChange={(e) => actualizarFilaImportarResumen(fila.tempId, "descripcion", e.target.value)}
                      style={inputStyle}
                      placeholder="Descripción"
                    />
                    <input
                      type="number"
                      value={fila.monto}
                      onChange={(e) => actualizarFilaImportarResumen(fila.tempId, "monto", e.target.value)}
                      style={inputStyle}
                      placeholder="Monto"
                    />
                  </div>
                ))}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={confirmarImportarResumen}
                    style={{ ...buttonStyle, background: "#15803d", boxShadow: "0 8px 20px rgba(21, 128, 61, .28)" }}
                    disabled={importarResumenSaving}
                  >
                    {importarResumenSaving ? "Guardando..." : "Confirmar y guardar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tabActiva === "categorias" && (
          <div style={{ ...cardStyle, marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0 }}>Gestión de categorías</h2>
            <p style={{ color: "#94a3b8", marginTop: 0 }}>
              Podés editar ícono y nombre de las categorías, o eliminarlas. Si tienen movimientos asociados, primero tenés que reasignarlos.
            </p>
            {categoriaGestionError && <p style={{ color: "#fca5a5", marginTop: 0 }}>{categoriaGestionError}</p>}
            {categoriaGestionMsg && <p style={{ color: "#86efac", marginTop: 0 }}>{categoriaGestionMsg}</p>}
            {categorias.length === 0 ? (
              <p style={{ color: "#94a3b8", marginBottom: 0 }}>No hay categorías creadas todavía.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {categorias.map((cat) => {
                  const cantidadMovs = movimientos.filter((m) => m.categoria === cat.nombre).length;
                  const enEdicion = categoriaEditandoId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        border: "1px solid #334155",
                        borderRadius: 10,
                        padding: "10px 12px",
                      }}
                    >
                      {enEdicion ? (
                        <div style={{ display: "grid", gap: 8, width: "100%" }}>
                          <label style={{ color: "#cbd5e1", fontSize: 13, display: "grid", gap: 6 }}>
                            Nombre
                            <input value={categoriaEditNombre} onChange={(e) => setCategoriaEditNombre(e.target.value)} style={inputStyle} />
                          </label>
                          <label style={{ color: "#cbd5e1", fontSize: 13, display: "grid", gap: 6 }}>
                            Ícono
                            <input
                              value={categoriaEditIcono}
                              onChange={(e) => setCategoriaEditIcono(e.target.value)}
                              style={inputStyle}
                              maxLength={4}
                              placeholder="😀"
                            />
                          </label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {EMOJIS_CATEGORIA.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setCategoriaEditIcono(emoji)}
                                style={{
                                  ...buttonStyle,
                                  padding: "6px 10px",
                                  background: categoriaEditIcono === emoji ? "#1d4ed8" : "#1e293b",
                                  boxShadow: "none",
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button onClick={() => guardarEdicionCategoria(cat)} style={{ ...buttonStyle, padding: "8px 10px", background: "#15803d", boxShadow: "none" }} disabled={categoriaGestionLoading}>Guardar</button>
                            <button onClick={cancelarEdicionCategoria} style={{ ...buttonStyle, padding: "8px 10px", background: "#1e293b", boxShadow: "none" }} disabled={categoriaGestionLoading}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span>{cat.icono || iconoCategoria(cat.nombre)}</span>
                              <span>{cat.nombre}</span>
                            </strong>
                            <div style={{ color: "#94a3b8", fontSize: 13 }}>{cantidadMovs} movimientos</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button onClick={() => iniciarEdicionCategoria(cat)} style={{ ...buttonStyle, padding: "8px 10px", background: "#1d4ed8", boxShadow: "none" }} disabled={categoriaGestionLoading}>✏️ Editar</button>
                            <button
                              onClick={() => intentarEliminarCategoria(cat)}
                              style={{ ...buttonStyle, padding: "8px 10px", background: "#7f1d1d", boxShadow: "none" }}
                              disabled={categoriaGestionLoading}
                              title="Eliminar categoría"
                            >
                              🗑️ Eliminar categoría
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tabActiva === "ajustes" && (
          <div style={{ ...cardStyle, marginBottom: "24px", maxWidth: 700 }}>
            <h2 style={{ marginTop: 0 }}>Ajustes de usuario</h2>
            <p style={{ color: "#94a3b8", marginTop: 0 }}>
              Configurá tu alias visible y administrá la privacidad de tu cuenta.
            </p>
            <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
              <label style={{ color: "#cbd5e1", display: "grid", gap: 6 }}>
                Alias / apodo
                <input
                  type="text"
                  placeholder="Fran"
                  value={aliasPerfil}
                  onChange={(e) => setAliasPerfil(e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={guardarConfiguracionPerfil} style={buttonStyle} disabled={perfilSaving || !perfilFinanciero}>
                {perfilSaving ? "Guardando..." : "Guardar alias"}
              </button>
              <button onClick={borrarTodosMisDatos} style={{ ...buttonStyle, background: "#7f1d1d", boxShadow: "none" }} disabled={perfilSaving}>
                {perfilSaving ? "Procesando..." : "Borrar todos mis datos"}
              </button>
              <button onClick={prepararEliminacionCuenta} style={{ ...buttonStyle, background: "#991b1b", boxShadow: "none" }} disabled={perfilSaving}>
                Eliminar cuenta
              </button>
            </div>
          </div>
        )}

        {tabActiva === "configuracion" && (
          <div style={{ ...cardStyle, marginBottom: "24px", maxWidth: 700 }}>
            <h2 style={{ marginTop: 0 }}>Saldo inicial</h2>
            <p style={{ color: "#94a3b8", marginTop: 0 }}>
              Ajustá tu saldo inicial y moneda para que el tablero refleje tu punto de partida real.
            </p>

            <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
              <label style={{ color: "#cbd5e1", display: "grid", gap: 6 }}>
                Saldo inicial
                <input
                  type="number"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={{ color: "#cbd5e1", display: "grid", gap: 6 }}>
                Moneda
                <select value={moneda} onChange={(e) => setMoneda(e.target.value)} style={inputStyle}>
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="BRL">BRL</option>
                  <option value="MXN">MXN</option>
                </select>
              </label>

            </div>

            <div style={{ marginTop: 14 }}>
              <button onClick={guardarConfiguracionPerfil} style={buttonStyle} disabled={perfilSaving || !perfilFinanciero}>
                {perfilSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}

        {categoriaEliminando && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2, 6, 23, 0.78)",
              display: "grid",
              placeItems: "center",
              zIndex: 50,
              padding: 16,
            }}
          >
            <div style={{ ...cardStyle, width: "100%", maxWidth: 560 }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Esta categoría tiene movimientos asociados</h3>
              <p style={{ color: "#cbd5e1", marginTop: 0 }}>
                La categoría <strong>{categoriaEliminando.nombre}</strong> tiene{" "}
                <strong>{categoriaEliminando.movimientosAsociados}</strong> movimientos.
              </p>
              <p style={{ color: "#cbd5e1", marginTop: 0 }}>
                Seleccioná a qué categoría querés moverlos antes de eliminar.
              </p>
              <select
                value={categoriaDestinoReasignacion}
                onChange={(e) => setCategoriaDestinoReasignacion(e.target.value)}
                style={inputStyle}
              >
                <option value="">Seleccioná categoría de destino</option>
                {categorias
                  .filter((c) => c.id !== categoriaEliminando.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
              </select>
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button
                  onClick={confirmarReasignarYEliminarCategoria}
                  style={{ ...buttonStyle, background: "#7f1d1d", boxShadow: "none" }}
                  disabled={categoriaGestionLoading}
                >
                  {categoriaGestionLoading ? "Procesando..." : "Reasignar y eliminar categoría"}
                </button>
                <button
                  onClick={() => {
                    setCategoriaEliminando(null);
                    setCategoriaDestinoReasignacion("");
                  }}
                  style={{ ...buttonStyle, background: "#475569", boxShadow: "none" }}
                  disabled={categoriaGestionLoading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
