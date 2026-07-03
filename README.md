# 💰 Caso 7.1: Control de Finanzas Personales (Budget Buddy) - Categorización de Gastos

Este repositorio contiene el diseño de sistema y la arquitectura de capas para la resolución del control de gastos y alertas de presupuesto para el Bloque 7.

### 🔗 Aplicación en Vivo (Interactiva)
Para probar la aplicación funcionando en tiempo real con las alertas de excedentes, haz clic en el siguiente enlace:
👉 **[ENTRAR A LA APLICACIÓN AQUÍ](https://budget-buddy-mate-49.lovable.app))**

---

## 🛠️ Diseño de Sistemas e Información (Arquitectura de Capas)

### 1. CAPA DE INTERFAZ DE USUARIO (UI)
* **Acción concreta:** Panel de ingreso de transacciones donde el usuario define Monto, Categoría (Comida, Transporte, Entretenimiento, etc.) y Fecha.
* **Componente Visual:** Tablero de control (Dashboard) con gráficos e indicadores de barra que cambian de color (alerta visual) si los gastos se aproximan al límite configurado.

### 2. CAPA DE LÓGICA Y VALIDACIÓN (BACKEND)
* **Regla de negocio:** El sistema calcula de manera automática la sumatoria de gastos por categoría y la contrasta contra el presupuesto tope.
  * *Validación:* Evalúa en tiempo real: Si `gastosCategoria > presupuestoLimite`.
  * *Acción:* Dispara de forma automática un evento de notificación / advertencia en la interfaz alertando el exceso.

### 3. CAPA DE PERSISTENCIA (BASE DE DATOS)
* **Persistencia:** Integración con base de datos mediante Supabase.
* **Operación:** Registro estructurado y persistente de cada ingreso/egreso en las tablas de la base de datos, permitiendo mantener el historial financiero del usuario protegido y disponible ante recargas del sistema.
