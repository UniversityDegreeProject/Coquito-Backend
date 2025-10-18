# 📚 Documentación API Backend - Sistema POS Coquito

> Documentación completa de la API REST para el sistema de punto de venta (POS) Coquito

## 📖 Tabla de Contenidos

- [Información General](#información-general)
- [Arquitectura](#arquitectura)
- [Base de Datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints) **(Orden Cronológico)**
  - [1. Auth](#auth-endpoints) - Autenticación y Registro
  - [2. Users](#users-endpoints) - Gestión de Usuarios
  - [3. Categories](#categories-endpoints) - Gestión de Categorías
  - [4. Products](#products-endpoints) - Gestión de Productos
  - [5. Stock Movements](#stock-movements-endpoints) - Movimientos de Inventario
  - [6. Customers](#customers-endpoints) - Gestión de Clientes
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Estado](#códigos-de-estado)
- [Manejo de Errores](#manejo-de-errores)

---

## 🌐 Información General

### Base URL
```
http://localhost:3000
```

### Tecnologías
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Validación**: Zod
- **Autenticación**: JWT (JSON Web Tokens)
- **Encriptación**: Bcrypt
- **Email**: Nodemailer

### Headers Requeridos

Para todas las peticiones:
```http
Content-Type: application/json
```

Para rutas protegidas (próximamente):
```http
Authorization: Bearer <token>
```

---

## 🏗️ Arquitectura

El backend está construido siguiendo **Clean Architecture** con las siguientes capas:

```
┌─────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN                │
│   (Controllers, Routes, Views)              │
│   - Manejo de HTTP                          │
│   - Validación inicial                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         CAPA DE DOMINIO                     │
│   (Use Cases, DTOs, Entities, Interfaces)   │
│   - Lógica de negocio                       │
│   - Reglas de validación                    │
│   - Contratos (abstracciones)               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      CAPA DE INFRAESTRUCTURA                │
│   (Repositories, Datasources)               │
│   - Acceso a datos (Prisma)                 │
│   - Servicios externos                      │
│   - Implementaciones concretas              │
└─────────────────────────────────────────────┘
```

### Flujo de una Request

```
1. HTTP Request → Routes
2. Routes → Controller
3. Controller → DTO (Validación con Zod)
4. Controller → Use Case (Lógica de negocio)
5. Use Case → Repository (Abstracción)
6. Repository → Datasource (Prisma/BD)
7. Datasource → PostgreSQL
8. Retorno: PostgreSQL → ... → HTTP Response
```

---

## 💾 Base de Datos

### Modelos Implementados

#### 👤 User (Usuario)
```typescript
{
  id: string (UUID)
  username: string (único)
  email: string (único)
  emailVerified: boolean
  password: string (hasheada)
  firstName: string
  lastName: string
  phone: string | null
  role: "Administrador" | "Cajero"
  status: "Activo" | "Inactivo" | "Suspendido"
  createdAt: DateTime
  updatedAt: DateTime
  lastConnection: DateTime | null
}
```

#### 📦 Modelos Futuros (Schema ya definido)
- **Category**: Categorías de productos
- **Product**: Catálogo de productos
- **Customer**: Clientes
- **Order**: Órdenes de venta
- **OrderItem**: Items de órdenes
- **CashRegister**: Control de caja
- **StockMovement**: Movimientos de inventario
- **DailySalesReport**: Reportes diarios
- **ActivityLog**: Registro de actividades

### Relaciones Principales

```
User (1) ──┬──> (N) Orders
           ├──> (N) CashRegisters
           ├──> (N) StockMovements
           └──> (N) ActivityLogs

Category (1) ──> (N) Products

Product (1) ──┬──> (N) OrderItems
              └──> (N) StockMovements

Order (1) ──> (N) OrderItems
```

---

## 🔐 Autenticación

### Sistema de Autenticación JWT

El sistema utiliza **JSON Web Tokens (JWT)** para autenticación.

#### Flujo de Autenticación

```
1. Usuario → POST /api/auth/login
2. Backend valida credenciales
3. Backend genera JWT
4. Cliente recibe token
5. Cliente guarda token (localStorage/sessionStorage)
6. Cliente envía token en cada request:
   Header: Authorization: Bearer <token>
```

#### Estructura del Token JWT

```json
{
  "id": "uuid-del-usuario",
  "username": "juan123",
  "email": "juan@mail.com",
  "role": "Administrador",
  "iat": 1697123456,
  "exp": 1697209856
}
```

#### Expiración
- **Duración**: 24 horas (por defecto)
- **Refresh**: Próximamente

---

## 🛣️ Endpoints

### AUTH ENDPOINTS

Base path: `/api/auth`

---

#### 1️⃣ **POST** `/api/auth/register`
Registrar un nuevo usuario (solo admins - próximamente protegido).

**Request Body:**
```json
{
  "username": "juan123",
  "email": "juan@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "3001234567",
  "role": "Cajero",
  "status": "Activo"
}
```

**⚡ Contraseña Autogenerada (NUEVO):**

Si no se envía el campo `password`, el sistema **generará automáticamente** una contraseña siguiendo la política de la empresa:

**Política de generación:**
- Primeras 2 iniciales del **nombre** en minúsculas
- Primeras 2 iniciales del **apellido** en MAYÚSCULAS
- Año actual
- Carácter especial `@`

**Ejemplo:** Juan Carlos Pérez Gómez → `juPE2025@`

**Request Body sin contraseña (autogenerada):**
```json
{
  "username": "juan123",
  "email": "juan@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "3001234567",
  "role": "Cajero",
  "status": "Activo"
}
```
> ⚠️ **Nota:** En este caso, el sistema generará automáticamente la contraseña: `juPE2025@`

**Validaciones:**
- `username`: 3-20 caracteres, único
- `email`: formato válido, único
- `password` (OPCIONAL): 6-16 caracteres, debe incluir:
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 caracter especial (@$!%*?&)
- `firstName`: requerido, no vacío
- `lastName`: requerido, no vacío
- `phone`: requerido, no vacío
- `role`: "Administrador" | "Cajero"
- `status`: "Activo" | "Inactivo" | "Suspendido" (default: "Activo")

**Response 201:**
```json
{
  "user": {
    "id": "uuid",
    "username": "juan123",
    "email": "juan@example.com",
    "emailVerified": false,
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "3001234567",
    "role": "Cajero",
    "status": "Activo",
    "createdAt": "2024-10-12T10:30:00.000Z",
    "updatedAt": "2024-10-12T10:30:00.000Z",
    "lastConnection":"2024-10-12T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400:**
```json
{
  "error": "El email ya está registrado"
}
```
```json
{
  "error": "El username ya está en uso"
}
```

---

#### 2️⃣ **POST** `/api/auth/login`
Iniciar sesión y actualizar la última conexión del usuario.

**Request Body:**
```json
{
  "username": "juan123",
  "password": "Password123!"
}
```

**Validaciones:**
- `username`: requerido, no vacío
- `password`: 6-16 caracteres con formato válido

**🔄 Comportamiento Automático (NUEVO):**
Al iniciar sesión exitosamente, el sistema actualiza automáticamente el campo `lastConnection` con la fecha y hora actual del servidor.

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "username": "juan123",
    "email": "juan@example.com",
    "emailVerified": true,
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "3001234567",
    "role": "Cajero",
    "status": "Activo",
    "createdAt": "2024-10-12T10:30:00.000Z",
    "updatedAt": "2024-10-12T10:30:00.000Z",
    "lastConnection": "2024-10-16T14:25:30.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 400:**
```json
{
  "error": "Usuario o contraseña incorrectos"
}
```

**Response 403:**
```json
{
  "error": "Usuario inactivo o suspendido"
}
```

---

#### 3️⃣ **POST** `/api/auth/retry-verify-email`
Reenviar email de verificación.

**Request Body:**
```json
{
  "email": "juan@example.com"
}
```

**Response 200:**
```json
{
  "message": "Email de verificación enviado"
}
```

---

#### 4️⃣ **GET** `/api/auth/verify-email/:token`
Verificar email con token.

**URL Parameters:**
- `token`: JWT token de verificación

**Response 200:**
```json
{
  "message": "Email verificado correctamente"
}
```

**Response 400:**
```json
{
  "error": "Token inválido o expirado"
}
```

---

#### 5️⃣ **POST** `/api/auth/forgot-password`
Solicitar restablecimiento de contraseña.

**Request Body:**
```json
{
  "email": "juan@example.com"
}
```

**Response 200:**
```json
{
  "message": "Email de restablecimiento enviado"
}
```

**Response 404:**
```json
{
  "error": "Usuario no encontrado"
}
```

---

#### 6️⃣ **GET** `/api/auth/reset-password-page/:token`
Página HTML para restablecer contraseña (para email).

**URL Parameters:**
- `token`: JWT token de restablecimiento

**Response 200:** Página HTML con formulario

---

#### 7️⃣ **POST** `/api/auth/reset-password-submit`
Formulario HTML enviado desde el email.

_(Uso interno del formulario HTML)_

---

#### 8️⃣ **POST** `/api/auth/reset-password`
Restablecer contraseña (para frontend SPA).

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewPassword123!"
}
```

**Validaciones:**
- `token`: JWT válido
- `newPassword`: 6-16 caracteres con formato válido

**Response 200:**
```json
{
  "message": "Contraseña restablecida correctamente"
}
```

**Response 400:**
```json
{
  "error": "Token inválido o expirado"
}
```

---

### USERS ENDPOINTS

Base path: `/api/users`

---

#### 1️⃣ **GET** `/api/users`
Obtener todos los usuarios.

**Response 200:**
```json
{
  "users": [
    {
      "id": "uuid-1",
      "username": "juan123",
      "email": "juan@example.com",
      "emailVerified": true,
      "firstName": "Juan",
      "lastName": "Pérez",
      "phone": "3001234567",
      "role": "Cajero",
      "status": "Activo",
      "createdAt": "2024-10-12T10:30:00.000Z",
      "updatedAt": "2024-10-12T10:30:00.000Z",
      "lastConnection":"2024-10-12T10:30:00.000Z"
    },
    {
      "id": "uuid-2",
      "username": "maria456",
      "email": "maria@example.com",
      "emailVerified": true,
      "firstName": "María",
      "lastName": "García",
      "phone": "3007654321",
      "role": "Administrador",
      "status": "Activo",
      "createdAt": "2024-10-10T08:15:00.000Z",
      "updatedAt": "2024-10-11T14:20:00.000Z",
      "lastConnection":"2024-10-12T10:30:00.000Z"
    }
  ]
}
```

**Response 500:**
```json
{
  "error": "Internal server error"
}
```

---

#### 2️⃣ **GET** `/api/users/search`
Buscar usuarios con filtros y paginación avanzada.

**Query Parameters:**
- `search` (opcional): Busca en username, email, firstName, lastName (case-insensitive, búsqueda parcial)
- `role` (opcional): "Administrador" | "Cajero"
- `status` (opcional): "Activo" | "Inactivo" | "Suspendido"
- `page` (opcional): Número de página (default: 1, mínimo: 1)
- `limit` (opcional): Items por página (default: 10, mínimo: 1, máximo recomendado: 100)

**Ejemplos de URLs:**
```
GET /api/users/search?search=Juan
GET /api/users/search?role=Administrador
GET /api/users/search?status=Activo&page=2&limit=20
GET /api/users/search?search=juan&role=Cajero&status=Activo&page=1&limit=10
```

**📱 Cómo Consumir desde el Frontend:**

**Ejemplo 1: Búsqueda simple**
```typescript
// Buscar por texto
const searchUsers = async (searchTerm: string) => {
  const response = await fetch(
    `http://localhost:3000/api/users/search?search=${encodeURIComponent(searchTerm)}`
  );
  return await response.json();
};

// Uso
const result = await searchUsers('Juan');
console.log(result.users); // Array de usuarios
console.log(result.total); // Total de usuarios encontrados
```

**Ejemplo 2: Filtros combinados con paginación**
```typescript
interface SearchFilters {
  search?: string;
  role?: 'Administrador' | 'Cajero';
  status?: 'Activo' | 'Inactivo' | 'Suspendido';
  page?: number;
  limit?: number;
}

const searchUsersWithFilters = async (filters: SearchFilters) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(
    `http://localhost:3000/api/users/search?${params.toString()}`
  );
  return await response.json();
};

// Uso
const result = await searchUsersWithFilters({
  search: 'juan',
  role: 'Cajero',
  status: 'Activo',
  page: 2,
  limit: 20
});
```

**Ejemplo 3: Componente React con paginación**
```typescript
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    limit: 10
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await searchUsersWithFilters({ ...filters, page });
      setUsers(result.users);
      setTotalPages(result.totalPages);
    };
    fetchUsers();
  }, [page, filters]);

  return (
    <div>
      {/* Filtros */}
      <input 
        value={filters.search}
        onChange={(e) => setFilters({...filters, search: e.target.value})}
        placeholder="Buscar usuario..."
      />
      
      {/* Lista de usuarios */}
      {users.map(user => <UserCard key={user.id} user={user} />)}
      
      {/* Paginación */}
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
        Siguiente
      </button>
    </div>
  );
};
```

**Response 200:**
```json
{
  "users": [
    {
      "id": "uuid-1",
      "username": "juan123",
      "email": "juan@example.com",
      "emailVerified": true,
      "firstName": "Juan",
      "lastName": "Pérez",
      "phone": "3001234567",
      "role": "Cajero",
      "status": "Activo",
      "createdAt": "2024-10-12T10:30:00.000Z",
      "updatedAt": "2024-10-12T10:30:00.000Z",
      "lastConnection": "2024-10-16T14:25:30.000Z"
    }
  ],
  "total": 156,
  "page": 2,
  "limit": 20,
  "totalPages": 8
}
```

**💡 Explicación de la Respuesta:**
- `users`: Array con los usuarios de la página actual
- `total`: Número total de usuarios que coinciden con los filtros
- `page`: Página actual
- `limit`: Cantidad de usuarios por página
- `totalPages`: Total de páginas disponibles (calculado: `Math.ceil(total / limit)`)

**Response 400:**
```json
{
  "error": "Rol inválido"
}
```

**Validaciones:**
- `search`: string opcional (insensitive, busca parcial)
- `role`: debe ser "Administrador" o "Cajero"
- `status`: debe ser "Activo", "Inactivo" o "Suspendido"
- `page`: número entero positivo
- `limit`: número entero positivo

---

#### 3️⃣ **GET** `/api/users/search/by-email`
Buscar usuario por email.

**Query Parameters:**
- `email` (requerido): Email del usuario

**Ejemplo:**
```
GET /api/users/search/by-email?email=juan@example.com
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "username": "juan123",
    "email": "juan@example.com",
    "emailVerified": true,
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "3001234567",
    "role": "Cajero",
    "status": "Activo",
    "createdAt": "2024-10-12T10:30:00.000Z",
    "updatedAt": "2024-10-12T10:30:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "error": "User not found"
}
```

**Response 400:**
```json
{
  "error": "Email inválido"
}
```

---

#### 4️⃣ **GET** `/api/users/:id`
Obtener usuario por ID.

**URL Parameters:**
- `id`: UUID del usuario

**Ejemplo:**
```
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

**Response 200:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "juan123",
    "email": "juan@example.com",
    "emailVerified": true,
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "3001234567",
    "role": "Cajero",
    "status": "Activo",
    "createdAt": "2024-10-12T10:30:00.000Z",
    "updatedAt": "2024-10-12T10:30:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "error": "User not found"
}
```

**Response 400:**
```json
{
  "error": "Id inválido"
}
```

---

#### 5️⃣ **PATCH** `/api/users/:id`
Actualizar usuario.

**URL Parameters:**
- `id`: UUID del usuario

**Request Body (todos los campos son opcionales):**
```json
{
  "username": "juan123_updated",
  "email": "juan_new@example.com",
  "emailVerified": true,
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "phone": "3009876543",
  "role": "Administrador",
  "status": "Suspendido",
  "password": "NewPassword123!"
}
```

**Validaciones:**
- `username`: mínimo 1 carácter (si se envía)
- `email`: formato válido (si se envía)
- `emailVerified`: booleano (si se envía)
- `firstName`: mínimo 1 carácter (si se envía)
- `lastName`: mínimo 1 carácter (si se envía)
- `phone`: mínimo 1 carácter (si se envía)
- `role`: "Administrador" | "Cajero" (si se envía)
- `status`: "Activo" | "Inactivo" | "Suspendido" (si se envía)
- `password`: mínimo 1 carácter (si se envía, será hasheada)

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "username": "juan123_updated",
    "email": "juan_new@example.com",
    "emailVerified": true,
    "firstName": "Juan Carlos",
    "lastName": "Pérez López",
    "phone": "3009876543",
    "role": "Administrador",
    "status": "Suspendido",
    "createdAt": "2024-10-12T10:30:00.000Z",
    "updatedAt": "2024-10-12T15:45:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "error": "User not found"
}
```

