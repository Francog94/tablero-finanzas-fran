import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Wallet, PiggyBank, TrendingUp, Trash2, Pencil, Plus, Download, Upload } from "lucide-react";

const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#22d3ee", "#fb7185", "#4ade80"];

const initialData = {
  balances: {
    saldoMp: 1357904.82,
    efectivo: 53000,
    pendiente: 12000,
  },
  movimientos: [
    { id: 1, tipo: "Gasto", fecha: "2026-04-15", grupoDia: "Previos", categoria: "Entrenamiento / Familia", descripcion: "Entrenamiento Valen", monto: 40000, cuenta: "Mercado Pago" },
    { id: 2, tipo: "Gasto", fecha: "2026-04-17", grupoDia: "Hoy", categoria: "Entrenamiento / Familia", descripcion: "Entrenamiento Valen (pago de esta semana)", monto: 50000, cuenta: "Mercado Pago" },
    { id: 3, tipo: "Gasto", fecha: "2026-04-17", grupoDia: "Previos", categoria: "Cuidado personal", descripcion: "Peluquero", monto: 15000, cuenta: "Mercado Pago" },
    { id: 4, tipo: "Gasto", fecha: "2026-04-18", grupoDia: "Viernes", categoria: "Comida / Trabajo", descripcion: "Cena en el banco", monto: 21000, cuenta: "Mercado Pago" },
    { id: 5, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Fútbol / Club", descripcion: "Viático jugador 2013", monto: 30000, cuenta: "Mercado Pago" },
    { id: 6, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Fútbol / Club", descripcion: "Viático jugador 2013", monto: 15000, cuenta: "Mercado Pago" },
    { id: 7, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Fútbol / Club", descripcion: "Viático jugador 2013", monto: 15000, cuenta: "Mercado Pago" },
    { id: 8, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Fútbol / Club", descripcion: "Buffet Club El Triunfo", monto: 43500, cuenta: "Mercado Pago" },
    { id: 9, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Fútbol / Club", descripcion: "Entrada Club El Triunfo", monto: 5000, cuenta: "Mercado Pago" },
    { id: 10, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Fútbol / Club", descripcion: "Entradas a IOSFA fútbol 11", monto: 6000, cuenta: "Mercado Pago" },
    { id: 11, tipo: "Gasto", fecha: "2026-04-19", grupoDia: "Finde", categoria: "Ocio / Kiosco", descripcion: "Kiosco fin de semana", monto: 78200, cuenta: "Mercado Pago" },
    { id: 12, tipo: "Ingreso", fecha: "2026-04-20", grupoDia: "Hoy", categoria: "Reintegro / Club", descripcion: "Aportes para remeras Club El Triunfo", monto: 67500, cuenta: "Mercado Pago" },
  ],
  inversiones: [
    { id: 1, fecha: "2026-04-01", ticker: "NVDA", tipo: "CEDEAR", cantidad: 1, precio: 0, moneda: "ARS", total: 0, notas: "Tenencia manual" },
    { id: 2, fecha: "2026-04-01", ticker: "IBM", tipo: "CEDEAR", cantidad: 1, precio: 0, moneda: "ARS", total: 0, notas: "Tenencia manual" },
    { id: 3, fecha: "2026-04-01", ticker: "SPY", tipo: "ETF", cantidad: 1, precio: 0, moneda: "ARS", total: 0, notas: "Tenencia manual" },
  ],
};

const money = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(Number(n || 0));

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TableroFinancieroOnlineFran() {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState({ desde: "", hasta: "", categoria: "all", tipo: "all", texto: "" });
  const [movementForm, setMovementForm] = useState({
    id: 0,
    tipo: "Gasto",
    fecha: new Date().toISOString().slice(0, 10),
    grupoDia: "Hoy",
    categoria: "",
    descripcion: "",
    monto: "",
    cuenta: "Mercado Pago",
  });
  const [investmentForm, setInvestmentForm] = useState({
    id: 0,
    fecha: new Date().toISOString().slice(0, 10),
    ticker: "",
    tipo: "CEDEAR",
    cantidad: "",
    precio: "",
    moneda: "ARS",
    total: "",
    notas: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("fran-online-dashboard");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        // ignore invalid state
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fran-online-dashboard", JSON.stringify(data));
  }, [data]);

  const categorias = useMemo(() => {
    return Array.from(new Set(data.movimientos.map((m) => m.categoria))).sort();
  }, [data.movimientos]);

  const filteredMovimientos = useMemo(() => {
    return data.movimientos.filter((m) => {
      if (filters.desde && m.fecha < filters.desde) return false;
      if (filters.hasta && m.fecha > filters.hasta) return false;
      if (filters.categoria !== "all" && m.categoria !== filters.categoria) return false;
      if (filters.tipo !== "all" && m.tipo !== filters.tipo) return false;
      if (filters.texto) {
        const blob = `${m.descripcion} ${m.categoria} ${m.grupoDia}`.toLowerCase();
        if (!blob.includes(filters.texto.toLowerCase())) return false;
      }
      return true;
    });
  }, [data.movimientos, filters]);

  const totalGastos = filteredMovimientos.filter((m) => m.tipo === "Gasto").reduce((a, b) => a + b.monto, 0);
  const totalIngresos = filteredMovimientos.filter((m) => m.tipo === "Ingreso").reduce((a, b) => a + b.monto, 0);
  const totalLiquido = data.balances.saldoMp + data.balances.efectivo;
  const disponible = totalLiquido - data.balances.pendiente;

  const pieData = Object.entries(
    filteredMovimientos
      .filter((m) => m.tipo === "Gasto")
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.categoria] = (acc[item.categoria] || 0) + item.monto;
        return acc;
      }, {})
  ).map(([name, value]) => ({ name, value }));

  const invByType = Object.entries(
    data.inversiones.reduce<Record<string, number>>((acc, item) => {
      acc[item.tipo] = (acc[item.tipo] || 0) + Number(item.total || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof filteredMovimientos>();
    [...filteredMovimientos]
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .forEach((m) => {
        const arr = map.get(m.fecha) || [];
        arr.push(m);
        map.set(m.fecha, arr);
      });
    return Array.from(map.entries());
  }, [filteredMovimientos]);

  const saveMovement = () => {
    const payload = {
      id: movementForm.id || Date.now(),
      tipo: movementForm.tipo,
      fecha: movementForm.fecha,
      grupoDia: movementForm.grupoDia,
      categoria: movementForm.categoria,
      descripcion: movementForm.descripcion,
      monto: Number(movementForm.monto),
      cuenta: movementForm.cuenta,
    };

    if (!payload.categoria || !payload.descripcion || !payload.monto) return;

    setData((prev) => ({
      ...prev,
      movimientos: movementForm.id
        ? prev.movimientos.map((m) => (m.id === movementForm.id ? payload : m))
        : [...prev.movimientos, payload],
    }));

    setMovementForm({
      id: 0,
      tipo: "Gasto",
      fecha: new Date().toISOString().slice(0, 10),
      grupoDia: "Hoy",
      categoria: "",
      descripcion: "",
      monto: "",
      cuenta: "Mercado Pago",
    });
  };

  const saveInvestment = () => {
    const payload = {
      id: investmentForm.id || Date.now(),
      fecha: investmentForm.fecha,
      ticker: investmentForm.ticker.toUpperCase(),
      tipo: investmentForm.tipo,
      cantidad: Number(investmentForm.cantidad || 0),
      precio: Number(investmentForm.precio || 0),
      moneda: investmentForm.moneda,
      total: Number(investmentForm.total || 0),
      notas: investmentForm.notas,
    };

    if (!payload.ticker) return;

    setData((prev) => ({
      ...prev,
      inversiones: investmentForm.id
        ? prev.inversiones.map((i) => (i.id === investmentForm.id ? payload : i))
        : [...prev.inversiones, payload],
    }));

    setInvestmentForm({
      id: 0,
      fecha: new Date().toISOString().slice(0, 10),
      ticker: "",
      tipo: "CEDEAR",
      cantidad: "",
      precio: "",
      moneda: "ARS",
      total: "",
      notas: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tablero financiero online</h1>
            <p className="text-slate-400 mt-1">Listo para usar en celu y PC. Guarda en el navegador y se puede publicar como app web.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => downloadJson(data, "backup-fran-dashboard.json")}>
              <Download className="w-4 h-4 mr-2" /> Backup JSON
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-2xl">Cómo subirlo online</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cómo dejarlo online de verdad</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-slate-300 space-y-3">
                  <p>La forma más simple es subir esta app a Vercel o Netlify.</p>
                  <p>Para tener datos sincronizados entre PC y celu, necesitás una base en la nube. La más práctica para este caso es Supabase o Firebase.</p>
                  <p>Esta versión ya te sirve como base visual. El siguiente paso técnico sería conectar autenticación y base de datos.</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="gastos" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full md:w-[320px] rounded-2xl">
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="inversiones">Inversiones</TabsTrigger>
          </TabsList>

          <TabsContent value="gastos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle className="text-sm text-slate-400 flex items-center gap-2"><Wallet className="w-4 h-4" /> Mercado Pago</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(data.balances.saldoMp)}</div></CardContent>
              </Card>
              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle className="text-sm text-slate-400">Efectivo</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(data.balances.efectivo)}</div></CardContent>
              </Card>
              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle className="text-sm text-slate-400">Total líquido</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(totalLiquido)}</div></CardContent>
              </Card>
              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle className="text-sm text-slate-400">Disponible ajustado</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(disponible)}</div></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Nuevo movimiento</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><Label>Tipo</Label><Select value={movementForm.tipo} onValueChange={(v) => setMovementForm((s) => ({ ...s, tipo: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Gasto">Gasto</SelectItem><SelectItem value="Ingreso">Ingreso</SelectItem></SelectContent></Select></div>
                  <div><Label>Fecha</Label><Input type="date" value={movementForm.fecha} onChange={(e) => setMovementForm((s) => ({ ...s, fecha: e.target.value }))} /></div>
                  <div><Label>Etiqueta</Label><Input value={movementForm.grupoDia} onChange={(e) => setMovementForm((s) => ({ ...s, grupoDia: e.target.value }))} /></div>
                  <div><Label>Categoría</Label><Input value={movementForm.categoria} onChange={(e) => setMovementForm((s) => ({ ...s, categoria: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Descripción</Label><Input value={movementForm.descripcion} onChange={(e) => setMovementForm((s) => ({ ...s, descripcion: e.target.value }))} /></div>
                  <div><Label>Monto</Label><Input type="number" value={movementForm.monto} onChange={(e) => setMovementForm((s) => ({ ...s, monto: e.target.value }))} /></div>
                  <div><Label>Cuenta</Label><Select value={movementForm.cuenta} onValueChange={(v) => setMovementForm((s) => ({ ...s, cuenta: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Mercado Pago">Mercado Pago</SelectItem><SelectItem value="Efectivo">Efectivo</SelectItem><SelectItem value="Otro">Otro</SelectItem></SelectContent></Select></div>
                  <div className="flex items-end gap-2">
                    <Button onClick={saveMovement} className="rounded-2xl"><Plus className="w-4 h-4 mr-2" />{movementForm.id ? "Guardar cambios" : "Agregar"}</Button>
                    {movementForm.id ? <Button variant="outline" onClick={() => setMovementForm({ id: 0, tipo: "Gasto", fecha: new Date().toISOString().slice(0, 10), grupoDia: "Hoy", categoria: "", descripcion: "", monto: "", cuenta: "Mercado Pago" })}>Cancelar</Button> : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><Label>Desde</Label><Input type="date" value={filters.desde} onChange={(e) => setFilters((s) => ({ ...s, desde: e.target.value }))} /></div>
                  <div><Label>Hasta</Label><Input type="date" value={filters.hasta} onChange={(e) => setFilters((s) => ({ ...s, hasta: e.target.value }))} /></div>
                  <div><Label>Categoría</Label><Select value={filters.categoria} onValueChange={(v) => setFilters((s) => ({ ...s, categoria: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Tipo</Label><Select value={filters.tipo} onValueChange={(v) => setFilters((s) => ({ ...s, tipo: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Gasto">Gasto</SelectItem><SelectItem value="Ingreso">Ingreso</SelectItem></SelectContent></Select></div>
                  <div><Label>Texto</Label><Input value={filters.texto} onChange={(e) => setFilters((s) => ({ ...s, texto: e.target.value }))} /></div>
                  <Button variant="outline" className="w-full" onClick={() => setFilters({ desde: "", hasta: "", categoria: "all", tipo: "all", texto: "" })}>Limpiar filtros</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Distribución de gastos</CardTitle></CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55}>
                        {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => money(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Resumen filtrado</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Movimientos</span><strong>{filteredMovimientos.length}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Gastos</span><strong className="text-rose-400">{money(totalGastos)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Ingresos</span><strong className="text-emerald-400">{money(totalIngresos)}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Neto</span><strong>{money(totalIngresos - totalGastos)}</strong></div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
              <CardHeader><CardTitle>Movimientos</CardTitle></CardHeader>
              <CardContent className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Etiqueta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovimientos
                      .sort((a, b) => a.fecha.localeCompare(b.fecha))
                      .map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.fecha}</TableCell>
                          <TableCell><Badge variant="outline">{m.grupoDia}</Badge></TableCell>
                          <TableCell>{m.tipo}</TableCell>
                          <TableCell>{m.categoria}</TableCell>
                          <TableCell>{m.descripcion}</TableCell>
                          <TableCell className={m.tipo === "Gasto" ? "text-rose-400" : "text-emerald-400"}>{money(m.monto)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="icon" variant="outline" onClick={() => setMovementForm({ ...m, monto: String(m.monto) })}><Pencil className="w-4 h-4" /></Button>
                              <Button size="icon" variant="outline" onClick={() => setData((prev) => ({ ...prev, movimientos: prev.movimientos.filter((x) => x.id !== m.id) }))}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
              <CardHeader><CardTitle>Reporte por día</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {groupedByDate.map(([date, items]) => {
                  const gastos = items.filter((i) => i.tipo === "Gasto").reduce((a, b) => a + b.monto, 0);
                  const ingresos = items.filter((i) => i.tipo === "Ingreso").reduce((a, b) => a + b.monto, 0);
                  return (
                    <Card key={date} className="rounded-2xl bg-slate-950 border-slate-800">
                      <CardHeader>
                        <CardTitle className="text-base flex justify-between gap-4 flex-wrap">
                          <span>{date}</span>
                          <span className="text-sm text-slate-400">Neto: {money(ingresos - gastos)}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4 text-sm border-b border-slate-800 pb-2">
                            <div>
                              <div className="font-medium">{item.descripcion}</div>
                              <div className="text-slate-400">{item.categoria} · {item.grupoDia}</div>
                            </div>
                            <div className={item.tipo === "Gasto" ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>{money(item.monto)}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inversiones" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-2 rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Nueva inversión</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><Label>Fecha</Label><Input type="date" value={investmentForm.fecha} onChange={(e) => setInvestmentForm((s) => ({ ...s, fecha: e.target.value }))} /></div>
                  <div><Label>Ticker</Label><Input value={investmentForm.ticker} onChange={(e) => setInvestmentForm((s) => ({ ...s, ticker: e.target.value }))} /></div>
                  <div><Label>Tipo</Label><Select value={investmentForm.tipo} onValueChange={(v) => setInvestmentForm((s) => ({ ...s, tipo: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CEDEAR">CEDEAR</SelectItem><SelectItem value="ETF">ETF</SelectItem><SelectItem value="Acción">Acción</SelectItem><SelectItem value="Cripto">Cripto</SelectItem><SelectItem value="FCI">FCI</SelectItem><SelectItem value="Otro">Otro</SelectItem></SelectContent></Select></div>
                  <div><Label>Cantidad</Label><Input type="number" value={investmentForm.cantidad} onChange={(e) => setInvestmentForm((s) => ({ ...s, cantidad: e.target.value }))} /></div>
                  <div><Label>Precio</Label><Input type="number" value={investmentForm.precio} onChange={(e) => setInvestmentForm((s) => ({ ...s, precio: e.target.value }))} /></div>
                  <div><Label>Moneda</Label><Select value={investmentForm.moneda} onValueChange={(v) => setInvestmentForm((s) => ({ ...s, moneda: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ARS">ARS</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></div>
                  <div><Label>Total</Label><Input type="number" value={investmentForm.total} onChange={(e) => setInvestmentForm((s) => ({ ...s, total: e.target.value }))} /></div>
                  <div className="md:col-span-2"><Label>Notas</Label><Input value={investmentForm.notas} onChange={(e) => setInvestmentForm((s) => ({ ...s, notas: e.target.value }))} /></div>
                  <div className="flex items-end gap-2">
                    <Button onClick={saveInvestment}><PiggyBank className="w-4 h-4 mr-2" />{investmentForm.id ? "Guardar cambios" : "Agregar"}</Button>
                    {investmentForm.id ? <Button variant="outline" onClick={() => setInvestmentForm({ id: 0, fecha: new Date().toISOString().slice(0, 10), ticker: "", tipo: "CEDEAR", cantidad: "", precio: "", moneda: "ARS", total: "", notas: "" })}>Cancelar</Button> : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Resumen de cartera</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Posiciones</span><strong>{data.inversiones.length}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400">Monto cargado</span><strong>{money(data.inversiones.reduce((a, b) => a + Number(b.total || 0), 0))}</strong></div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Card className="xl:col-span-1 rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Distribución por tipo</CardTitle></CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={invByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip formatter={(value: number) => money(value)} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="xl:col-span-2 rounded-3xl bg-slate-900/80 border-slate-800">
                <CardHeader><CardTitle>Detalle de inversiones</CardTitle></CardHeader>
                <CardContent className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Ticker</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.inversiones.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.fecha}</TableCell>
                          <TableCell className="font-semibold">{inv.ticker}</TableCell>
                          <TableCell>{inv.tipo}</TableCell>
                          <TableCell>{money(inv.total)}</TableCell>
                          <TableCell>{inv.notas}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="icon" variant="outline" onClick={() => setInvestmentForm({ ...inv, cantidad: String(inv.cantidad), precio: String(inv.precio), total: String(inv.total) })}><Pencil className="w-4 h-4" /></Button>
                              <Button size="icon" variant="outline" onClick={() => setData((prev) => ({ ...prev, inversiones: prev.inversiones.filter((x) => x.id !== inv.id) }))}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
