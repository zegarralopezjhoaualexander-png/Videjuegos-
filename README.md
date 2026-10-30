# Tienda de Videojuegos — Frontend

Aplicación web para una tienda de videojuegos. Permite registrarse e iniciar sesión, explorar el catálogo, consultar la ficha detallada de cada juego y calificarlo. Los usuarios con rol de administrador pueden gestionar los juegos del catálogo.

El frontend consume una API REST desarrollada con Spring Boot, que debe estar en ejecución para que la aplicación funcione.

## Funcionalidades

### Login y registro

- Inicio de sesión con correo electrónico o usuario y contraseña.
- Registro de nuevos usuarios con nombre, apellido, fecha de nacimiento, correo y contraseña.
- Validación de contraseña: longitud permitida, al menos una mayúscula, una minúscula, un número y un símbolo, además de su confirmación.
- Sesión basada en token y rutas protegidas.
- Cierre de sesión.

### Catálogo con búsqueda y filtro

- Listado de videojuegos obtenidos desde el backend.
- Búsqueda por título, género o plataforma.
- Filtro por género.
- Tarjetas con portada, puntuación, género y plataforma.
- Estados de carga, error con opción de reintentar y resultados vacíos.

### Ficha de detalle

- Portada, título, género, plataforma, año, desarrollador, fecha de lanzamiento, precio y disponibilidad.
- Sinopsis del juego.
- Galería de imágenes con vista ampliada.
- Tráiler de YouTube incrustado cuando el enlace lo permite; en caso de enlaces de búsqueda, se ofrece abrir YouTube.
- Requisitos mínimos y recomendados del sistema.
- Valoración editorial y calificaciones de los usuarios.

### Calificaciones de usuarios

- Consulta del promedio y total de calificaciones de cada juego.
- Calificación con estrellas de 1 a 5.
- Consulta y actualización de la calificación propia del usuario autenticado.

### Panel de administración

- Disponible únicamente para usuarios con rol `ADMIN`.
- Creación, edición y eliminación de videojuegos.
- Buscador por nombre dentro del listado de administración.
- Formulario con validaciones para los datos del juego.
- Mensajes de confirmación y control de errores de permisos.

## Tecnologías

- React
- Vite
- react-router-dom
- Tailwind CSS
- JavaScript / JSX

## Requisitos

- Node.js y npm instalados.
- Backend Spring Boot en ejecución en `http://localhost:8080`.

Por defecto, el frontend se comunica con el backend en `http://localhost:8080`. La URL puede configurarse mediante la variable de entorno `VITE_API_URL`.

## Cómo ejecutarlo

Desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

Antes de usarla, asegúrate de que el backend Spring Boot esté corriendo en `http://localhost:8080`.

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilación para producción
npm run preview  # Vista previa de la compilación
npm run lint     # Análisis con ESLint
```

## Estructura del proyecto

```text
frontend/
├── src/
│   ├── api/       # Clientes para consumir la API del backend
│   ├── auth/      # Contexto de autenticación y rutas protegidas
│   ├── page/      # Login, registro, catálogo, detalle y administración
│   ├── App.jsx    # Definición de rutas
│   └── main.jsx   # Punto de entrada
├── public/
├── index.html
└── package.json
```