**Response 400:**
```json
{
  "error": "Id inválido"
}
```

---

#### 6️⃣ **DELETE** `/api/users/:id`
Eliminar usuario.

**URL Parameters:**
- `id`: UUID del usuario

**Ejemplo:**
```
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
```

**Response 200:**
```json
{
  "message": "Usuario eliminado exitosamente",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "juan123",
    "email": "juan@example.com",
    "emailVerified": true,
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "3001234567",
    "role": "Cajero",
    "status": "Activo",
    "createdAt": "2024-10-12T10:30:00.000Z",
    "updatedAt": "2024-10-12T10:30:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "error": "User not found"
}
```

**Response 400:**
```json
{
  "error": "Id user not found"
}
```

---

### STOCK MOVEMENTS ENDPOINTS

Base path: `/api/stock-movements`

---

#### 📦 **Contexto del Negocio**

Este sistema está diseñado para una **empresa boliviana de productos derivados de pollo** (Coquito):

- 🏭 **Fábrica:** Yacuiba, Bolivia (producción)
- 🏪 **Tienda:** Tarija, Bolivia (punto de venta)
- 🔗 **Modelo:** La fábrica reabastece continuamente la tienda (misma empresa)
- 🍗 **Productos:** Piernas, pechuga, alas, hígados, menudencias, costillas, pollo entero, etc.
- 💰 **Moneda:** Bolivianos (Bs.)

