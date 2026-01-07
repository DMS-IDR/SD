# SDGestion

Sistema de gestión empresarial con Django REST Framework + React + Supabase, desplegado con Docker.

## 📋 Índice

- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Aplicaciones del Sistema](#-aplicaciones-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración Inicial](#-configuración-inicial)
- [Instalación Local](#-instalación-local)
- [Comandos Útiles](#-comandos-útiles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Autenticación](#-autenticación)
- [Despliegue en Producción](#-despliegue-en-producción)

---

## 🏗 Arquitectura

El sistema está containerizado con Docker Compose y consta de 3 servicios:

| Servicio | Tecnología | Puerto | Descripción |
|----------|------------|--------|-------------|
| **Backend** | Django 5.0 + DRF | `8000` | API REST, lógica de negocio |
| **Frontend** | React + Vite | `5173` | Interfaz de usuario SPA |
| **Base de Datos** | PostgreSQL 15 | `5432` | Almacenamiento persistente |

### Diagrama de Flujo

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  (React)     │     │  (Django)    │     │    (DB)      │
│  :5173       │     │  :8000       │     │  :5432       │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       └────────────▶│   Supabase   │  (Auth + Storage externos)
                     └──────────────┘
```

---

## 🛠 Tecnologías

### Backend
- **Python 3.11**
- **Django 5.0** - Framework web
- **Django REST Framework** - APIs REST
- **Gunicorn** - Servidor WSGI para producción
- **psycopg2** - Driver PostgreSQL
- **boto3** - SDK de AWS para S3
- **supabase-py** - Cliente de Supabase

### Frontend
- **Node.js 20**
- **React 18** - Librería UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework CSS

### Infraestructura
- **Docker & Docker Compose** - Containerización
- **PostgreSQL 15** - Base de datos
- **Supabase** - Autenticación y almacenamiento en la nube
- **AWS S3** - Almacenamiento de archivos

---

## 📦 Aplicaciones del Sistema

### Backend (Django Apps)

| App | Descripción | Endpoint Base |
|-----|-------------|---------------|
| `authentication` | Validación de tokens JWT de Supabase | `/api/auth/` |
| `users` | Gestión de usuarios y perfiles | `/api/users/` |
| `closingsales` | Cierres de ventas y seguimiento | `/api/closingsales/` |
| `commissions` | Cálculo y gestión de comisiones | `/api/commissions/` |
| `reports` | Generación de reportes | `/api/reports/` |

### Frontend (Vistas/Componentes)

| Componente | Descripción |
|------------|-------------|
| `Login` | Inicio de sesión con Supabase |
| `HomeView` | Panel principal / Dashboard |
| `ClosingSalesView` | Gestión de cierres de ventas |
| `CommissionView` | Visualización de comisiones |
| `ReportsView` | Reportes y estadísticas |
| `UserManagement` | Administración de usuarios |
| `Sidebar` | Navegación lateral |

---

## 📋 Requisitos Previos

- **Docker Desktop** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

> [!NOTE]
> No necesitas instalar Python ni Node.js localmente. Todo corre dentro de contenedores Docker.

---

## ⚙ Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone git@github.com:DMS-IDR/SD.git
cd SD
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-publica
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_STORAGE_BUCKET_NAME=tu-bucket
AWS_S3_REGION_NAME=us-east-1

# Odoo Database (conexión externa para reportes)
DB_NAME_ODOODB=nombre-db
DB_USER_ODOODB=usuario
DB_PASSWORD_ODOODB=contraseña
DB_HOST_ODOODB=host
DB_PORT_ODOODB=5432
```

> [!CAUTION]
> Nunca subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

---

## 🚀 Instalación Local

### Opción 1: Docker Compose (Recomendado)

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O en modo detached (background)
docker-compose up --build -d
```

Una vez levantado:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin/

### Opción 2: Desarrollo sin Docker

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🔧 Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up

# Iniciar y reconstruir
docker-compose up --build

# Detener servicios
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Ejecutar comando en contenedor
docker-compose exec backend python manage.py migrate

# Acceder a shell del contenedor
docker-compose exec backend bash
```

### Django

```bash
# Dentro del contenedor o con venv activado

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Shell interactivo
python manage.py shell

# Crear usuario admin con script
python create_admin.py
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 📂 Estructura del Proyecto

```
SDGestion/
├── docker-compose.yml        # Orquestación de contenedores
├── .env                      # Variables de entorno (NO en git)
├── .env.example              # Plantilla de variables
├── .gitignore                # Archivos ignorados por git
├── README.md                 # Esta documentación
│
├── backend/                  # API Django
│   ├── Dockerfile            # Imagen del backend
│   ├── requirements.txt      # Dependencias Python
│   ├── manage.py             # CLI de Django
│   ├── create_admin.py       # Script para crear admin
│   │
│   ├── config/               # Configuración Django
│   │   ├── settings.py       # Settings principal
│   │   ├── urls.py           # URLs raíz
│   │   └── wsgi.py           # Entry point WSGI (Gunicorn)
│   │
│   ├── authentication/       # App: Autenticación Supabase
│   ├── users/                # App: Gestión de usuarios
│   ├── closingsales/         # App: Cierres de ventas
│   ├── commissions/          # App: Comisiones
│   └── reports/              # App: Reportes
│
└── frontend/                 # SPA React
    ├── Dockerfile            # Imagen del frontend
    ├── package.json          # Dependencias Node
    ├── vite.config.js        # Configuración Vite
    ├── tailwind.config.js    # Configuración Tailwind
    │
    └── src/
        ├── main.jsx          # Entry point React
        ├── App.jsx           # Componente raíz con routing
        ├── index.css         # Estilos globales
        │
        ├── components/       # Componentes/Vistas
        │   ├── Login.jsx
        │   ├── HomeView.jsx
        │   ├── ClosingSalesView.jsx
        │   ├── CommissionView.jsx
        │   ├── ReportsView.jsx
        │   ├── UserManagement.jsx
        │   └── Sidebar.jsx
        │
        └── lib/              # Utilidades
            └── supabaseClient.js  # Cliente de Supabase
```

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/login/     # Login (validado por Supabase)
POST   /api/auth/logout/    # Cerrar sesión
```

### Usuarios
```
GET    /api/users/          # Listar usuarios
POST   /api/users/          # Crear usuario
GET    /api/users/{id}/     # Obtener usuario
PUT    /api/users/{id}/     # Actualizar usuario
DELETE /api/users/{id}/     # Eliminar usuario
```

### Cierres de Ventas
```
GET    /api/closingsales/           # Listar cierres
POST   /api/closingsales/           # Crear cierre
GET    /api/closingsales/{id}/      # Obtener cierre
PUT    /api/closingsales/{id}/      # Actualizar cierre
```

### Comisiones
```
GET    /api/commissions/            # Listar comisiones
GET    /api/commissions/{id}/       # Obtener comisión
```

### Reportes
```
GET    /api/reports/                # Generar reportes
```

> [!TIP]
> Todos los endpoints requieren autenticación vía token JWT en el header `Authorization: Bearer <token>`.

---

## 🔐 Autenticación

El sistema usa **Supabase** como proveedor de identidad:

1. El usuario ingresa credenciales en el **Frontend**
2. El Frontend envía las credenciales a **Supabase**
3. Supabase valida y devuelve un **JWT Token**
4. El Frontend incluye el token en cada petición al **Backend**
5. El Backend valida el token usando la clase `SupabaseAuthentication`

### Flujo Detallado

```
Usuario → Frontend → Supabase
                        ↓
                   JWT Token
                        ↓
Frontend + Token → Backend → Valida con SUPABASE_KEY
                                    ↓
                              Respuesta API
```

---

## 🚢 Despliegue en Producción

### Configuración de Gunicorn

El backend está configurado para usar **Gunicorn** como servidor WSGI en producción:

```dockerfile
# backend/Dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
```

### Consideraciones de Producción

1. **Variables de entorno**:
   - Cambiar `DEBUG=False` en settings
   - Configurar `ALLOWED_HOSTS` apropiadamente
   - Usar `SECRET_KEY` seguro

2. **Servidor WSGI**:
   - El Dockerfile usa Gunicorn por defecto
   - Para desarrollo, docker-compose sobrescribe con `runserver`

3. **Base de datos**:
   - Usar PostgreSQL externo en producción
   - Configurar backups automáticos

4. **Frontend**:
   - Buildear con `npm run build`
   - Servir estáticos con Nginx

### Ejemplo docker-compose.prod.yml

```yaml
services:
  backend:
    build: ./backend
    # No sobrescribe CMD, usa gunicorn
    environment:
      - DEBUG=False
```

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

## 👥 Contribución

1. Crear rama desde `dev`: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits descriptivos
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request hacia `dev`

### Flujo de Ramas

```
main ← test ← dev ← feature/*
  │      │      │
  │      │      └── Desarrollo activo
  │      └── Testing/QA
  └── Producción estable
```
