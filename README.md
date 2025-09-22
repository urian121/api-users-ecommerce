
# Api User Ecommerce

proyecto desarrolaldo con Next.js 15 + TypeScript para la api de usuarios en un ecommerce

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
npm install zod  # para validar datos
npm install -D @types/pg  # para tipado de datos en postgreSQL

npm install -D dotenv # para manejar variables de entorno

# Tareas

- [x] Crear proyecto Next.js 15 + TypeScript
- [x] Conectar Next.js con postgreSQL
- [x] Instalar y configurar Drizzle ORM
- [x] Configurar Zod


# Migraciones
npm run db:generate  # Genera migraciones
npm run db:push      # Aplica cambios directos
npm run db:studio    # Interfaz visual de DB


cuando quieras crear o liminar una carpata pideme permiso