#### 🔄 **Tipos de Movimientos de Stock**

El sistema maneja 6 tipos de movimientos:

| Tipo | Efecto | Descripción | Ejemplo |
|------|--------|-------------|---------|
| **Reabastecimiento** | ➕ Aumenta | Transferencia desde fábrica (Yacuiba) a tienda (Tarija) | +50 kg de piernas desde fábrica |
| **Compra** | ➕ Aumenta | Compra a proveedores EXTERNOS (insumos) | +100 bolsas de empaque |
| **Venta** | ➖ Disminuye | Venta a clientes finales o mayoristas | -15 kg vendidos a restaurante |
| **Ajuste** | ➕➖ Ambos | Corrección de inventario físico | +3 kg encontrados / -2 kg faltantes |
| **Devolución** | ➕ Aumenta | Cliente devuelve producto | +2 kg devueltos por mal estado |
| **Dañado** | ➖ Disminuye | Producto dado de baja (vencido, dañado) | -1 kg descartado por vencimiento |

#### 📋 **Campos del Movimiento**

```typescript
{
  id: string;              // UUID único del movimiento
  productId: string;       // ID del producto afectado
  userId: string;          // ID del usuario que registró el movimiento
  type: StockMovementType; // Tipo de movimiento
  quantity: number;        // Cantidad del movimiento (+ o -)
  previousStock: number;   // Stock antes del movimiento
  newStock: number;        // Stock después del movimiento
  reason?: string;         // Razón legible del movimiento
  reference?: string;      // Referencia externa (factura, orden, etc.)
  notes?: string;          // Notas adicionales
  createdAt: DateTime;     // Fecha y hora del movimiento
}
```

