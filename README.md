# Backend - Sistema de Gestión de Activos Fijos

API REST construida con NestJS, TypeORM y PostgreSQL para la gestión completa de activos fijos, depreciación, empleados y departamentos.

## Descripción

Sistema backend robusto que proporciona funcionalidades para:

- **Gestión de Departamentos**: CRUD con validaciones de integridad
- **Gestión de Empleados**: Control con validación de cédula dominicana
- **Tipos de Activos**: Catálogo de categorías con cuentas contables
- **Activos Fijos**: Inventario completo con tracking de depreciación
- **Cálculos de Depreciación**: Proceso automatizado mensual

## Características Principales

✅ **Soft Delete**: Las eliminaciones marcan registros como inactivos sin borrado físico  
✅ **Validaciones de Integridad**: Previene eliminación de registros con dependencias activas  
✅ **Validación de Cédula**: Algoritmo de validación para cédulas dominicanas  
✅ **Búsqueda y Filtrado**: Endpoints especializados para búsqueda por texto, estado, departamento  
✅ **Depreciación Automática**: Cálculo mensual batch con resumen de resultados  
✅ **DTOs Robustos**: Validaciones exhaustivas con class-validator  
✅ **Paginación**: Soporte para paginación en todas las listas

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

## Instalación

```bash
npm install
```

## Configuración

1. Crear archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=activos_fijos
```

2. Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE activos_fijos;
```

3. Las tablas se crearán automáticamente al iniciar la aplicación (TypeORM synchronize)

## Ejecución

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
src/
├── asset-types/          # Tipos de activos (categorías)
├── common/               # Decoradores, pipes, DTOs compartidos
├── config/               # Configuración (env, TypeORM)
├── departments/          # Departamentos
├── depreciation-calculations/  # Cálculos de depreciación
├── employees/            # Empleados
├── fixed-assets/         # Activos fijos
├── app.module.ts        # Módulo raíz
└── main.ts              # Bootstrap de la aplicación
```

## Endpoints Principales

Consultar documentación detallada de la API en: [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

### Resumen de Módulos

- **/departments**: CRUD de departamentos + búsqueda/filtrado
- **/employees**: CRUD de empleados + validación de cédula + filtros
- **/asset-types**: CRUD de tipos de activos + gestión
- **/fixed-assets**: CRUD de activos fijos + resumen depreciación
- **/depreciation-calculations**: Proceso mensual + estadísticas

## Validaciones Implementadas

### Cédula Dominicana

- Algoritmo de validación según norma dominicana (módulo 10)
- Diferenciación entre persona física (11 dígitos) y jurídica (9 dígitos)

### Fechas

- No se permiten fechas futuras en registros históricos
- Validación personalizada con decorador `@IsNotFutureDate()`

### Integridad Referencial

- Departamentos: No se pueden desactivar con empleados/activos activos
- Tipos de Activo: No se pueden desactivar con activos activos
- Empleados: Solo se asignan a departamentos activos
- Activos: Solo se asignan a departamentos y tipos activos

### Validaciones de Negocio

- Nombres únicos en Departamentos y Tipos de Activo
- Cédulas únicas por empleado
- Valor residual no puede exceder valor de compra
- Vida útil máxima de 600 meses (50 años)

## Proceso de Depreciación

El proceso de depreciación mensual:

1. **Endpoint**: `POST /depreciation-calculations/run`
2. **Body**: `{ processYear: 2024, processMonth: 1 }`
3. **Proceso**:
   - Selecciona todos los activos fijos activos
   - Calcula depreciación mensual (método lineal)
   - Omite activos totalmente depreciados
   - Omite activos sin valor a depreciar
   - Actualiza depreciación acumulada
   - Retorna resumen: procesados, omitidos, total

## Stack Tecnológico

- **Framework**: NestJS 11.0.1
- **ORM**: TypeORM 0.3.28
- **Base de Datos**: PostgreSQL
- **Validación**: class-validator 0.15.1, class-transformer
- **Lenguaje**: TypeScript 5

## Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## Mejoras Implementadas

✅ Soft-delete en todos los módulos  
✅ Validaciones exhaustivas de DTOs  
✅ Integridad referencial antes de eliminaciones  
✅ 14+ endpoints especializados de filtrado/búsqueda  
✅ Custom decorators para validaciones de negocio  
✅ Manejo robusto de excepciones (409 Conflict, 400 Bad Request, 404 Not Found)

## Pendientes

- [ ] Documentación Swagger/OpenAPI
- [ ] Sistema de logging y auditoría
- [ ] Tests automatizados completos
- [ ] Migración a TypeORM migrations (en lugar de synchronize)
- [ ] Autenticación y autorización (JWT)
- [ ] Rate limiting y throttling

## Licencia

MIT
