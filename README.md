# ivanmartinez.dev

Base de un portfolio profesional construido con Laravel 13, React, Inertia, TypeScript, Tailwind CSS 4 y shadcn/ui. El entorno local usa PHP 8.4 y PostgreSQL 16 mediante DDEV y Docker.

## Requisitos

- Docker Desktop u OrbStack en ejecución
- DDEV
- Git

PHP, Composer, Node.js y PostgreSQL se ejecutan dentro de DDEV.

## Instalación y arranque

```bash
git clone <url-del-repositorio> ivanmartinez-portfolio
cd ivanmartinez-portfolio
ddev start
ddev exec cp .env.example .env
ddev exec php artisan key:generate
ddev exec composer install
ddev exec npm ci
ddev exec php artisan migrate
ddev exec php artisan db:seed
ddev exec npm run build
```

DDEV configura PHP 8.4, PostgreSQL 16 y el document root `public`. La conexión de Laravel usa `db` como host dentro de la red DDEV. No se usa SQLite en desarrollo ni en las pruebas.

Abre el sitio en `https://ivanmartinez.ddev.site`, servido por los puertos estándar 80 y 443. Si DDEV muestra otra URL, ajusta `APP_URL` en `.env` al valor indicado por `ddev describe`.

## Comandos útiles

```bash
ddev start                         # Iniciar servicios
ddev stop                          # Detener servicios
ddev describe                      # Ver URLs y estado de servicios
ddev exec php artisan migrate      # Aplicar migraciones
ddev exec php artisan db:seed      # Crear el contenido inicial sin sobrescribir ediciones
ddev exec psql -U db -d db -c "CREATE DATABASE db_testing OWNER db;" # Solo una vez por entorno
ddev exec php artisan test         # Pest usa db_testing, separada de los datos del sitio
ddev exec npm run build            # Compilar frontend para el navegador
ddev exec php artisan route:list   # Consultar rutas
ddev exec php artisan route:list --path=pages # Rutas del constructor
ddev exec ./vendor/bin/pint --test app database routes tests # Verificar formato PHP
ddev ssh                           # Abrir una shell en el contenedor web
```

La autenticación base del starter está instalada. El registro público está deshabilitado.

## Constructor de páginas

El constructor está disponible en `/admin/pages` y requiere una cuenta existente con rol administrador. Para concederlo a un usuario existente:

```bash
ddev exec php artisan cms:admin correo@ejemplo.com
```

El editor mantiene borradores separados de la última versión publicada, permite previsualizar en escritorio/tablet/móvil y restaurar publicaciones anteriores. La portada existente se migró a bloques conservando su contenido y las secciones heredadas.

Bloques disponibles: Hero, texto enriquecido, imagen, galería, vídeo, estadísticas, proyectos destacados, grid de proyectos, perfil, timeline, tecnologías, CTA, separador, columnas y formulario de contacto. El HTML enriquecido se limita a etiquetas seguras. Las imágenes subidas aceptan JPEG, PNG y WebP y quedan privadas hasta que una versión publicada las referencia. Los enlaces de vídeo se limitan a YouTube y Vimeo.

La portada usa `/` y las páginas adicionales usan `/{slug}`. Las rutas reservadas del sistema y `/projects` mantienen prioridad. Los formularios envían correo a la dirección configurada en `/admin/profile`; configura `MAIL_*` en `.env` para habilitar los envíos.

## Estado inicial verificado

- Migraciones del starter ejecutadas sobre PostgreSQL 16 en DDEV.
- Pest: suite ejecutada sobre PostgreSQL en la base aislada `db_testing`.
- `ddev exec npm run build`: compilación de producción completada.

Este proyecto sirve el frontend desde `public/build`. El puerto 5173 de Vite no está expuesto al navegador por la configuración DDEV actual; evita dejar un `public/hot` activo cuando Vite no sea accesible desde el host.