---

#### 1️⃣ **POST** `/api/stock-movements`
Crear un nuevo movimiento de stock.

**📝 Comportamiento Automático:**
- Calcula automáticamente `previousStock` y `newStock` basándose en el stock actual del producto
- Actualiza el stock del producto automáticamente
- Valida que el nuevo stock no sea negativo
- Todo se ejecuta en una transacción (rollback si falla)

**Request Body:**
```json
{
  "productId": "uuid-del-producto",
  "userId": "uuid-del-usuario",
  "type": "Reabastecimiento",
  "quantity": 50,
  "reason": "Reabastecimiento desde fábrica Yacuiba",
  "reference": "TRANSF-2025-045",
  "notes": "Llegó en refrigerado. Temperatura OK: 2°C"
}
```

**Validaciones:**
- `productId`: UUID válido (el producto debe existir)
- `userId`: UUID válido (el usuario debe existir)
- `type`: Debe ser uno de: "Reabastecimiento", "Compra", "Venta", "Ajuste", "Devolucion", "Dañado"
- `quantity`: Número entero diferente de 0 (puede ser positivo o negativo)
- `reason`: Opcional, máximo 500 caracteres
- `reference`: Opcional, máximo 100 caracteres
- `notes`: Opcional, máximo 1000 caracteres

**⚠️ Importante sobre `quantity`:**
- Para aumentar stock: usar número positivo (ej: `50`)
- Para disminuir stock: usar número negativo (ej: `-15`)
- El sistema valida que el stock no quede negativo

**Ejemplos de Request Body:**

**Ejemplo 1: Reabastecimiento desde fábrica**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "admin-uuid",
  "type": "Reabastecimiento",
  "quantity": 100,
  "reason": "Reabastecimiento desde fábrica Yacuiba",
  "reference": "TRANSF-2025-045",
  "notes": "Camión salió 6:00 AM, llegó 2:00 PM. Temperatura: 1°C"
}
```

**Ejemplo 2: Venta a cliente**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "cajero-uuid",
  "type": "Venta",
  "quantity": -15,
  "reason": "Venta a restaurante El Sabor",
  "reference": "ORD-2025-200"
}
```

