
# Api User Ecommerce

proyecto desarrolaldo con Next.js 15 + TypeScript para la api para gestion de usuarios y autenticación.
- login
- registro
- verificación de teléfono

## Instalación

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```
```bash
/mi-proyecto
|-- /app              # Código de Next.js (páginas, APIs)
|-- /drizzle          # Archivos de Drizzle (migraciones)
|-- /lib              # Archivos de utilidad y lógica de negocio
|-- /db               # Conexión a la base de datos y esquema
|   |-- index.ts      # Archivo de conexión (drizzle-orm)
|   |-- schema.ts     # Definición del esquema de la base de datos
|-- drizzle.config.ts # Configuración de Drizzle CLI
|-- package.json
```

# Librerias
npm install drizzle-orm # para interactuar con la base de datos
npm install -D drizzle-kit # para generar migraciones

npm install pg  # driver para conectar con postgreSQL
npm install -D @types/pg  # para tipado de datos en postgreSQL

npm install -D dotenv # para manejar variables de entorno
npm install jsonwebtoken # jsonwebtoken - Para generar y verificar JWT tokens
npm install bcryptjs # bcryptjs - Para hashear contraseñas
npm install --save-dev @types/jsonwebtoken @types/bcryptjs # Tipado para jsonwebtoken y bcryptjs


# Configuración
- [x] Crear proyecto Next.js 15 + TypeScript
- [x] Conectar Next.js con postgreSQL
- [x] Instalar y configurar Drizzle ORM


# Migraciones
npm run db:generate  # Genera migraciones
npm run db:push      # Aplica cambios directos
npm run db:studio    # Interfaz visual de DB


Funciones de la api:

- [x] Crear usuario
- [x] Actualizar usuario
- [x] Eliminar usuario
- [x] Obtener usuario por ID
- [x] Obtener todos los usuarios
Login
Registro
Verificación de teléfono

cuando quieras crear o liminar una carpata pideme permiso


interface → solo para objetos y clases, permite extender (extends) y declaración múltiple (se pueden fusionar interfaces con el mismo nombre).

type → más flexible: puede ser objeto, unión, intersección, alias de primitivo, etc., pero no soporta fusión automática.

👉 Regla rápida: usa interface para shapes de objetos/clases, y type cuando necesites uniones o cosas más avanzadas.

-- 1️⃣ Insertar en create_user_attempt
INSERT INTO create_user_attempt (ip, phone_number, password)
VALUES ('127.0.0.1', '3001112233', 'hashed_password_123');

-- 2️⃣ Insertar en phone_verification (usando el id del create_user_attempt recién creado)
INSERT INTO phone_verification (ip_id, code, valid_until, verified, codes_sent_count)
VALUES (1, '123456', NOW() + interval '5 minutes', false, 1);

-- 3️⃣ Insertar en users
INSERT INTO users (phone, password, name, email, role)
VALUES ('3001112233', 'hashed_password_123', 'Juan Pérez', 'juan@example.com', 1);

-- Tanda 2
INSERT INTO create_user_attempt (ip, phone_number, password)
VALUES ('127.0.0.2', '3002223344', 'hashed_password_456');

INSERT INTO phone_verification (ip_id, code, valid_until, verified, codes_sent_count)
VALUES (2, '654321', NOW() + interval '5 minutes', false, 1);

INSERT INTO users (phone, password, name, email, role)
VALUES ('3002223344', 'hashed_password_456', 'María Gómez', 'maria@example.com', 2);

-- Tanda 3
INSERT INTO create_user_attempt (ip, phone_number, password)
VALUES ('127.0.0.3', '3003334455', 'hashed_password_789');

INSERT INTO phone_verification (ip_id, code, valid_until, verified, codes_sent_count)
VALUES (3, '111222', NOW() + interval '5 minutes', false, 1);

INSERT INTO users (phone, password, name, email, role)
VALUES ('3003334455', 'hashed_password_789', 'Carlos López', 'carlos@example.com', 3);


PENDIENTES:
cuando se verifica el codigo se copia el usuario en la tabla users, pero sin ningun rol por default.
Hay un endpoint para crear un usuario y no se si es necesario, porque el usuario se crea cuando se verifica el codigo.
No existe la ruta endpoints en el archivo .yml para actualizar el telefono.

Se puede borrar la carpeta .next y luego construir la aplicacion con:
eLIMINA LA CARPETA:
- rm -rf .next
- crea la carpeta .next
npm run build

Falta:
api phone-verification-update