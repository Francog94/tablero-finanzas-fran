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
];

function money(n) {
return new Intl.NumberFormat("es-AR", {
style: "currency",
currency: "ARS",
}).format(Number(n || 0));
}

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
const { data } = await supabase
.from("movimientos")
.select("*")
.order("fecha", { ascending: false });

```
setMovimientos(data || []);
setLoading(false);
```

}

const movimientosFiltrados = useMemo(() => {
return movimientos.filter((m) => {
const texto = `${m.categoria} ${m.descripcion}`.toLowerCase();
const matchTexto = texto.includes(filtroTexto.toLowerCase());
const matchTipo =
filtroTipo === "Todos" ? true : m.tipo === filtroTipo;
const matchMes = mesSeleccionado
? m.fecha.startsWith(mesSeleccionado)
: true;

```
  return matchTexto && matchTipo && matchMes;
});
```

}, [movimientos, filtroTexto, filtroTipo, mesSeleccionado]);

const totalGastos = movimientosFiltrados
.filter((m) => m.tipo === "Gasto")
.reduce((acc, m) => acc + Number(m.monto || 0), 0);

const totalIngresos = movimientosFiltrados
.filter((m) => m.tipo === "Ingreso")
.reduce((acc, m) => acc + Number(m.monto || 0), 0);

const neto = totalIngresos - totalGastos;

async function agregarMovimiento() {
if (!categoria || !descripcion || !monto) return;

```
const nuevo = {
  tipo,
  fecha,
  categoria,
  descripcion,
  monto: Number(monto),
};

const { data } = await supabase
  .from("movimientos")
  .insert([nuevo])
  .select();

setMovimientos((prev) => [data[0], ...prev]);

setCategoria("");
setDescripcion("");
setMonto("");
```

}

async function borrarMovimiento(id) {
await supabase.from("movimientos").delete().eq("id", id);
setMovimientos((prev) => prev.filter((m) => m.id !== id));
}

function iniciarEdicion(m) {
setEditandoId(m.id);
setEditData(m);
}

async function guardarEdicion() {
await supabase
.from("movimientos")
.update(editData)
.eq("id", editandoId);

```
setEditandoId(null);
cargarMovimientos();
```

}

return (
<main style={{ padding: 20, color: "white" }}> <h1>Tablero financiero Fran</h1>

```
  <h3>Total gastos: {money(totalGastos)}</h3>
  <h3>Total ingresos: {money(totalIngresos)}</h3>
  <h3>Neto: {money(neto)}</h3>

  <h2>Agregar movimiento</h2>

  <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
    <option>Gasto</option>
    <option>Ingreso</option>
  </select>

  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

  <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
    <option value="">Categoría</option>
    {CATEGORIAS.map((c) => (
      <option key={c}>{c}</option>
    ))}
  </select>

  <input
    placeholder="Descripción"
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
  />

  <input
    type="number"
    placeholder="Monto"
    value={monto}
    onChange={(e) => setMonto(e.target.value)}
  />

  <button onClick={agregarMovimiento}>Agregar</button>

  <hr />

  <input
    type="month"
    value={mesSeleccionado}
    onChange={(e) => setMesSeleccionado(e.target.value)}
  />

  <input
    placeholder="Buscar"
    value={filtroTexto}
    onChange={(e) => setFiltroTexto(e.target.value)}
  />

  <select
    value={filtroTipo}
    onChange={(e) => setFiltroTipo(e.target.value)}
  >
    <option value="Todos">Todos</option>
    <option value="Gasto">Gasto</option>
    <option value="Ingreso">Ingreso</option>
  </select>

  <h2>Movimientos</h2>

  {loading ? (
    <p>Cargando...</p>
  ) : (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Categoría</th>
          <th>Descripción</th>
          <th>Monto</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {movimientosFiltrados.map((m) => (
          <tr key={m.id}>
            <td>{m.fecha}</td>
            <td>{m.tipo}</td>
            <td>{m.categoria}</td>
            <td>{m.descripcion}</td>
            <td>{money(m.monto)}</td>
            <td>
              <button onClick={() => iniciarEdicion(m)}>Editar</button>
              <button onClick={() => borrarMovimiento(m.id)}>Borrar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</main>
```

);
}