**Ejemplo 3: Producto vencido**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "admin-uuid",
  "type": "Dañado",
  "quantity": -3,
  "reason": "Producto vencido - Descarte",
  "reference": "INC-2025-010",
  "notes": "Fecha vencimiento: 20/10/2025. Se descartó según protocolo."
}
```

**Response 201:**
```json
{
  "message": "Movimiento de stock registrado exitosamente",
  "movement": {
    "id": "mov-uuid",
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "admin-uuid",
    "type": "Reabastecimiento",
    "quantity": 100,
    "previousStock": 7,
    "newStock": 107,
    "reason": "Reabastecimiento desde fábrica Yacuiba",
    "reference": "TRANSF-2025-045",
    "notes": "Camión salió 6:00 AM, llegó 2:00 PM. Temperatura: 1°C",
    "createdAt": "2025-10-18T14:30:00.000Z",
    "user": {
      "id": "admin-uuid",
      "username": "admin",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "product": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Piernas de Pollo (1kg)",
      "stock": 107,
      "category": {
        "name": "Trozos de Pollo"
      }
    }
  }
}
```

**Response 400:**
```json
{
  "error": "No se puede realizar el movimiento. Stock insuficiente. Stock actual: 5, Cantidad solicitada: 10"
}
```

**Response 404:**
```json
{
  "error": "Producto no encontrado"
}
```
```json
{
  "error": "Usuario no encontrado"
}
```

---

#### 2️⃣ **GET** `/api/stock-movements/:id`
Obtener un movimiento de stock por ID.

**URL Parameters:**
- `id`: UUID del movimiento

**Ejemplo:**
```
GET /api/stock-movements/mov-550e8400-e29b-41d4-a716-446655440000
```

**Response 200:**
```json
{
  "movement": {
    "id": "mov-550e8400-e29b-41d4-a716-446655440000",
    "productId": "prod-uuid",
    "userId": "user-uuid",
    "type": "Reabastecimiento",
    "quantity": 100,
    "previousStock": 7,
    "newStock": 107,
    "reason": "Reabastecimiento desde fábrica Yacuiba",
    "reference": "TRANSF-2025-045",
    "notes": "Temperatura OK",
    "createdAt": "2025-10-18T14:30:00.000Z",
    "user": {
      "id": "user-uuid",
      "username": "admin",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "product": {
      "id": "prod-uuid",
      "name": "Piernas de Pollo (1kg)",
      "stock": 107,
      "price": 25.50
    }
  }
}
```

**Response 404:**
```json
{
  "error": "Movimiento de stock no encontrado"
}
```

---

#### 3️⃣ **GET** `/api/stock-movements/search`
Buscar movimientos de stock con filtros avanzados.

**Query Parameters:**
- `productId` (opcional): UUID del producto
- `userId` (opcional): UUID del usuario
- `type` (opcional): Tipo de movimiento
- `startDate` (opcional): Fecha inicio (ISO 8601)
- `endDate` (opcional): Fecha fin (ISO 8601)
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, máx: 100)

**Ejemplos de URLs:**
```
GET /api/stock-movements/search?type=Reabastecimiento
GET /api/stock-movements/search?productId=prod-uuid&page=1&limit=20
GET /api/stock-movements/search?userId=user-uuid&type=Venta
GET /api/stock-movements/search?startDate=2025-10-01T00:00:00Z&endDate=2025-10-31T23:59:59Z
GET /api/stock-movements/search?type=Dañado&page=1&limit=50
```

**📱 Ejemplo Frontend:**
```typescript
const searchMovements = async (filters: {
  productId?: string;
  userId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.type) params.append('type', filters.type);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(
    `http://localhost:3000/api/stock-movements/search?${params.toString()}`
  );
  return await response.json();
};

// Uso: Buscar reabastecimientos del último mes
const result = await searchMovements({
  type: 'Reabastecimiento',
  startDate: '2025-10-01T00:00:00Z',
  endDate: '2025-10-31T23:59:59Z',
  page: 1,
  limit: 20
});
```

**Response 200:**
```json
{
  "movements": [
    {
      "id": "mov-1",
      "type": "Reabastecimiento",
      "quantity": 100,
      "previousStock": 7,
      "newStock": 107,
      "reason": "Reabastecimiento desde fábrica Yacuiba",
      "reference": "TRANSF-2025-045",
      "createdAt": "2025-10-18T14:30:00.000Z",
      "user": {
        "username": "admin",
        "firstName": "Juan"
      },
      "product": {
        "name": "Piernas de Pollo (1kg)",
        "stock": 107
      }
    },
    {
      "id": "mov-2",
      "type": "Venta",
      "quantity": -15,
      "previousStock": 107,
      "newStock": 92,
      "reason": "Venta a restaurante",
      "reference": "ORD-2025-200",
      "createdAt": "2025-10-18T16:00:00.000Z",
      "user": {
        "username": "cajero1"
      },
      "product": {
        "name": "Piernas de Pollo (1kg)"
      }
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

#### 4️⃣ **GET** `/api/stock-movements/product/:productId`
Obtener historial completo de movimientos de un producto específico.

**URL Parameters:**
- `productId`: UUID del producto

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20, máx: 100)

**Ejemplo:**
```
GET /api/stock-movements/product/550e8400-e29b-41d4-a716-446655440000?page=1&limit=20
```

**📱 Ejemplo Frontend:**
```typescript
const getProductHistory = async (productId: string, page = 1, limit = 20) => {
  const response = await fetch(
    `http://localhost:3000/api/stock-movements/product/${productId}?page=${page}&limit=${limit}`
  );
  return await response.json();
};

// Uso: Ver historial de un producto
const history = await getProductHistory('550e8400-e29b-41d4-a716-446655440000');
console.log(history.movements); // Array de movimientos
console.log(history.total);     // Total de movimientos del producto
```

**Response 200:**
```json
{
  "movements": [
    {
      "id": "mov-6",
      "type": "Reabastecimiento",
      "quantity": 100,
      "previousStock": 5,
      "newStock": 105,
      "reason": "Reabastecimiento urgente desde fábrica",
      "reference": "TRANSF-2025-048",
      "createdAt": "2025-10-18T08:00:00.000Z",
      "user": {
        "username": "admin",
        "firstName": "Juan"
      }
    },
    {
      "id": "mov-5",
      "type": "Venta",
      "quantity": -8,
      "previousStock": 13,
      "newStock": 5,
      "reason": "Venta a cliente final",
      "reference": "ORD-2025-175",
      "createdAt": "2025-10-17T15:30:00.000Z",
      "user": {
        "username": "cajero1"
      }
    },
    {
      "id": "mov-4",
      "type": "Dañado",
      "quantity": -2,
      "previousStock": 15,
      "newStock": 13,
      "reason": "Producto vencido",
      "reference": "INC-2025-008",
      "notes": "Fecha vencimiento: 17/10/2025",
      "createdAt": "2025-10-17T10:00:00.000Z",
      "user": {
        "username": "admin"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Response 404:**
```json
{
  "error": "Producto no encontrado"
}
```

---

### 🔄 **Flujo Completo: Ejemplo Real**

#### **Escenario:** Producto "Piernas de Pollo (1kg)" - Stock bajo → Reabastecimiento

**1. Estado inicial del producto:**
```json
{
  "id": "prod-123",
  "name": "Piernas de Pollo (1kg)",
  "stock": 7,
  "minStock": 10,
  "price": 25.50
}
```
⚠️ **ALERTA:** `stock (7) <= minStock (10)` → Stock bajo detectado

**2. Frontend detecta stock bajo:**
```typescript
// Buscar productos con stock bajo
const lowStockProducts = products.filter(p => p.stock <= p.minStock);
```

**3. Llega reabastecimiento desde fábrica Yacuiba:**
```typescript
const response = await fetch('http://localhost:3000/api/stock-movements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'prod-123',
    userId: 'admin-uuid',
    type: 'Reabastecimiento',
    quantity: 100,
    reason: 'Reabastecimiento desde fábrica Yacuiba',
    reference: 'TRANSF-2025-045',
    notes: 'Llegó en refrigerado. Temp: 1°C OK'
  })
});
```

**4. Backend procesa (automáticamente):**
```javascript
// El backend hace esto automáticamente:
- Obtiene stock actual: 7 kg
- Calcula previousStock: 7
- Calcula newStock: 7 + 100 = 107
- Actualiza producto.stock = 107
- Registra el movimiento
- Todo en transacción (rollback si falla)
```

**5. Respuesta exitosa:**
```json
{
  "message": "Movimiento de stock registrado exitosamente",
  "movement": {
    "id": "mov-new",
    "quantity": 100,
    "previousStock": 7,
    "newStock": 107,
    "createdAt": "2025-10-18T14:30:00.000Z"
  }
}
```

**6. Ver historial del producto:**
```typescript
const history = await fetch(
  'http://localhost:3000/api/stock-movements/product/prod-123'
);
// Retorna todos los movimientos del producto ordenados por fecha
```

---

### 📊 **Modelo de Datos: StockMovementEntity**

```typescript
interface StockMovementEntity {
  id: string;                    // UUID
  productId: string;             // UUID del producto
  userId: string;                // UUID del usuario
  type: StockMovementType;       // Tipo de movimiento
  quantity: number;              // Cantidad (+ o -)
  previousStock: number;         // Stock antes
  newStock: number;              // Stock después
  reason: string | null;         // Razón legible
  reference: string | null;      // Referencia externa
  notes: string | null;          // Notas adicionales
  createdAt: Date;               // Fecha y hora
  user?: UserEntity;             // Usuario (populate)
  product?: ProductEntity;       // Producto (populate)
}
```

### 🎯 **Casos de Uso Comunes**

**Caso 1: Reabastecimiento programado desde fábrica**
```typescript
{
  type: "Reabastecimiento",
  quantity: 150,
  reason: "Reabastecimiento semanal desde fábrica Yacuiba",
  reference: "TRANSF-2025-W42"
}
```

**Caso 2: Venta mayorista a restaurante**
```typescript
{
  type: "Venta",
  quantity: -50,
  reason: "Venta mayorista a Restaurante Los Hermanos",
  reference: "ORD-2025-300"
}
```

**Caso 3: Ajuste por inventario físico**
```typescript
{
  type: "Ajuste",
  quantity: -5,
  reason: "Ajuste por inventario físico - Faltante detectado",
  reference: "INV-2025-OCT",
  notes: "Realizado conteo manual. Faltan 5 kg."
}
```

**Caso 4: Producto vencido**
```typescript
{
  type: "Dañado",
  quantity: -3,
  reason: "Producto vencido - Descarte según protocolo",
  reference: "INC-2025-020",
  notes: "Fecha vencimiento: 18/10/2025. Descartado en presencia de supervisor."
}
```

**Caso 5: Devolución de cliente**
```typescript
{
  type: "Devolucion",
  quantity: 2,
  reason: "Devolución cliente - Producto con olor extraño",
  reference: "ORD-2025-285",
  notes: "Se procesó reembolso. Producto va a análisis de calidad."
}
```

---

### 💡 **Diferencia Clave: Reabastecimiento vs Compra**

| Aspecto | Reabastecimiento | Compra |
|---------|------------------|--------|
| **Origen** | Fábrica propia (Yacuiba) | Proveedor externo |
| **Empresa** | Misma empresa | Empresa diferente |
| **Factura** | Guía de remisión interna | Factura de proveedor |
| **Reference** | `TRANSF-2025-045` | `FAC-PROVEEDOR-2025-100` |
| **Ejemplo** | 100 kg de piernas desde tu fábrica | Comprar 500 bolsas de empaque a proveedor externo |

**❌ Incorrecto:**
```json
{
  "type": "Compra",  // ❌ Error
  "reason": "Llegaron piernas desde nuestra fábrica Yacuiba"
}
```

**✅ Correcto:**
```json
{
  "type": "Reabastecimiento",  // ✅ Correcto
  "reason": "Reabastecimiento desde fábrica Yacuiba"
}
```

---

## 📊 Modelos de Datos

### UserEntity

```typescript
interface UserEntity {
  id: string;                    // UUID
  username: string;              // Único
  email: string;                 // Único
  emailVerified: boolean;        // Estado de verificación
  password: string;              // Hash bcrypt (NO enviar al frontend)
  firstName: string;             // Nombre
  lastName: string;              // Apellido
  phone: string | null;          // Teléfono opcional
  role: "Administrador" | "Cajero";
  status: "Activo" | "Inactivo" | "Suspendido";
  createdAt: Date;               // Fecha de creación
  updatedAt: Date | null;        // Fecha de última actualización
  lastConnection: Date | null;   // Última conexión del usuario (NUEVO)
}
```

**💡 Notas sobre `lastConnection`:**
- Se actualiza automáticamente cada vez que el usuario inicia sesión
- Es `null` si el usuario nunca ha iniciado sesión
- Útil para reportes de actividad y auditoría

### Roles y Permisos

| Rol            | Permisos                                                      |
|----------------|---------------------------------------------------------------|
| **Administrador** | - Gestionar usuarios (CRUD completo)                       |
|                | - Gestionar productos y categorías                           |
|                | - Ver todos los reportes                                      |
|                | - Gestionar órdenes                                           |
|                | - Realizar cierre de caja                                     |
| **Cajero**     | - Crear y ver órdenes                                         |
|                | - Ver catálogo de productos                                   |
|                | - Cerrar su propia caja                                       |
|                | - NO puede gestionar usuarios                                 |
|                | - NO puede gestionar categorías                               |

### Status de Usuario

- **Activo**: Usuario puede iniciar sesión y operar normalmente
- **Inactivo**: Usuario temporalmente deshabilitado
- **Suspendido**: Usuario bloqueado, no puede iniciar sesión

---

## 📡 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente (registro) |
| **400** | Bad Request | Error de validación o datos inválidos |
| **401** | Unauthorized | No autenticado (token inválido/faltante) |
| **403** | Forbidden | No autorizado (sin permisos) |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto (email/username duplicado) |
| **500** | Internal Server Error | Error del servidor |

---

## ⚠️ Manejo de Errores

### Formato de Errores

Todos los errores siguen este formato:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

### Tipos de Errores Comunes

#### Errores de Validación (400)
```json
{
  "error": "Email inválido"
}
```
```json
{
  "error": "Contraseña debe tener al menos 6 caracteres"
}
```
```json
{
  "error": "Rol inválido"
}
```

#### Errores de Conflicto (400/409)
```json
{
  "error": "El email ya está registrado"
}
```
```json
{
  "error": "El username ya está en uso"
}
```

#### Errores de Autenticación (400/401)
```json
{
  "error": "Usuario o contraseña incorrectos"
}
```
```json
{
  "error": "Token inválido o expirado"
}
```

#### Errores de Autorización (403)
```json
{
  "error": "Usuario inactivo o suspendido"
}
```
```json
{
  "error": "No tienes permisos para realizar esta acción"
}
```

#### Errores de Recurso No Encontrado (404)
```json
{
  "error": "User not found"
}
```
```json
{
  "error": "Usuario no encontrado"
}
```

#### Errores del Servidor (500)
```json
{
  "error": "Internal server error"
}
```

---

## 🔄 Ejemplos de Integración Frontend

### 1. Registro de Usuario

**Opción A: Con contraseña personalizada**
```typescript
// services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const registerUser = async (userData: {
  username: string;
  email: string;
  password?: string; // AHORA ES OPCIONAL
  firstName: string;
  lastName: string;
  phone: string;
  role: 'Administrador' | 'Cajero';
  status?: 'Activo' | 'Inactivo' | 'Suspendido';
}) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    // Guardar token
    localStorage.setItem('token', response.data.token);
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrar usuario'
      };
    }
    return {
      success: false,
      error: 'Error desconocido'
    };
  }
};
```

**Opción B: Con contraseña autogenerada (NUEVO)**
```typescript
// Ejemplo de uso con contraseña autogenerada
const createUser = async () => {
  const result = await registerUser({
    username: 'juan123',
    email: 'juan@example.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '3001234567',
    role: 'Cajero'
    // ⚡ NO se envía password, el backend generará: juPE2025@
  });
  
  if (result.success) {
    console.log('Usuario creado con contraseña autogenerada');
    console.log('Contraseña generada: juPE2025@');
  }
};
```

**Opción C: Con contraseña personalizada**
```typescript
// Ejemplo de uso con contraseña personalizada
const createUserWithPassword = async () => {
  const result = await registerUser({
    username: 'maria456',
    email: 'maria@example.com',
    password: 'MiPassword123!', // ✅ Contraseña personalizada
    firstName: 'María',
    lastName: 'García',
    phone: '3007654321',
    role: 'Administrador'
  });
  
  if (result.success) {
    console.log('Usuario creado con contraseña personalizada');
  }
};
```

### 2. Login

```typescript
// services/authService.ts
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    
    // Guardar token y usuario
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // 🆕 El campo lastConnection se actualiza automáticamente en el backend
    console.log('Última conexión:', response.data.user.lastConnection);
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
    return {
      success: false,
      error: 'Error desconocido'
    };
  }
};
```

**💡 Ejemplo de uso en componente React:**
```typescript
const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(username, password);
    
    if (result.success) {
      // Mostrar última conexión
      if (result.user.lastConnection) {
        const lastLogin = new Date(result.user.lastConnection);
        console.log(`Última conexión: ${lastLogin.toLocaleString()}`);
      } else {
        console.log('Primera vez que inicia sesión');
      }
      
      // Redirigir al dashboard
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuario"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};
```

### 3. Buscar Usuarios con Filtros y Paginación


  default : 
  public readonly search?: SearchUsersSchema["search"],
  public readonly role?: SearchUsersSchema["role"],
  public readonly status?: SearchUsersSchema["status"],
  public readonly page: SearchUsersSchema["page"] = 1,
  public readonly limit: SearchUsersSchema["limit"] = 10

```typescript
// services/userService.ts
export const searchUsers = async (params: {
  search?: string;
  role?: 'Administrador' | 'Cajero';
  status?: 'Activo' | 'Inactivo' | 'Suspendido';
  page?: number;
  limit?: number;
}) => {
  try {
    // Construir query params
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await axios.get(
      `${API_URL}/users/search?${queryParams.toString()}`
    );
    
    return {
      success: true,
      data: response.data // { users, total, page, limit, totalPages }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al buscar usuarios'
      };
    }
    return {
      success: false,
      error: 'Error desconocido'
    };
  }
};
```

**📋 Ejemplo Completo: Tabla de Usuarios con Búsqueda y Paginación**

```typescript
// components/UsersTable.tsx
import { useState, useEffect } from 'react';
import { searchUsers } from '../services/userService';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastConnection: string | null;
}

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Estados de paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    
    const result = await searchUsers({
      search: searchTerm || undefined,
      role: roleFilter as any || undefined,
      status: statusFilter as any || undefined,
      page,
      limit
    });

    if (result.success && result.data) {
      setUsers(result.data.users);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    }
    
    setLoading(false);
  };

  // Cargar usuarios cuando cambien los filtros o la página
  useEffect(() => {
    loadUsers();
  }, [page, limit, searchTerm, roleFilter, statusFilter]);

  // Reiniciar a la página 1 cuando cambien los filtros
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  return (
    <div className="users-table-container">
      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Cajero">Cajero</option>
        </select>
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Suspendido">Suspendido</option>
        </select>
      </div>

      {/* Información de resultados */}
      <div className="results-info">
        <p>Mostrando {users.length} de {total} usuarios</p>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Última Conexión</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  {user.lastConnection 
                    ? new Date(user.lastConnection).toLocaleString()
                    : 'Nunca'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <div className="pagination">
        <button 
          onClick={() => setPage(1)} 
          disabled={page === 1}
        >
          ⏮ Primera
        </button>
        
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 1}
        >
          ← Anterior
        </button>
        
        <span>
          Página {page} de {totalPages}
        </span>
        
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages}
        >
          Siguiente →
        </button>
        
        <button 
          onClick={() => setPage(totalPages)} 
          disabled={page === totalPages}
        >
          Última ⏭
        </button>
      </div>
    </div>
  );
};

export default UsersTable;
```

### 4. Actualizar Usuario

```typescript
// services/userService.ts
export const updateUser = async (
  userId: string, 
  updates: Partial<{
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'Administrador' | 'Cajero';
    status: 'Activo' | 'Inactivo' | 'Suspendido';
    password: string;
  }>
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/users/${userId}`,
      updates
    );
    
    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar usuario'
      };
    }
    return {
      success: false,
      error: 'Error desconocido'
    };
  }
};
```

**💡 Ejemplos de Uso:**

**A. Actualizar solo el estado del usuario**
```typescript
const suspendUser = async (userId: string) => {
  const result = await updateUser(userId, {
    status: 'Suspendido'
  });
  
  if (result.success) {
    console.log('Usuario suspendido correctamente');
  }
};
```

**B. Actualizar múltiples campos**
```typescript
const updateUserProfile = async (userId: string) => {
  const result = await updateUser(userId, {
    firstName: 'Juan Carlos',
    lastName: 'Pérez López',
    phone: '3009876543',
    role: 'Administrador'
  });
  
  if (result.success) {
    console.log('Perfil actualizado:', result.user);
  }
};
```

**C. Cambiar contraseña**
```typescript
const changePassword = async (userId: string, newPassword: string) => {
  const result = await updateUser(userId, {
    password: newPassword
  });
  
  if (result.success) {
    console.log('Contraseña actualizada');
  }
};
```

**📋 Ejemplo de Formulario de Edición:**
```typescript
const EditUserForm = ({ user }: { user: User }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    status: user.status
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateUser(user.id, formData);
    
    if (result.success) {
      alert('Usuario actualizado correctamente');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.firstName}
        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        placeholder="Nombre"
      />
      <input
        value={formData.lastName}
        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        placeholder="Apellido"
      />
      <input
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        placeholder="Teléfono"
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value as any})}
      >
        <option value="Administrador">Administrador</option>
        <option value="Cajero">Cajero</option>
      </select>
      <select
        value={formData.status}
        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
      >
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
        <option value="Suspendido">Suspendido</option>
      </select>
      <button type="submit">Guardar Cambios</button>
    </form>
  );
};
```

### 5. Eliminar Usuario

```typescript
// services/userService.ts
export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    
    return {
      success: true,
      message: response.data.message,
      user: response.data.user
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar usuario'
      };
    }
    return {
      success: false,
      error: 'Error desconocido'
    };
  }
};
```

**⚠️ Ejemplo con Confirmación:**
```typescript
const handleDeleteUser = async (userId: string, username: string) => {
  // Confirmar antes de eliminar
  const confirmed = window.confirm(
    `¿Estás seguro de eliminar al usuario "${username}"? Esta acción no se puede deshacer.`
  );
  
  if (!confirmed) return;
  
  const result = await deleteUser(userId);
  
  if (result.success) {
    alert(`Usuario "${result.user.username}" eliminado correctamente`);
    // Recargar la lista de usuarios
    loadUsers();
  } else {
    alert(`Error: ${result.error}`);
  }
};
```

**📋 Ejemplo en Componente:**
```typescript
const UserActions = ({ user }: { user: User }) => {
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `¿Eliminar usuario ${user.username}?`
    );
    
    if (confirmed) {
      const result = await deleteUser(user.id);
      if (result.success) {
        // Notificar éxito y actualizar lista
        console.log('Usuario eliminado');
      }
    }
  };

  return (
    <div className="user-actions">
      <button onClick={() => editUser(user)}>✏️ Editar</button>
      <button onClick={handleDelete} className="danger">🗑️ Eliminar</button>
    </div>
  );
};
```

### 6. Configuración de Axios con Interceptors (Recomendado)

```typescript
// config/axios.config.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores global
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## 🧪 Testing con Postman/Thunder Client

