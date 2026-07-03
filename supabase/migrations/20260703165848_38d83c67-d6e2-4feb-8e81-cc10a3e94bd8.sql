
CREATE TABLE public.gastos (
  id_gasto UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID NOT NULL,
  categoria TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.presupuestos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID NOT NULL,
  categoria TEXT NOT NULL,
  limite_presupuesto_mensual NUMERIC(12,2) NOT NULL,
  gasto_acumulado_mes NUMERIC(12,2) NOT NULL DEFAULT 0,
  UNIQUE (id_usuario, categoria)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gastos TO anon, authenticated;
GRANT ALL ON public.gastos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presupuestos TO anon, authenticated;
GRANT ALL ON public.presupuestos TO service_role;

ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Demo app (no auth). Permit access to a demo user id for anon/authenticated.
CREATE POLICY "demo access gastos" ON public.gastos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo access presupuestos" ON public.presupuestos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed presupuestos for demo user
INSERT INTO public.presupuestos (id_usuario, categoria, limite_presupuesto_mensual, gasto_acumulado_mes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Entretenimiento', 100, 90),
  ('00000000-0000-0000-0000-000000000001', 'Comida', 400, 120),
  ('00000000-0000-0000-0000-000000000001', 'Transporte', 200, 45),
  ('00000000-0000-0000-0000-000000000001', 'Servicios', 300, 80),
  ('00000000-0000-0000-0000-000000000001', 'Salud', 150, 20),
  ('00000000-0000-0000-0000-000000000001', 'Educación', 250, 60),
  ('00000000-0000-0000-0000-000000000001', 'Otros', 150, 30);
