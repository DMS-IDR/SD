# SDGestion (React + Django + Supabase + Docker)

Este proyecto es una aplicación web completa dockerizada requerida por el departamento.

## 🏗 Arquitectura

El sistema está compuesto por 3 contenedores principales orquestados por Docker Compose:

1.  **Backend (Django Rest Framework)**: Puerto `8000`.
    -   Maneja la lógica de negocio y APIs privadas.
    -   Valida los tokens de seguridad emitidos por Supabase.
2.  **Frontend (React + Vite)**: Puerto `5173`.
    -   Interfaz de usuario moderna con TailwindCSS.
    -   Se comunica directamente con Supabase para el inicio de sesión.
3.  **Base de Datos (PostgreSQL)**: Puerto `5432`.
    -   Base de datos relacional para el Backend.

## 🔐 Flujo de Autenticación

Usamos **Supabase** como proveedor de identidad para simplificar la seguridad.

1.  **Frontend**: El usuario ingresa email/password en React.
2.  **Supabase**: React envía estos datos a la nube de Supabase.
3.  **Token**: Si es correcto, Supabase devuelve un `Access Token` (JWT).
4.  **Backend**: Cuando React necesita datos del servidor, envía este Token al Django.
5.  **Validación**: Django verifica que el Token sea válido usando la "Secret Key" de Supabase y permite el acceso.

## 📂 Estructura del Proyecto

```text
SDGestion/
├── docker-compose.yml      # El "Jefe de Obra". Define cómo levantar todo junto.
├── .env                    # Las llaves secretas (Supabase URL, Keys).
│
├── backend/                # API en Python/Django
│   ├── Dockerfile          # Receta para construir el contenedor de Python.
│   ├── config/             # Configuración principal (settings.py).
│   └── authentication/     # App nuestra para la lógica de auth.
│
└── frontend/               # Interfaz en Javascript/React
    ├── Dockerfile          # Receta para construir el contenedor de Node.js.
    ├── src/components/     # Pantallas (Login.jsx).
    └── src/lib/            # Configuración de conexión a Supabase.
```

## 🚀 Comandos Útiles

-   **Iniciar todo**: `docker-compose up --build`
-   **Detener todo**: `docker-compose down`
-   **Ver logs**: `docker-compose logs -f`

## 🛠 Tecnologías Clave

-   **Docker**: Encapsula todo. No necesitas instalar Python ni Node en tu PC, todo vive dentro de los contenedores.
-   **TailwindCSS**: Para que el diseño se vea profesional sin escribir miles de líneas de CSS.
-   **Vite**: Herramienta que hace que React cargue instantáneamente.