### Colección de Pruebas

#### 1. Registro
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "3001234567",
  "role": "Cajero",
  "status": "Activo"
}
```

#### 2. Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test123!"
}
```

#### 3. Buscar Usuarios
```http
GET http://localhost:3000/api/users/search?search=test&page=1&limit=10
```

#### 4. Obtener Usuario por ID
```http
GET http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000
```

#### 5. Actualizar Usuario
```http
PATCH http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "firstName": "Test Updated",
  "status": "Suspendido"
}
```

#### 6. Eliminar Usuario
```http
DELETE http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000
```

---

## 📝 Notas Importantes

### Seguridad
1. **Passwords**: Nunca se devuelven en las respuestas (están hasheadas)
2. **Tokens**: Expiran en 24 horas
3. **CORS**: Configurado para desarrollo (ajustar en producción)
4. **Validación**: Doble capa (Zod + lógica de negocio)

### Paginación
- **Default**: 10 items por página
- **Máximo recomendado**: 100 items por página
- **Formato**: Siempre incluye `total`, `page`, `limit`, `totalPages`

**💡 Cálculo de Paginación:**
```typescript
// Ejemplo de cómo calcular páginas
const totalPages = Math.ceil(total / limit);
const hasNextPage = page < totalPages;
const hasPreviousPage = page > 1;
const startIndex = (page - 1) * limit + 1;
const endIndex = Math.min(page * limit, total);

console.log(`Mostrando ${startIndex} a ${endIndex} de ${total} resultados`);
```

