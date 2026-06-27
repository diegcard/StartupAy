# StartupAy — Sistema de Gestión de Tickets de Soporte

Sistema de soporte técnico para la plataforma fintech **StartupAy**, con clasificación automática de tickets usando Google Gemini, seguimiento de SLA, ingesta multicanal vía n8n y dashboard de métricas en tiempo real.

---

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Inicio rápido (desarrollo)](#inicio-rápido-desarrollo)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Despliegue con Docker](#despliegue-con-docker)
- [API Reference](#api-reference)
- [Roles y permisos](#roles-y-permisos)
- [Flujo de clasificación IA](#flujo-de-clasificación-ia)
- [Webhooks n8n](#webhooks-n8n)
- [Métricas](#métricas)

---

## Arquitectura

```
┌─────────────────┐     ┌──────────────────────────────────┐
│   React + Vite  │────▶│  NestJS API  (puerto 3001)       │
│  (puerto 5173)  │     │                                  │
└─────────────────┘     │  ┌─────────┐  ┌──────────────┐  │
                        │  │  Auth   │  │   Tickets    │  │
┌─────────────────┐     │  ├─────────┤  ├──────────────┤  │
│      n8n        │────▶│  │Webhooks │  │  Categories  │  │
│  (puerto 5678)  │     │  ├─────────┤  ├──────────────┤  │
└─────────────────┘     │  │ Metrics │  │    Agents    │  │
                        │  └─────────┘  └──────────────┘  │
                        │                                  │
                        │  ┌──────────┐  ┌─────────────┐  │
                        │  │  Prisma  │  │   Gemini    │  │
                        │  │   ORM    │  │    1.5-flash │  │
                        │  └──────────┘  └─────────────┘  │
                        └────────────┬─────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   PostgreSQL  16     │
                          └─────────────────────┘
```

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Estado del servidor | TanStack Query (React Query v5) |
| Estado del cliente | Zustand |
| Backend | NestJS 10, TypeScript |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 16 |
| IA | Google Gemini 1.5 Flash |
| Automatización | n8n (webhooks Email / WhatsApp) |
| Cache / Queue | Redis 7 |
| Autenticación | JWT (8h de expiración) |
| Contenedores | Docker + Docker Compose |

---

## Estructura del proyecto

```
tickets/
├── docker-compose.yml
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── nest-cli.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── shared/
│       │   ├── prisma/          # PrismaService global
│       │   ├── gemini/          # Clasificación con Gemini
│       │   └── sla/             # Cálculo de deadlines SLA
│       └── modules/
│           ├── auth/            # Login, JWT, guards, decoradores
│           ├── tickets/         # CRUD + clasificación IA
│           ├── categories/      # Categorías de soporte
│           ├── agents/          # Gestión de agentes
│           ├── webhooks/        # Ingesta Email / WhatsApp desde n8n
│           └── metrics/         # KPIs, SLA, MTTR
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── services/            # Capa de llamadas a la API
        ├── hooks/               # Hooks de React Query
        ├── store/               # Zustand (auth)
        ├── types/               # Interfaces TypeScript
        ├── lib/                 # Cliente axios con interceptor JWT
        ├── components/
        │   ├── layout/          # Layout + Sidebar
        │   └── ui/              # Button, Card, Badge, FormField, Spinner, SlaIndicator
        └── pages/
            ├── login/
            ├── tickets/
            │   ├── list/        # TicketListPage, TicketFilters, TicketTable
            │   ├── detail/      # TicketDetailPage, AiBanner, TicketHistory, UpdateTicketForm…
            │   └── new/         # NewTicketPage
            └── metrics/         # MetricsPage, KpiCard, SlaCard, CategoryChart, ChannelChart
```

---

## Requisitos previos

- Node.js 20+
- Docker Desktop (para la base de datos en desarrollo)
- Cuenta de Google AI Studio con API Key de Gemini

---

## Inicio rápido (desarrollo)

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd tickets

cd backend && npm install
cd ../frontend && npm install
```

### 2. Variables de entorno

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con los valores reales (ver [Variables de entorno](#variables-de-entorno)).

### 3. Levantar la base de datos

```bash
docker compose up postgres redis -d
```

### 4. Migraciones y seed

```bash
cd backend
npm run db:migrate     # Aplica el schema
npm run db:seed        # Crea categorías y usuarios de prueba
```

### 5. Iniciar los servidores

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: `npm run db:studio` → http://localhost:5555
- n8n: `docker compose up n8n -d` → http://localhost:5678

---

## Variables de entorno

Crear `backend/.env`:

```env
# Base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tickets_db"

# Autenticación
JWT_SECRET="cambia-esto-por-una-clave-segura"

# Google Gemini
GEMINI_API_KEY="tu-api-key-de-google-ai-studio"

# Webhooks n8n
WEBHOOK_SECRET="secreto-compartido-con-n8n"

# Servidor
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

Para producción con Docker, estas variables se pasan en `docker-compose.yml` o en un archivo `.env` en la raíz del proyecto.

---

## Base de datos

### Schema (modelos principales)

| Modelo | Descripción |
|--------|------------|
| `Agent` | Usuarios del sistema (AGENT, SUPERVISOR, ADMIN) |
| `Category` | Categorías de tickets con SLA en horas |
| `Ticket` | Ticket principal con campos de IA integrados |
| `TicketHistory` | Auditoría de todos los cambios de un ticket |
| `AgentSkill` | Habilidades por categoría asignadas a agentes |
| `Attachment` | Archivos adjuntos a tickets |

### Comandos útiles

```bash
npm run db:migrate      # Aplicar migraciones pendientes
npm run db:generate     # Regenerar cliente Prisma tras cambios en schema
npm run db:studio       # Abrir Prisma Studio (GUI de base de datos)
npm run db:seed         # Poblar con datos iniciales
```

### Usuarios de prueba (después del seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@startupay.com | Admin1234! | ADMIN |
| maria@startupay.com | Agent1234! | SUPERVISOR |
| ana@startupay.com | Agent1234! | AGENT |
| carlos@startupay.com | Agent1234! | AGENT |

---

## Despliegue con Docker

### Producción completa

Crear `.env` en la raíz del proyecto:

```env
JWT_SECRET=clave-super-secreta-de-produccion
GEMINI_API_KEY=tu-api-key
WEBHOOK_SECRET=secreto-webhook
```

```bash
docker compose up --build -d
```

| Servicio | Puerto |
|---------|--------|
| Frontend (nginx) | 80 |
| Backend (NestJS) | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| n8n | 5678 |

El frontend hace proxy de `/api/*` al backend internamente a través de nginx.

---

## API Reference

Todos los endpoints tienen el prefijo `/api`.

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Iniciar sesión |
| GET | `/auth/me` | JWT | Perfil del agente autenticado |

### Tickets

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/tickets` | No | Crear ticket (con clasificación IA automática) |
| GET | `/tickets` | JWT | Listar tickets con filtros |
| GET | `/tickets/:id` | JWT | Detalle de un ticket |
| PUT | `/tickets/:id` | JWT | Actualizar estado, categoría o agente asignado |
| POST | `/tickets/:id/classify` | JWT | Re-clasificar con Gemini |

**Filtros disponibles en GET `/tickets`:** `status`, `priority`, `categoryId`, `assignedTo`, `page`, `limit`

### Categorías

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/categories` | JWT | Listar categorías |

### Agentes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/agents` | JWT + SUPERVISOR/ADMIN | Listar agentes con capacidad y skills |

### Métricas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/metrics` | JWT + SUPERVISOR/ADMIN | KPIs, SLA compliance, MTTR, distribución por canal/categoría |

### Webhooks (n8n)

| Método | Ruta | Header requerido | Descripción |
|--------|------|-----------------|-------------|
| POST | `/webhooks/email` | `X-Webhook-Secret` | Ingesta de tickets por email |
| POST | `/webhooks/whatsapp` | `X-Webhook-Secret` | Ingesta de tickets por WhatsApp |

---

## Roles y permisos

| Acción | AGENT | SUPERVISOR | ADMIN |
|--------|-------|-----------|-------|
| Ver tickets asignados | ✓ | ✓ | ✓ |
| Ver todos los tickets | — | ✓ | ✓ |
| Crear/actualizar tickets | ✓ | ✓ | ✓ |
| Ver métricas | — | ✓ | ✓ |
| Ver lista de agentes | — | ✓ | ✓ |

---

## Flujo de clasificación IA

Cuando se crea un ticket (vía formulario web, email o WhatsApp), el sistema:

1. Consulta todas las categorías disponibles en la base de datos
2. Envía título + descripción a **Gemini 1.5 Flash** con un prompt estructurado
3. Recibe `categoryId`, `confidence`, `priority`, `summary` y `reasoning` en JSON
4. Calcula el deadline de SLA según la categoría y la prioridad con multiplicadores:

| Prioridad | Multiplicador SLA |
|-----------|------------------|
| CRITICAL | 0.25× (un cuarto del tiempo base) |
| HIGH | 0.5× |
| MEDIUM | 1× |
| LOW | 2× |

5. Persiste el ticket con los campos `aiSuggestedCategory`, `aiConfidence` y `aiSummary`

Si la categoría tiene `requiresHuman: true` (Fraude, Compliance), el frontend muestra una alerta de revisión obligatoria.

---

## Webhooks n8n

Los flujos de n8n normalizan los payloads entrantes de email y WhatsApp antes de llamar al backend.

**Email** — `POST /api/webhooks/email`
```json
{
  "from": "merchant@empresa.com",
  "subject": "No puedo procesar pagos",
  "body": "Desde ayer los cobros con tarjeta están fallando...",
  "date": "2026-06-27T10:00:00Z",
  "attachments": []
}
```

**WhatsApp** — `POST /api/webhooks/whatsapp`
```json
{
  "from": "+525512345678",
  "body": "Hola, mi cuenta está bloqueada y no puedo entrar",
  "timestamp": "2026-06-27T10:00:00Z"
}
```

Ambos endpoints requieren el header `X-Webhook-Secret` con el valor configurado en `WEBHOOK_SECRET`.

---

## Métricas

El dashboard de métricas (disponible para SUPERVISOR y ADMIN) se actualiza cada 30 segundos y muestra:

| Métrica | Descripción | Objetivo |
|---------|------------|---------|
| **SLA Compliance** | % de tickets resueltos dentro del deadline | > 90% |
| **MTTR** | Tiempo promedio de resolución en horas | < 8h |
| **Tasa de reclasificación** | % de tickets reclasificados manualmente | < 20% |
| **Tickets por categoría** | Distribución horizontal (bar chart) | — |
| **Tickets por canal** | Web / Email / WhatsApp (pie chart) | — |

Los valores baseline del proyecto son: SLA 62% → objetivo 90%, MTTR 18h → objetivo 8h.
