# 📚 API Backend - Sistema POS Coquito

> Documentación completa y actualizada de la API REST para el sistema de gestión y punto de venta de Embutidos Coquito

**Versión:** 2.0  
**Última actualización:** Noviembre 2024  
**Stack:** Node.js + Express + TypeScript + Prisma + PostgreSQL

---

## 📖 Tabla de Contenidos

- [🌐 Información General](#-información-general)
- [🏗️ Arquitectura](#️-arquitectura)
- [💾 Modelos de Base de Datos](#-modelos-de-base-de-datos)
- [🔐 Autenticación](#-autenticación)
- [📦 API Endpoints](#-api-endpoints)
  - [Auth](#auth-endpoints)
  - [Users](#users-endpoints)
  - [Categories](#categories-endpoints)
  - [Products](#products-endpoints)
  - [Product Batches](#product-batches-endpoints)
  - [Stock Movements](#stock-movements-endpoints)
  - [Customers](#customers-endpoints)
- [🎯 Flujos de Trabajo](#-flujos-de-trabajo)
- [⚠️ Manejo de Errores](#️-manejo-de-errores)
- [🚀 Instalación](#-instalación)

---

## 🌐 Información General

### Base URL
```
Desarrollo:  http://localhost:3000/api
Producción:  https://api.coquito.com
```

### Stack Tecnológico
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL 15+
- **ORM**: Prisma 6.x
- **Validación**: Zod
- **Autenticación**: JWT
- **Encriptación**: Bcrypt
- **Email**: Nodemailer

### Headers Globales
```http
Content-Type: application/json
```

Para rutas protegidas:
```http
Authorization: Bearer <access_token>
```

---

## 🏗️ Arquitectura

### Clean Architecture

El backend sigue los principios de **Clean Architecture** con separación de responsabilidades:

```
┌───────────────────────────────────────────────┐
│       PRESENTATION LAYER                      │
│   Controllers │ Routes │ Views                │
│   • HTTP Request/Response                     │
│   • Validación inicial de entrada             │
│   • Llamadas a Use Cases                      │
└────────────────────┬──────────────────────────┘
                     │
┌────────────────────▼──────────────────────────┐
│       DOMAIN LAYER                            │
│   Use Cases │ DTOs │ Entities │ Schemas       │
│   • Lógica de negocio pura                    │
│   • Validación con Zod                        │
│   • Reglas de dominio                         │
│   • Abstracciones (Repositories/Datasources)  │
└────────────────────┬──────────────────────────┘
                     │
┌────────────────────▼──────────────────────────┐
│       INFRASTRUCTURE LAYER                    │
│   Datasources │ Repositories │ Services       │
│   • Acceso a PostgreSQL con Prisma            │
│   • Implementaciones concretas                │
│   • Servicios externos (Email, Storage)       │
└───────────────────────────────────────────────┘
```

### Principios Aplicados
- ✅ **SOLID**: Single Responsibility, Dependency Inversion
- ✅ **DRY**: No repetir código
- ✅ **Separation of Concerns**: Cada capa tiene responsabilidad única
- ✅ **Dependency Injection**: Inyección de dependencias en constructores

---

## 💾 Modelos de Base de Datos

### User (Usuarios del Sistema)

```typescript
{
  id: string (UUID)
  username: string (único)
  email: string (único)
  emailVerified: boolean (default: false)
  password: string (hasheado con bcrypt)
  firstName: string
  lastName: string
  phone?: string
  role: "Administrador" | "Cajero"
  status: "Activo" | "Inactivo" | "Suspendido"
  refreshToken?: string
  createdAt: DateTime
  updatedAt: DateTime
  lastConnection?: DateTime
}
```

### Category (Categorías de Productos)

```typescript
{
  id: string (UUID)
  name: string (único)
  description?: string
  status: "Activo" | "Inactivo"
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Categorías típicas:**
- Trozados de Pollo (pechugas, piernas, alas)
- Chorizos (clásico, ahumado, picante)
- Mortadelas
- Hamburguesas
- Nuggets
- Filetes

### Product (Productos)

```typescript
{
  id: string (UUID)
  name: string
  description?: string
  price: Decimal(10,2)  // Precio unitario o base
  sku?: string (único)
  stock: number (int)
  minStock: number (int, default: 5)
  image?: string (URL)
  status: "Disponible" | "SinStock" | "Descontinuado"
  ingredients?: string (Text)
  categoryId: string (UUID)
  
  // Campos para peso variable (NUEVO)
  isVariableWeight: boolean (default: false)
  pricePerKg?: Decimal(10,2)  // Solo para peso variable
  
  // Relaciones
  category: Category
  batches: ProductBatch[]  // Solo si isVariableWeight = true
  stockMovements: StockMovement[]
  orderItems: OrderItem[]
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Tipos de productos:**

1. **Peso Fijo** (`isVariableWeight = false`):
   - Chorizos, Mortadelas, Hamburguesas empaquetadas
   - Cada unidad tiene el MISMO peso y precio
   - Ejemplo: "Chorizo Clásico 1/2kg" → 25 Bs/unidad
   - Stock se maneja normalmente

2. **Peso Variable** (`isVariableWeight = true`):
   - Pechugas, Piernas, Alas, Rabadillas
   - Cada unidad tiene DIFERENTE peso y precio
   - Ejemplo: "Pechuga de Pollo" → 55 Bs/kg
   - Stock se maneja por batches individuales

### ProductBatch (Lotes de Productos - NUEVO)

```typescript
{
  id: string (UUID)
  productId: string (UUID)
  batchCode: string (único) // Ej: "PEC-POL-450G-001"
  weight: Decimal(10,3)     // Peso en kg: 0.450, 0.485
  unitPrice: Decimal(10,2)  // Precio de esta unidad: 25.00
  stock: number (int)       // Unidades disponibles de este peso/precio
  
  // Relaciones
  product: Product
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Generación de batchCode:**
```
Formato: [SKU]-[PESO]G-[TIMESTAMP]
Ejemplo: "PEC-POL-450G-123"
  - PEC-POL: SKU del producto
  - 450G: Peso en gramos
  - 123: Últimos 3 dígitos del timestamp
```

### StockMovement (Movimientos de Inventario)

```typescript
{
  id: string (UUID)
  productId: string (UUID)
  userId: string (UUID)
  type: "Reabastecimiento" | "Compra" | "Venta" | "Ajuste" | "Devolucion" | "Dañado"
  quantity: number (int, puede ser negativo)
  previousStock: number (int)
  newStock: number (int)
  reason?: string
  reference?: string  // ID orden, factura, etc.
  notes?: string
  
  // Relaciones
  product: Product
  user: User
  
  createdAt: DateTime
}
```

**Tipos de movimientos:**
1. **Reabastecimiento**: Fábrica (Yacuiba) → Tienda (Tarija)
2. **Compra**: Proveedores externos → Inventario
3. **Venta**: Inventario → Cliente
4. **Ajuste**: Corrección de inventario físico
5. **Devolucion**: Cliente → Inventario
6. **Dañado**: Inventario → Baja (vencido, dañado)

### Customer (Clientes)

```typescript
{
  id: string (UUID)
  firstName: string
  lastName: string
  email?: string (único si existe)
  phone?: string
  address?: string
  password: string (hasheado)
  type: "Regular" | "VIP" | "Ocasional"
  
  // Relaciones
  orders: Order[]
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔐 Autenticación

### Flujo JWT

```
1. Login → Access Token (1h) + Refresh Token (7d)
2. Peticiones → Header: Authorization: Bearer <access_token>
3. Token expira → POST /api/auth/refresh-token con refreshToken
4. Nuevo Access Token generado
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Administrador** | CRUD completo en todas las entidades |
| **Cajero** | Crear órdenes, ver productos, cerrar su caja |

---

## 📦 API Endpoints

### Auth Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123@"
}
```

**Respuesta 200:**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@coquito.com",
    "emailVerified": true,
    "firstName": "Administrador",
    "lastName": "Sistema",
    "role": "Administrador",
    "status": "Activo"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errores:**
- `400`: "Usuario o contraseña incorrectos"
- `400`: "Email no verificado"
- `400`: "Usuario inactivo o suspendido"

#### 2. Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "cajero1",
  "email": "cajero1@coquito.com",
  "password": "Cajero123@",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "70123456",
  "role": "Cajero"
}
```

**Validación de contraseña:**
- Mínimo 6 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (@$!%*?&)

#### 3. Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Respuesta 200:**
```json
{
  "accessToken": "nuevo_token...",
  "refreshToken": "nuevo_refresh_token..."
}
```

#### 4. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@coquito.com"
}
```

#### 5. Reset Password
```http
POST /api/auth/reset-password-submit
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NuevaPassword123@"
}
```

#### 6. Verify Email
```http
GET /api/auth/verify-email/:token
```

---

### Users Endpoints

#### 1. Obtener Usuarios (Paginado)
```http
GET /api/users?page=1&limit=10&search=juan&role=Cajero&status=Activo
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` (opcional): Busca en username, email, firstName, lastName, phone
- `role` (opcional): "Administrador" | "Cajero"
- `status` (opcional): "Activo" | "Inactivo" | "Suspendido"
- `page` (default: 1): Número de página
- `limit` (default: 5, max: 100): Usuarios por página

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "username": "cajero1",
      "email": "cajero1@coquito.com",
      "emailVerified": true,
      "firstName": "Juan",
      "lastName": "Pérez",
      "phone": "70123456",
      "role": "Cajero",
      "status": "Activo",
      "createdAt": "2024-11-08T10:30:00.000Z",
      "updatedAt": "2024-11-08T10:30:00.000Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "nextPage": "/api/users?page=2&limit=10",
  "previousPage": null
}
```

#### 2. Obtener Usuario por ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### 3. Crear Usuario
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "cajero2",
  "email": "cajero2@coquito.com",
  "password": "Cajero123@",
  "firstName": "María",
  "lastName": "González",
  "phone": "70987654",
  "role": "Cajero",
  "status": "Activo"
}
```

**Validaciones:**
- Username único, 3-20 caracteres
- Email único, formato válido
- Password: requisitos de seguridad
- Role: "Administrador" | "Cajero"
- Status: "Activo" | "Inactivo" | "Suspendido"

**Respuesta 201:**
```json
{
  "message": "Usuario creado exitosamente",
  "user": { ... }
}
```

**Errores:**
- `400`: "El username ya existe"
- `400`: "El email ya está registrado"
- `400`: "El teléfono ya está en uso"

#### 4. Actualizar Usuario
```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "María Elena",
  "status": "Suspendido"
}
```

**Nota:** Actualización parcial (solo envía campos a modificar)

#### 5. Eliminar Usuario
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Validación:** No se puede eliminar si tiene órdenes o cajas asociadas

---

### Categories Endpoints

#### 1. Obtener Categorías (Paginado)
```http
GET /api/categories?page=1&limit=20&search=chorizo&status=Activo
```

**Query Parameters:**
- `search` (opcional): Busca en name y description
- `status` (opcional): "Activo" | "Inactivo"
- `page` (default: 1)
- `limit` (default: 5, max: 100)

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Chorizos",
      "description": "Chorizos de pollo en diferentes variedades",
      "status": "Activo",
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-01T10:00:00.000Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "nextPage": null,
  "previousPage": null
}
```

#### 2. Crear Categoría
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Trozados de Pollo",
  "description": "Productos de pollo cortados: pechugas, piernas, alas",
  "status": "Activo"
}
```

**Validaciones:**
- Name: único, 1-100 caracteres
- Description: max 500 caracteres (opcional)
- Status: "Activo" | "Inactivo" (default: "Activo")

#### 3. Actualizar Categoría
```http
PATCH /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Trozados de Pollo Premium",
  "status": "Activo"
}
```

#### 4. Eliminar Categoría
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

**Validación:** No se puede eliminar si tiene productos asociados

---

### Products Endpoints

#### 1. Obtener Productos (Paginado)
```http
GET /api/products?page=1&limit=12&search=chorizo&categoryId=uuid&status=Disponible&minStock=10
```

**Query Parameters:**
- `search` (opcional): Busca en name, description, sku
- `categoryId` (opcional): UUID de la categoría
- `status` (opcional): "Disponible" | "SinStock" | "Descontinuado"
- `minStock` (opcional): Filtra productos con stock <= valor especificado
- `page` (default: 1)
- `limit` (default: 5, max: 100)

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid-123",
      "name": "Chorizo Clásico 1/2kg",
      "description": "Chorizo de pollo con especias naturales",
      "price": 25.00,
      "sku": "CHO-CLA-001",
      "stock": 50,
      "minStock": 10,
      "image": "https://...",
      "status": "Disponible",
      "ingredients": "Carne de pollo, tocino de cerdo, almidón, sal, especias",
      "categoryId": "uuid-cat",
      "isVariableWeight": false,
      "pricePerKg": null,
      "category": {
        "id": "uuid-cat",
        "name": "Chorizos",
        "status": "Activo"
      },
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-08T15:30:00.000Z"
    },
    {
      "id": "uuid-456",
      "name": "Pechuga de Pollo",
      "description": "Pechuga sin piel, peso variable",
      "price": 0,
      "sku": "PEC-POL",
      "stock": 12,
      "minStock": 3,
      "image": "https://...",
      "status": "Disponible",
      "ingredients": "Pechuga de pollo fresca",
      "categoryId": "uuid-trozados",
      "isVariableWeight": true,
      "pricePerKg": 55.00,
      "category": {
        "id": "uuid-trozados",
        "name": "Trozados de Pollo"
      },
      "createdAt": "2024-11-05T08:00:00.000Z",
      "updatedAt": "2024-11-08T16:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 12,
  "totalPages": 4,
  "nextPage": "/api/products?page=2&limit=12",
  "previousPage": null
}
```

#### 2. Obtener Producto por ID
```http
GET /api/products/:id
```

**Respuesta 200:**
```json
{
  "id": "uuid",
  "name": "Chorizo Clásico 1/2kg",
  ...
}
```

#### 3. Crear Producto (Peso Fijo)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chorizo Ahumado 1/2kg",
  "description": "Chorizo de pollo ahumado",
  "price": 28.00,
  "sku": "CHO-AHU-002",
  "stock": 30,
  "minStock": 5,
  "image": "https://example.com/chorizo-ahumado.jpg",
  "ingredients": "Carne de pollo, tocino, sal, especias ahumadas",
  "categoryId": "uuid-chorizos",
  "status": "Disponible",
  "isVariableWeight": false,
  "pricePerKg": null
}
```

**Validaciones:**
- name: 1-100 caracteres, único
- price: > 0, max 2 decimales
- sku: max 50 caracteres, único (opcional)
- stock: >= 0 (int)
- minStock: >= 0 (int, default: 5)
- image: URL válida
- categoryId: debe existir (FK)
- isVariableWeight: boolean (default: false)
- pricePerKg: requerido SOLO si isVariableWeight = true

**Respuesta 201:**
```json
{
  "message": "Producto creado exitosamente",
  "product": {
    "id": "uuid-nuevo",
    "name": "Chorizo Ahumado 1/2kg",
    ...
  }
}
```

**Errores:**
- `400`: "El SKU ya está en uso"
- `400`: "El producto ya existe"
- `404`: "La categoría especificada no existe"
- `400`: "Los productos de peso variable deben tener precio por kg"

#### 4. Crear Producto (Peso Variable)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pechuga de Pollo",
  "description": "Pechuga sin piel, peso variable",
  "price": 0,
  "sku": "PEC-POL",
  "stock": 0,
  "minStock": 3,
  "image": "https://example.com/pechuga.jpg",
  "ingredients": "Pechuga de pollo fresca",
  "categoryId": "uuid-trozados",
  "status": "Disponible",
  "isVariableWeight": true,
  "pricePerKg": 55.00
}
```

**Nota importante:**
- Si `isVariableWeight = true`:
  - `stock` se fuerza a 0 (se maneja por batches)
  - `pricePerKg` es REQUERIDO
  - `price` puede ser 0 (se ignora)

#### 5. Actualizar Producto
```http
PATCH /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 30.00,
  "stock": 45,
  "status": "Disponible"
}
```

**Nota:** Solo envía campos a actualizar (PATCH parcial)

#### 6. Eliminar Producto
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

**Validación:** No se puede eliminar si tiene orderItems asociados

---

### Product Batches Endpoints

> **Nota:** Los batches solo aplican para productos con `isVariableWeight = true`

#### 1. Crear Batch
```http
POST /api/products/:productId/batches
Authorization: Bearer <token>
Content-Type: application/json

{
  "weight": 0.450,
  "unitPrice": 25.00
}
```

**Ejemplo de flujo:**
```
1. Balanza indica: 450g (0.450kg) → Precio calculado: 25 Bs
2. Usuario ingresa en el sistema:
   - weight: 0.450
   - unitPrice: 25.00
3. Backend genera automáticamente:
   - batchCode: "PEC-POL-450G-123"
   - stock: 1 (siempre empieza en 1)
4. Incrementa product.stock en 1
```

**Respuesta 201:**
```json
{
  "message": "Batch creado exitosamente",
  "batch": {
    "id": "batch-uuid",
    "productId": "uuid-123",
    "batchCode": "PEC-POL-450G-123",
    "weight": 0.450,
    "unitPrice": 25.00,
    "stock": 1,
    "createdAt": "2024-11-08T16:45:00.000Z",
    "product": {
      "id": "uuid-123",
      "name": "Pechuga de Pollo",
      "sku": "PEC-POL",
      "stock": 1
    }
  }
}
```

**Validaciones:**
- `404`: "Producto no encontrado"
- `400`: "Este producto no es de peso variable"
- `400`: "Peso debe ser mayor a 0"
- `400`: "Peso máximo 10 kg"

**Transacción atómica:**
```sql
BEGIN;
  INSERT INTO product_batches (...) VALUES (...);
  UPDATE products SET stock = stock + 1 WHERE id = :productId;
COMMIT;
```

#### 2. Obtener Batches de un Producto
```http
GET /api/products/:productId/batches
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "batches": [
    {
      "id": "batch-1",
      "productId": "uuid-123",
      "batchCode": "PEC-POL-450G-001",
      "weight": 0.450,
      "unitPrice": 25.00,
      "stock": 3,
      "createdAt": "2024-11-08T08:00:00.000Z"
    },
    {
      "id": "batch-2",
      "batchCode": "PEC-POL-485G-002",
      "weight": 0.485,
      "unitPrice": 27.00,
      "stock": 1,
      "createdAt": "2024-11-08T09:15:00.000Z"
    }
  ]
}
```

**Nota:** Solo retorna batches con `stock > 0`

#### 3. Actualizar Stock de Batch
```http
PATCH /api/products/batches/:batchId
Authorization: Bearer <token>
Content-Type: application/json

{
  "stock": 5
}
```

**Ejemplo de flujo (Reasignación):**
```
Escenario: Llegan 2 pechugas más que pesan 450g c/u (igual que batch-1)

Opción: Incrementar stock del batch existente
PATCH /api/products/batches/batch-1
{ "stock": 5 }  // Era 3, ahora 5

Backend hace:
1. stockDifference = 5 - 3 = 2
2. Actualiza batch.stock = 5
3. Incrementa product.stock en 2 (12 → 14)
```

**Respuesta 200:**
```json
{
  "message": "Stock de batch actualizado exitosamente",
  "batch": {
    "id": "batch-1",
    "stock": 5,
    ...
  }
}
```

**Transacción atómica:**
```sql
BEGIN;
  UPDATE product_batches SET stock = :newStock WHERE id = :batchId;
  UPDATE products SET stock = stock + :difference WHERE id = :productId;
COMMIT;
```

#### 4. Eliminar Batch
```http
DELETE /api/products/batches/:batchId
Authorization: Bearer <token>
```

**Validaciones:**
- `404`: "Batch no encontrado"
- `400`: "No se puede eliminar porque tiene X unidad(es) en stock"

**Nota:** Solo se puede eliminar batches con stock = 0

---

### Stock Movements Endpoints

#### 1. Buscar Movimientos (Paginado)
```http
GET /api/stock-movements/search?productId=uuid&userId=uuid&type=Venta&startDate=2024-11-01&endDate=2024-11-08&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `productId` (opcional): UUID del producto
- `userId` (opcional): UUID del usuario
- `type` (opcional): "Reabastecimiento" | "Compra" | "Venta" | "Ajuste" | "Devolucion" | "Dañado"
- `startDate` (opcional): ISO 8601 datetime (ej: "2024-11-01T00:00:00Z")
- `endDate` (opcional): ISO 8601 datetime
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Respuesta 200:**
```json
{
  "movements": [
    {
      "id": "uuid",
      "productId": "uuid-producto",
      "userId": "uuid-usuario",
      "type": "Venta",
      "quantity": -5,
      "previousStock": 50,
      "newStock": 45,
      "reason": "Venta a cliente mayorista",
      "reference": "ORD-2024-001",
      "notes": "Cliente Juan Pérez",
      "createdAt": "2024-11-08T14:30:00.000Z",
      "user": {
        "username": "cajero1",
        "firstName": "Juan",
        "lastName": "Pérez"
      },
      "product": {
        "name": "Chorizo Clásico 1/2kg",
        "stock": 45
      }
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### 2. Obtener Movimientos por Producto
```http
GET /api/stock-movements/product/:productId?page=1&limit=10
Authorization: Bearer <token>
```

#### 3. Obtener Movimiento por ID
```http
GET /api/stock-movements/:id
Authorization: Bearer <token>
```

#### 4. Crear Movimiento de Stock
```http
POST /api/stock-movements
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid-producto",
  "userId": "uuid-usuario",
  "type": "Reabastecimiento",
  "quantity": 100,
  "reason": "Llegada desde fábrica Yacuiba",
  "reference": "REAB-2024-001",
  "notes": "Camión #5, conductor: José García"
}
```

**Validaciones:**
- quantity: NO puede ser 0
- quantity positivo: Incrementa stock (Reabastecimiento, Compra, Devolucion)
- quantity negativo: Decrementa stock (Venta, Ajuste, Dañado)
- newStock: NO puede ser negativo

**Respuesta 201:**
```json
{
  "message": "Movimiento de stock registrado exitosamente",
  "movement": {
    "id": "uuid",
    "productId": "uuid-producto",
    "userId": "uuid-usuario",
    "type": "Reabastecimiento",
    "quantity": 100,
    "previousStock": 50,
    "newStock": 150,
    "reason": "Llegada desde fábrica Yacuiba",
    "reference": "REAB-2024-001",
    "createdAt": "2024-11-08T16:00:00.000Z"
  }
}
```

**Errores:**
- `404`: "Producto no encontrado"
- `404`: "Usuario no encontrado"
- `400`: "No se puede realizar el movimiento. Stock insuficiente. Stock actual: X, Cantidad solicitada: Y"

**Transacción atómica:**
```sql
BEGIN;
  -- 1. Calcular nuevo stock
  newStock = previousStock + quantity

  -- 2. Validar nuevo stock >= 0
  IF newStock < 0 THEN ROLLBACK;

  -- 3. Crear movimiento
  INSERT INTO stock_movements (...) VALUES (...);

  -- 4. Actualizar stock del producto
  UPDATE products SET stock = :newStock WHERE id = :productId;
COMMIT;
```

---

### Customers Endpoints

#### 1. Obtener Clientes (Paginado)
```http
GET /api/customers?page=1&limit=10&search=juan&type=VIP
```

**Query Parameters:**
- `search` (opcional): Busca en firstName, lastName, email, phone
- `type` (opcional): "Regular" | "VIP" | "Ocasional"
- `page` (default: 1)
- `limit` (default: 5, max: 100)

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@email.com",
      "phone": "70123456",
      "address": "Av. Principal #123, Tarija",
      "type": "VIP",
      "createdAt": "2024-10-15T10:00:00.000Z",
      "updatedAt": "2024-11-01T14:30:00.000Z"
    }
  ],
  "total": 234,
  "page": 1,
  "limit": 10,
  "totalPages": 24,
  "nextPage": "/api/customers?page=2&limit=10",
  "previousPage": null
}
```

#### 2. Crear Cliente
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "María",
  "lastName": "González",
  "email": "maria@email.com",
  "phone": "70987654",
  "address": "Calle Central #456, Tarija",
  "password": "ClientePass123@",
  "type": "Regular"
}
```

**Validaciones:**
- firstName, lastName: 2-50 caracteres
- email: único (si se proporciona)
- phone: 8 dígitos
- type: "Regular" | "VIP" | "Ocasional" (default: "Regular")

#### 3. Actualizar Cliente
```http
PATCH /api/customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "VIP",
  "address": "Nueva dirección"
}
```

#### 4. Eliminar Cliente
```http
DELETE /api/customers/:id
Authorization: Bearer <token>
```

**Validación:** No se puede eliminar si tiene órdenes asociadas

---

## 🎯 Flujos de Trabajo

### Flujo 1: Registrar Producto de Peso Fijo (Chorizo)

```
1️⃣ Llegan 50 Chorizos Clásicos 1/2kg desde la fábrica

2️⃣ POST /api/products
{
  "name": "Chorizo Clásico 1/2kg",
  "price": 25.00,
  "sku": "CHO-CLA-001",
  "stock": 50,
  "categoryId": "uuid-chorizos",
  "isVariableWeight": false
}

3️⃣ Producto creado con:
   - Stock: 50 unidades
   - Precio: 25 Bs/unidad
   - Total valor: 1,250 Bs

4️⃣ Sistema listo para ventas ✅
```

### Flujo 2: Registrar Producto de Peso Variable (Pechugas)

```
1️⃣ Llegan 5 Pechugas de Pollo (SIN pesar aún)

2️⃣ Crear producto BASE (una sola vez):

POST /api/products
{
  "name": "Pechuga de Pollo",
  "sku": "PEC-POL",
  "stock": 0,
  "categoryId": "uuid-trozados",
  "isVariableWeight": true,
  "pricePerKg": 55.00
}

Producto creado ✅ (sin stock aún)

3️⃣ Pesar cada pechuga individualmente:

Pechuga #1: 450g → 25 Bs
POST /api/products/uuid-pechuga/batches
{ "weight": 0.450, "unitPrice": 25.00 }
→ Batch "PEC-POL-450G-001" creado
→ Product.stock: 0 → 1

Pechuga #2: 485g → 27 Bs
POST /api/products/uuid-pechuga/batches
{ "weight": 0.485, "unitPrice": 27.00 }
→ Batch "PEC-POL-485G-002" creado
→ Product.stock: 1 → 2

Pechuga #3: 520g → 29 Bs
POST /api/products/uuid-pechuga/batches
{ "weight": 0.520, "unitPrice": 29.00 }
→ Batch "PEC-POL-520G-003" creado
→ Product.stock: 2 → 3

Pechuga #4: 450g → 25 Bs (mismo peso que #1)
POST /api/products/uuid-pechuga/batches
{ "weight": 0.450, "unitPrice": 25.00 }
→ Batch "PEC-POL-450G-004" creado
→ Product.stock: 3 → 4

Pechuga #5: 450g → 25 Bs (mismo peso que #1 y #4)
POST /api/products/uuid-pechuga/batches
{ "weight": 0.450, "unitPrice": 25.00 }
→ Batch "PEC-POL-450G-005" creado
→ Product.stock: 4 → 5

4️⃣ Estado final del producto:
   GET /api/products/uuid-pechuga/batches
   
   Producto "Pechuga de Pollo":
     - Stock total: 5 unidades
     - Batches: 5 registros
     - Valor total: (3 × 25) + (1 × 27) + (1 × 29) = 131 Bs
```

### Flujo 3: Reasignar Stock de Batch Existente

```
Escenario: Llegan 2 pechugas más que pesan 450g c/u (igual que batch-1)

Opción A: Crear nuevos batches
  POST /api/products/uuid-pechuga/batches
  { "weight": 0.450, "unitPrice": 25.00 }  → 2 veces

Opción B: Incrementar stock del batch existente ⭐ RECOMENDADO
  PATCH /api/products/batches/batch-1
  { "stock": 5 }  // Era 3, ahora 5
  
  Backend:
    - Diferencia: 5 - 3 = 2
    - Batch stock: 3 → 5
    - Product stock: 5 → 7
```

### Flujo 4: Crear Movimiento de Stock

```
Escenario: Venta de 3 Chorizos Clásicos

1️⃣ POST /api/stock-movements
{
  "productId": "uuid-chorizo",
  "userId": "uuid-cajero",
  "type": "Venta",
  "quantity": -3,  ← Negativo para decrementar
  "reason": "Venta a cliente Juan Pérez",
  "reference": "ORD-2024-150"
}

2️⃣ Backend (Transacción):
   - Valida producto y usuario existen
   - previousStock = 50
   - newStock = 50 + (-3) = 47
   - Valida newStock >= 0 ✅
   - Crea movimiento en stock_movements
   - Actualiza product.stock = 47
   - COMMIT

3️⃣ Respuesta:
{
  "message": "Movimiento de stock registrado exitosamente",
  "movement": {
    "previousStock": 50,
    "newStock": 47,
    ...
  }
}
```

---

## 📋 Códigos de Estado HTTP

| Código | Nombre | Cuándo se usa |
|--------|--------|---------------|
| `200` | OK | Operación exitosa (GET, PATCH, DELETE) |
| `201` | Created | Recurso creado exitosamente (POST) |
| `400` | Bad Request | Datos inválidos, validación fallida |
| `401` | Unauthorized | Token inválido, expirado o ausente |
| `403` | Forbidden | Usuario sin permisos para la operación |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Server Error | Error inesperado del servidor |

---

## ⚠️ Manejo de Errores

### Formato de Respuesta de Error
```json
{
  "error": "Mensaje descriptivo del error"
}
```

### Ejemplos de Errores Comunes

#### Validación de Datos
```json
{
  "error": "El nombre es requerido"
}
```

```json
{
  "error": "El precio debe ser mayor a 0"
}
```

#### Recursos No Encontrados
```json
{
  "error": "Producto no encontrado"
}
```

```json
{
  "error": "La categoría especificada no existe"
}
```

#### Conflictos de Unicidad
```json
{
  "error": "El SKU ya está en uso"
}
```

```json
{
  "error": "El email ya está registrado"
}
```

#### Restricciones de Integridad
```json
{
  "error": "No se puede eliminar el producto porque tiene 12 orden(es) asociada(s)"
}
```

```json
{
  "error": "No se puede eliminar la categoría porque tiene 45 producto(s) asociado(s)"
}
```

#### Stock Insuficiente
```json
{
  "error": "No se puede realizar el movimiento. Stock insuficiente. Stock actual: 5, Cantidad solicitada: 10"
}
```

#### Validación de Peso Variable
```json
{
  "error": "Este producto no es de peso variable. Use el stock normal."
}
```

```json
{
  "error": "Los productos de peso variable deben tener precio por kg"
}
```

---

## 🔒 Validaciones de Seguridad

### Contraseñas
- Mínimo 6 caracteres
- Al menos 1 letra mayúscula (A-Z)
- Al menos 1 letra minúscula (a-z)
- Al menos 1 número (0-9)
- Al menos 1 carácter especial (@$!%*?&)

**Ejemplo válido:** `Admin123@`, `Cajero2024!`, `Secure$Pass1`

### Tokens JWT
- **Access Token**: Expira en 1 hora
- **Refresh Token**: Expira en 7 días
- **Algoritmo**: HS256
- **Payload**: { userId, role, email }

### Rate Limiting
- Login: 5 intentos por 15 minutos
- API general: 100 requests por minuto

---

## 🗃️ Estructura de Respuestas Paginadas

Todas las respuestas paginadas siguen este formato estándar:

```json
{
  "data": [...],
  "total": 156,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "nextPage": "/api/resource?page=2&limit=20",
  "previousPage": null
}
```

**Campos:**
- `data`: Array de recursos
- `total`: Total de recursos en la BD (con filtros aplicados)
- `page`: Página actual
- `limit`: Límite de recursos por página
- `totalPages`: Total de páginas disponibles
- `nextPage`: URL de la siguiente página (null si es la última)
- `previousPage`: URL de la página anterior (null si es la primera)

---

## 🚀 Instalación

### Requisitos Previos
- Node.js 20+
- PostgreSQL 15+
- npm o yarn

### Paso 1: Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/backend-coquito.git
cd backend-coquito
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Base de datos
POSTGRES_URL="postgresql://postgres:password@localhost:5432/coquito_db"

# JWT
JWT_SEED="clave_secreta_muy_segura_cambiar_en_produccion"

# Email
MAILER_SERVICE="gmail"
MAILER_EMAIL="sistema@coquito.com"
MAILER_SECRET_KEY="tu_app_password_de_gmail"

# URLs
WEBSERVICE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:5173"

# Servidor
PORT=3000
PUBLIC_PATH="./public"
```

### Paso 4: Configurar Base de Datos

**Con Docker (Recomendado):**
```bash
docker-compose up -d
```

**O instalar PostgreSQL localmente**

### Paso 5: Ejecutar Migraciones
```bash
npx prisma migrate dev
```

### Paso 6: Generar Cliente Prisma
```bash
npx prisma generate
```

### Paso 7: Seed de Datos (Opcional)
```bash
npx prisma db seed
```

### Paso 8: Iniciar Servidor
```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## 🧪 Testing

### Ver Base de Datos
```bash
npx prisma studio
```
Abre interfaz web en `http://localhost:5555`

### Verificar Migraciones
```bash
npx prisma migrate status
```

### Resetear Base de Datos
```bash
npx prisma migrate reset
```
⚠️ **CUIDADO:** Elimina TODOS los datos

---

## 📊 Estadísticas y Métricas

### Obtener Stock Total por Categoría
```sql
SELECT 
  c.name as categoria,
  SUM(p.stock) as total_unidades,
  SUM(p.price * p.stock) as valor_total
FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY valor_total DESC;
```

### Obtener Productos con Stock Bajo
```sql
SELECT 
  name,
  stock,
  min_stock,
  (stock - min_stock) as diferencia
FROM products
WHERE stock <= min_stock
  AND status = 'Disponible'
ORDER BY diferencia ASC;
```

### Historial de Movimientos de un Producto
```sql
SELECT 
  sm.type,
  sm.quantity,
  sm.previous_stock,
  sm.new_stock,
  sm.reason,
  u.username as realizado_por,
  sm.created_at
FROM stock_movements sm
JOIN users u ON sm.user_id = u.id
WHERE sm.product_id = 'uuid-del-producto'
ORDER BY sm.created_at DESC
LIMIT 50;
```

### Valor Total de Inventario
```sql
-- Productos de peso fijo
SELECT 
  SUM(price * stock) as valor_peso_fijo
FROM products
WHERE is_variable_weight = false;

-- Productos de peso variable (por batches)
SELECT 
  SUM(unit_price * stock) as valor_peso_variable
FROM product_batches;
```

---

## 🎨 Casos de Uso Especiales

### Caso 1: Producto Peso Fijo con Variación de Precio

**Escenario:** "Chorizo Clásico" normalmente cuesta 25 Bs, pero en promoción cuesta 22 Bs

**Solución:**
```http
PATCH /api/products/uuid-chorizo
{
  "price": 22.00
}
```

Todas las unidades ahora cuestan 22 Bs (actualización global)

### Caso 2: Producto Peso Variable con Múltiples Unidades del Mismo Peso

**Escenario:** Llegan 3 pechugas que pesan 450g c/u

**Opción A - Crear 3 batches separados:**
```
POST /api/products/uuid-pechuga/batches
{ "weight": 0.450, "unitPrice": 25.00 }  → 3 veces
```

**Opción B - Crear 1 batch y luego incrementar stock (MÁS EFICIENTE):**
```
POST /api/products/uuid-pechuga/batches
{ "weight": 0.450, "unitPrice": 25.00 }
→ Batch creado con stock: 1

PATCH /api/products/batches/batch-id
{ "stock": 3 }
→ Stock actualizado: 1 → 3
```

### Caso 3: Ajuste de Inventario

**Escenario:** Inventario físico muestra 45 chorizos, sistema dice 50

**Solución:**
```http
POST /api/stock-movements
{
  "productId": "uuid-chorizo",
  "userId": "uuid-usuario",
  "type": "Ajuste",
  "quantity": -5,  ← Diferencia: 45 - 50 = -5
  "reason": "Ajuste por inventario físico del 08/11/2024",
  "reference": "INV-2024-11-08"
}
```

Backend:
- previousStock: 50
- newStock: 45
- Movimiento registrado ✅

---

## 🔗 Relaciones entre Entidades

### Product ↔ Category
```
Category (1) ─────< (N) Product
```
- Relación: Muchos a Uno
- onDelete: Restrict (no se puede eliminar categoría con productos)

### Product ↔ ProductBatch
```
Product (1) ─────< (N) ProductBatch
```
- Relación: Uno a Muchos
- onDelete: Cascade (eliminar producto elimina sus batches)
- Aplicable SOLO si `product.isVariableWeight = true`

### Product ↔ StockMovement
```
Product (1) ─────< (N) StockMovement
User (1) ─────< (N) StockMovement
```
- Relación: Uno a Muchos
- onDelete: Cascade (eliminar producto elimina sus movimientos)
- onDelete: Restrict (no se puede eliminar usuario con movimientos)

### Product ↔ OrderItem
```
Product (1) ─────< (N) OrderItem
Order (1) ─────< (N) OrderItem
```
- Relación: Uno a Muchos
- onDelete: Restrict (no se puede eliminar producto con órdenes)

---

## 📌 Reglas de Negocio

### Products

1. **SKU único**: No puede haber dos productos con el mismo SKU
2. **Nombre único**: No puede haber dos productos con el mismo nombre (case insensitive)
3. **Categoría obligatoria**: Todo producto debe tener una categoría
4. **Stock no negativo**: El stock nunca puede ser menor a 0
5. **Peso variable requiere pricePerKg**: Si `isVariableWeight = true`, `pricePerKg` es REQUERIDO
6. **Stock automático para peso variable**: Si `isVariableWeight = true`, el stock se fuerza a 0 al crear (se maneja por batches)
7. **No eliminar con órdenes**: Producto con orderItems asociados NO puede eliminarse

### Product Batches

1. **Solo para peso variable**: Batches solo pueden crearse en productos con `isVariableWeight = true`
2. **BatchCode único**: Generado automáticamente, no puede duplicarse
3. **Stock inicial = 1**: Todo batch nuevo empieza con 1 unidad
4. **Peso máximo**: 10 kg por unidad
5. **Sincronización automática**: Al crear/actualizar batch, el stock del producto se ajusta automáticamente
6. **No eliminar con stock**: Batch con stock > 0 NO puede eliminarse

### Stock Movements

1. **Transacción atómica**: Crear movimiento + actualizar stock es una operación indivisible
2. **Stock nunca negativo**: Si `newStock < 0`, la transacción se cancela
3. **Quantity no cero**: La cantidad NO puede ser 0
4. **Trazabilidad completa**: Cada movimiento guarda previousStock y newStock
5. **Usuario obligatorio**: Todo movimiento debe tener un userId

### Categories

1. **Nombre único**: No puede haber dos categorías con el mismo nombre
2. **No eliminar con productos**: Categoría con productos asociados NO puede eliminarse

### Customers

1. **Email único**: Si se proporciona email, debe ser único
2. **No eliminar con órdenes**: Cliente con órdenes asociadas NO puede eliminarse

---

## 🛡️ Validaciones Específicas

### Crear Producto de Peso Fijo
```json
{
  "name": "requerido, 1-100 chars, único",
  "description": "opcional, max 500 chars",
  "price": "requerido, > 0, max 2 decimales",
  "sku": "opcional, max 50 chars, único",
  "stock": "requerido, int >= 0",
  "minStock": "opcional, int >= 0, default: 5",
  "image": "requerido, URL válida",
  "ingredients": "opcional, max 1000 chars",
  "categoryId": "requerido, UUID válido, debe existir",
  "status": "opcional, enum, default: Disponible",
  "isVariableWeight": "requerido, boolean, default: false",
  "pricePerKg": "null si isVariableWeight = false"
}
```

### Crear Producto de Peso Variable
```json
{
  "name": "requerido, 1-100 chars, único",
  "sku": "requerido para peso variable",
  "categoryId": "requerido, UUID válido",
  "image": "requerido",
  "isVariableWeight": true,
  "pricePerKg": "REQUERIDO, > 0, max 2 decimales",
  "stock": "ignorado, se fuerza a 0",
  "price": "ignorado si pricePerKg existe"
}
```

### Crear Batch
```json
{
  "weight": "requerido, > 0, max 10 kg, max 3 decimales",
  "unitPrice": "requerido, > 0, max 2 decimales"
}
```

### Crear Stock Movement
```json
{
  "productId": "requerido, UUID, debe existir",
  "userId": "requerido, UUID, debe existir",
  "type": "requerido, enum de 6 tipos",
  "quantity": "requerido, int, NO puede ser 0",
  "reason": "opcional, 1-500 chars",
  "reference": "opcional, 1-100 chars",
  "notes": "opcional, max 1000 chars"
}
```

---

## 📡 Endpoints de Diagnóstico

### Health Check
```http
GET /api/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-08T18:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Database Status
```http
GET /api/db-status
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "connected": true,
  "products": 123,
  "categories": 8,
  "users": 15,
  "customers": 234,
  "stockMovements": 1567,
  "batches": 45
}
```

---

## 🎯 Mejores Prácticas

### 1. Paginación
- Siempre usa paginación en listas grandes
- Límite recomendado: 10-20 para UI, 100 para procesos batch
- Max límite: 100 (validado por backend)

### 2. Búsquedas
- Usa el parámetro `search` para búsquedas generales
- Usa filtros específicos (categoryId, status) para afinar resultados
- Combina filtros para búsquedas precisas

### 3. Stock Movements
- Siempre usa `quantity` positivo para incrementos
- Usa `quantity` negativo para decrementos
- Incluye `reason` descriptivo para auditoría
- Usa `reference` para rastrear órdenes/facturas

### 4. Productos de Peso Variable
- Crea el producto base UNA VEZ con `isVariableWeight: true`
- Crea un batch por cada unidad pesada
- Si varias unidades pesan lo mismo, usa PATCH para incrementar stock del batch

### 5. Manejo de Errores
- Siempre valida respuestas 400/404/500
- Muestra mensajes de error al usuario
- Implementa reintentos para errores 500

---

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```env
# === BASE DE DATOS ===
POSTGRES_URL="postgresql://postgres:password@localhost:5432/coquito_db"

# === JWT ===
JWT_SEED="clave_secreta_muy_segura_cambiar_en_produccion"
ACCESS_TOKEN_EXPIRATION="1h"
REFRESH_TOKEN_EXPIRATION="7d"

# === EMAIL ===
MAILER_SERVICE="gmail"
MAILER_EMAIL="sistema@coquito.com"
MAILER_SECRET_KEY="app_password_de_gmail"
EMAIL_VERIFICATION_EXPIRATION="24h"
PASSWORD_RESET_EXPIRATION="1h"

# === URLs ===
WEBSERVICE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:5173"

# === SERVIDOR ===
PORT=3000
PUBLIC_PATH="./public"
NODE_ENV="development"

# === DOCKER (PostgreSQL) ===
POSTGRES_USER="postgres"
POSTGRES_DB="coquito_db"
POSTGRES_PASSWORD="postgres_password"

# === PGADMIN ===
PGADMIN_DEFAULT_EMAIL="admin@coquito.com"
PGADMIN_DEFAULT_PASSWORD="admin"
```

### Docker Compose Completo

```yaml
version: '3.8'

services:
  postgres-db:
    image: postgres:15-alpine
    container_name: coquito_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - coquito_network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: coquito_pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
    ports:
      - "5050:80"
    depends_on:
      - postgres-db
    networks:
      - coquito_network

volumes:
  postgres_data:

networks:
  coquito_network:
    driver: bridge
```

---

## 📝 Notas del Desarrollador

### Comandos Útiles

```bash
# Ver logs de Prisma
npx prisma migrate status

# Formatear schema.prisma
npx prisma format

# Abrir Prisma Studio
npx prisma studio

# Generar diagrama ER
npx prisma-erd-generator

# Compilar TypeScript
npm run build

# Limpiar build
npm run clean
```

### Scripts NPM Disponibles

```json
{
  "dev": "Desarrollo con hot-reload",
  "build": "Compilar TypeScript",
  "start": "Ejecutar build en producción",
  "test": "Ejecutar tests",
  "migrate": "Ejecutar migraciones",
  "studio": "Abrir Prisma Studio",
  "seed": "Poblar base de datos"
}
```

---

## 🤝 Contribución

### Guía de Contribución

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Sigue Clean Architecture
4. Escribe código en inglés, comentarios en español
5. Usa Zod para validaciones
6. Commit: `git commit -m 'feat: descripción del cambio'`
7. Push: `git push origin feature/nueva-funcionalidad`
8. Abre Pull Request

### Convenciones de Código

- **Código**: Inglés
- **Comentarios**: Español
- **Nombres de archivos**: kebab-case
- **Nombres de clases**: PascalCase
- **Nombres de funciones**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

---

## 📄 Licencia

ISC License - Embutidos Coquito © 2024

---

## 📞 Soporte

- **Email**: soporte@coquito.com
- **Teléfono**: +591 12345678
- **Ubicación**: Tarija, Bolivia

---

**Desarrollado con ❤️ para Embutidos Coquito - Sistema POS** 🐔

*Última actualización: Noviembre 8, 2024*