### Timestamps
- Todas las fechas están en formato ISO 8601 UTC
- Ejemplo: `"2024-10-12T10:30:00.000Z"`

### UUIDs
- Todos los IDs son UUID v4
- Ejemplo: `"550e8400-e29b-41d4-a716-446655440000"`

---

## 🚀 Próximas Implementaciones

- [ ] Middleware de autenticación JWT
- [ ] Control de acceso basado en roles (RBAC)
- [ ] Endpoints de productos y categorías
- [ ] Endpoints de órdenes y ventas
- [ ] Endpoints de caja y cierres
- [ ] Endpoints de reportes y métricas
- [ ] WebSockets para notificaciones en tiempo real
- [ ] Rate limiting y throttling
- [ ] Logs de auditoría completos (ActivityLog)
- [ ] Upload de imágenes (productos, usuarios)
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Backup automático de base de datos
- [ ] Dashboard de métricas en tiempo real

---

## 📞 Soporte

Para dudas o problemas con la API:
- **Repositorio**: [GitHub - Backend Coquito]
- **Desarrollador**: [Tu Nombre]
- **Email**: [Tu Email]

---

---

## 📖 Guía Rápida de Integración

### Para Desarrolladores Frontend

**1. Instalación de Dependencias**
```bash
npm install axios
# o
npm install @tanstack/react-query axios
```

