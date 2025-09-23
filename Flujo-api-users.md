# Pasos a desarrollar API Users:
Acontinuación se detalla el flujo a desarrollar para la API Users:

## 1. Crear usuario en la tabla temporal
1. Permitir crear el usuario en la tabla `create_user_attempt`
2. Validar que el número de teléfono no exista en la tabla `create_user_attempt`
3. Obtener lista de usuarios de la tabla `create_user_attempt`

## 2. Verificación - Enviar y Verificar el código recibido
1. Enviar el código de verificación por SMS al número de teléfono del usuario
2. Registrar el codigo enviado en la tabla `phone_verification`
2. Verificar el código de verificación en la tabla `phone_verification`
4. Crear el usuario en la tabla `users`

**Limitaciones:**
- Solo se puede enviar un código cada **1 minuto** por IP
- El Código debe ser de 6 dígitos numéricos
- Máximo **10 códigos por día** por IP
- Tiempo de expiración configurable (devuelto en la respuesta) maximo 5 minutos



En Drizzle, por defecto los campos son NULL salvo que los marques como .notNull() o les pongas un default.
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).default(null),
  role: integer("role"), es nullable porque no tienen .notNull() ni default, tambien lo podrias especificar asi: role: 
  integer("role").default(null),