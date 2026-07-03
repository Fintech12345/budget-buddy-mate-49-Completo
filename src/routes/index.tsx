import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Wallet, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const CATEGORIAS = [
  "Entretenimiento",
  "Comida",
  "Transporte",
  "Servicios",
  "Salud",
  "Educación",
  "Otros",
];

type Presupuesto = {
  id: string;
  categoria: string;
  limite_presupuesto_mensual: number;
  gasto_acumulado_mes: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function Index() {
  const [categoria, setCategoria] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [fecha, setFecha] = useState<string>(todayISO());
  const [submitting, setSubmitting] = useState(false);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [alerta, setAlerta] = useState<{
    categoria: string;
    acumulado: number;
    limite: number;
  } | null>(null);

  async function loadPresupuestos() {
    const { data, error } = await supabase
      .from("presupuestos")
      .select("id, categoria, limite_presupuesto_mensual, gasto_acumulado_mes")
      .eq("id_usuario", DEMO_USER_ID)
      .order("categoria");
    if (error) {
      console.error(error);
      return;
    }
    setPresupuestos(
      (data ?? []).map((p) => ({
        ...p,
        limite_presupuesto_mensual: Number(p.limite_presupuesto_mensual),
        gasto_acumulado_mes: Number(p.gasto_acumulado_mes),
      })),
    );
  }

  useEffect(() => {
    loadPresupuestos();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (!categoria) return toast.error("Selecciona una categoría");
    if (!montoNum || montoNum <= 0) return toast.error("Ingresa un monto válido");
    if (!fecha) return toast.error("Selecciona una fecha");

    setSubmitting(true);
    try {
      // 1. Leer presupuesto de la categoría
      const { data: presup, error: readErr } = await supabase
        .from("presupuestos")
        .select("id, limite_presupuesto_mensual, gasto_acumulado_mes")
        .eq("id_usuario", DEMO_USER_ID)
        .eq("categoria", categoria)
        .maybeSingle();
      if (readErr) throw readErr;
      if (!presup) throw new Error("Presupuesto no encontrado para la categoría");

      const limite = Number(presup.limite_presupuesto_mensual);
      const acumuladoActual = Number(presup.gasto_acumulado_mes);
      const nuevoAcumulado = acumuladoActual + montoNum;
      const superaLimite = nuevoAcumulado > limite;

      // 2. Insertar el gasto
      const { error: insErr } = await supabase.from("gastos").insert({
        id_usuario: DEMO_USER_ID,
        categoria,
        monto: montoNum,
        fecha,
      });
      if (insErr) throw insErr;

      // 3. Actualizar acumulado
      const { error: updErr } = await supabase
        .from("presupuestos")
        .update({ gasto_acumulado_mes: nuevoAcumulado })
        .eq("id", presup.id);
      if (updErr) throw updErr;

      // 4. Feedback
      toast.success("Gasto registrado correctamente");
      if (superaLimite) {
        setAlerta({ categoria, acumulado: nuevoAcumulado, limite });
      } else {
        setAlerta(null);
      }

      // Limpiar formulario
      setCategoria("");
      setMonto("");
      setFecha(todayISO());
      await loadPresupuestos();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Error al registrar el gasto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 pb-16 pt-8">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Control de Finanzas
            </h1>
            <p className="text-sm text-muted-foreground">
              Categorización de gastos
            </p>
          </div>
        </header>

        {alerta && (
          <div
            role="alert"
            className="mb-5 flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm leading-snug">
              <p className="font-semibold">
                Gasto registrado. Atención: has superado el presupuesto mensual
                fijado para "{alerta.categoria}".
              </p>
              <p className="mt-1 text-xs opacity-80">
                Acumulado ${alerta.acumulado.toFixed(2)} / Límite $
                {alerta.limite.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        <section className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger id="categoria" className="h-12">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monto">Monto del gasto</Label>
              <Input
                id="monto"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl text-base font-semibold uppercase tracking-wide"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Registrar gasto"
              )}
            </Button>
          </form>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2 px-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">
              Presupuestos del mes
            </h2>
          </div>
          <div className="space-y-2">
            {presupuestos.map((p) => {
              const pct = Math.min(
                (p.gasto_acumulado_mes / p.limite_presupuesto_mensual) * 100,
                100,
              );
              const excedido =
                p.gasto_acumulado_mes > p.limite_presupuesto_mensual;
              const cerca = !excedido && pct >= 80;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{p.categoria}</span>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        excedido
                          ? "font-semibold text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      ${p.gasto_acumulado_mes.toFixed(2)} / $
                      {p.limite_presupuesto_mensual.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        excedido
                          ? "bg-destructive"
                          : cerca
                            ? "bg-warning"
                            : "bg-primary",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