**2. Configuración Base**
```typescript
// src/config/api.ts
export const API_URL = 'http://localhost:3000/api';

// Interfaces globales
export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'Administrador' | 'Cajero';
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  createdAt: string;
  updatedAt: string;
  lastConnection: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**3. Flujo Completo de Autenticación**
```typescript
// 1. Login
const { user, token } = await login('juan123', 'Password123!');

// 2. Guardar datos
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// 3. Verificar última conexión
if (user.lastConnection) {
  const lastLogin = new Date(user.lastConnection);
  console.log(`Última sesión: ${lastLogin.toLocaleString()}`);
}

// 4. Configurar axios con token
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 5. Navegar al dashboard
router.push('/dashboard');
```

**4. Patrones Recomendados**

**Patrón A: Custom Hooks (React)**
```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react';

export const useUsers = (filters?: SearchFilters) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const result = await searchUsers(filters);
      if (result.success) {
        setUsers(result.data.users);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [filters]);

  return { users, loading, error };
};
```

**Patrón B: TanStack Query (Recomendado)**
```typescript
// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';

export const useUsers = (filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => searchUsers(filters),
  });
};

// Uso en componente
const UsersList = () => {
  const { data, isLoading, error } = useUsers({ status: 'Activo' });
  
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data?.users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
};
```

---

## 🔍 Búsqueda y Filtrado Avanzado

### Estrategias de Búsqueda

**1. Búsqueda en Tiempo Real (Debounced)**
```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const UsersSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    // Se ejecuta solo después de 500ms de inactividad
    if (debouncedSearch) {
      searchUsers({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  return (
    <input
      placeholder="Buscar usuario..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
```

**2. Filtros Persistentes (URL)**
```typescript
import { useSearchParams } from 'react-router-dom';

const UsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Leer filtros de la URL
  const filters = {
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    page: Number(searchParams.get('page')) || 1,
  };

  // Actualizar URL al cambiar filtros
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = { ...filters, ...newFilters };
    setSearchParams(params);
  };

  return <UsersTable filters={filters} onFilterChange={updateFilters} />;
};
```

**3. Exportar Resultados**
```typescript
const exportUsers = async (filters: SearchFilters) => {
  // Obtener todos los resultados (sin paginación)
  const result = await searchUsers({ 
    ...filters, 
    limit: 10000 // Máximo
  });
  
  if (result.success) {
    // Convertir a CSV
    const csv = convertToCSV(result.data.users);
    downloadFile(csv, 'usuarios.csv');
  }
};
```

---

## 🛡️ Manejo de Errores Robusto

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  // Error de red
  if (!error.response) {
    return 'Error de conexión. Verifica tu internet.';
  }

  // Errores específicos por código
  const status = error.response.status;
  const message = error.response.data?.error;

  switch (status) {
    case 400:
      return message || 'Datos inválidos';
    case 401:
      // Token expirado
      localStorage.clear();
      window.location.href = '/login';
      return 'Sesión expirada. Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para esta acción';
    case 404:
      return message || 'Recurso no encontrado';
    case 409:
      return message || 'El recurso ya existe';
    case 500:
      return 'Error del servidor. Intenta más tarde.';
    default:
      return message || 'Error desconocido';
  }
};

// Uso
try {
  await createUser(userData);
} catch (error) {
  const errorMessage = handleApiError(error);
  showNotification(errorMessage, 'error');
}
```

---

**Última actualización**: 18 de Octubre, 2025  
**Versión**: 3.0.0

**Cambios recientes:**
- ✅ **Sistema completo de Movimientos de Stock implementado**
  - Endpoints para crear, buscar y consultar movimientos
  - Soporte para 6 tipos de movimientos: Reabastecimiento, Compra, Venta, Ajuste, Devolución, Dañado
  - Actualización automática de stock en transacciones
  - Historial completo por producto
- ✅ **Contexto de negocio actualizado**
  - Empresa de productos derivados de pollo (Coquito)
  - Modelo de fábrica (Yacuiba) → tienda (Tarija)
  - Diferenciación clara entre Reabastecimiento y Compra
- ✅ Campo `lastConnection` agregado al modelo User
- ✅ Contraseña autogenerada con política de la empresa
- ✅ Documentación completa de integración frontend
- ✅ Ejemplos de paginación y búsqueda avanzada
- ✅ Patrones recomendados con React y TanStack Query

