# 📚 Documentación API Backend - Sistema POS Coquito

> Documentación completa de la API REST para el sistema de punto de venta (POS) Coquito

## 📖 Tabla de Contenidos

- [Información General](#información-general)
- [Arquitectura](#arquitectura)
- [Base de Datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
  - [Auth](#auth-endpoints) - Autenticación y Registro
  - [Users](#users-endpoints) - Gestión de Usuarios
  - [Categories](#categories-endpoints) - Gestión de Categorías
  - [Products](#products-endpoints) - Gestión de Productos
  - [Stock Movements](#stock-movements-endpoints) - Movimientos de Inventario
  - [Customers](#customers-endpoints) - Gestión de Clientes
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

Para rutas protegidas:
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
│   - Acceso a datos (Prisma)                │
│   - Servicios externos                      │
│   - Implementaciones concretas              │
└─────────────────────────────────────────────┘
```

---

## 💾 Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema (Admin, Cajero)
- **Category**: Categorías de productos
- **Product**: Productos con control de stock
- **Customer**: Clientes del sistema
- **StockMovement**: Movimientos de inventario
- **Order**: Órdenes de venta
- **CashRegister**: Control de caja

### Tipos de Movimientos de Stock

1. **Reabastecimiento**: Transferencia desde fábrica (Yacuiba) a tienda (Tarija)
2. **Compra**: Compra a proveedores externos
3. **Venta**: Venta a clientes
4. **Ajuste**: Corrección de inventario físico
5. **Devolucion**: Cliente devuelve producto
6. **Dañado**: Producto dado de baja

---

## 🔐 Autenticación

### Flujo de Autenticación

1. **Login**: Usuario + Contraseña → Access Token + Refresh Token
2. **Access Token**: Válido por 1 hora
3. **Refresh Token**: Válido por 7 días, almacenado en BD
4. **Renovación**: Usar Refresh Token para obtener nuevo Access Token

### Endpoints de Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/refresh-token` - Renovar access token
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `GET /api/auth/verify-email/:token` - Verificar email
- `POST /api/auth/reset-password-page/:token` - Página de reset
- `POST /api/auth/reset-password-submit` - Procesar reset

---

## 🚀 Endpoints

### Auth Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123@"
}
```

**Respuesta:**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@coquito.com",
    "role": "Administrador",
    "status": "Activo"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "cajero1",
  "email": "cajero@coquito.com",
  "password": "Cajero123@",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "12345678",
  "role": "Cajero"
}
```

### Users Endpoints

#### Obtener Usuarios
```http
GET /api/users?page=1&limit=10&search=admin&role=Administrador&status=Activo
Authorization: Bearer <token>
```

#### Crear Usuario
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "nuevo_usuario",
  "email": "usuario@coquito.com",
  "password": "Password123@",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "phone": "87654321",
  "role": "Cajero"
}
```

#### Actualizar Usuario
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Nombre Actualizado",
  "email": "nuevo@email.com"
}
```

#### Eliminar Usuario
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Categories Endpoints

#### Obtener Categorías
```http
GET /api/categories?page=1&limit=10&search=carnes
```

#### Crear Categoría
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carnes Rojas",
  "description": "Productos de carne de res"
}
```

#### Actualizar Categoría
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Carnes Rojas Actualizada",
  "description": "Descripción actualizada"
}
```

#### Eliminar Categoría
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

### Products Endpoints

#### Obtener Productos
```http
GET /api/products?page=1&limit=10&search=piernas&categoryId=uuid&status=Disponible&minStock=5
```

**Parámetros de consulta:**
- `search`: Búsqueda por nombre, descripción o SKU
- `categoryId`: Filtrar por categoría
- `status`: Filtrar por estado (Disponible, SinStock, Descontinuado)
- `minStock`: Filtrar productos con stock menor o igual al valor especificado
- `page`: Página (default: 1)
- `limit`: Límite por página (default: 5, max: 100)

#### Crear Producto
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Piernas de Pollo",
  "description": "Piernas de pollo frescas por kg",
  "price": 15.50,
  "sku": "PIE-001",
  "stock": 100,
  "minStock": 10,
  "image": "https://example.com/piernas.jpg",
  "ingredients": "Carne de pollo, sal, especias",
  "categoryId": "uuid",
  "status": "Disponible"
}
```

#### Actualizar Producto
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Piernas de Pollo Actualizadas",
  "price": 16.00,
  "stock": 150
}
```

#### Eliminar Producto
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Stock Movements Endpoints

#### Obtener Movimientos
```http
GET /api/stock-movements?page=1&limit=10&productId=uuid&type=Venta&userId=uuid
```

#### Crear Movimiento
```http
POST /api/stock-movements
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "type": "Venta",
  "quantity": 5,
  "reason": "Venta orden #123",
  "reference": "ORD-123",
  "notes": "Venta al cliente Juan Pérez"
}
```

### Customers Endpoints

#### Obtener Clientes
```http
GET /api/customers?page=1&limit=10&search=juan&type=VIP
```

#### Crear Cliente
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@email.com",
  "phone": "12345678",
  "address": "Calle Principal #123",
  "type": "VIP"
}
```

#### Actualizar Cliente
```http
PUT /api/customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "type": "Regular"
}
```

#### Eliminar Cliente
```http
DELETE /api/customers/:id
Authorization: Bearer <token>
```

---

## 📊 Modelos de Datos

### User
```typescript
{
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "Administrador" | "Cajero";
  status: "Activo" | "Inactivo" | "Suspendido";
  createdAt: Date;
  updatedAt?: Date;
  lastConnection?: Date;
}
```

### Product
```typescript
{
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock: number;
  minStock: number;
  image?: string;
  status: "Disponible" | "SinStock" | "Descontinuado";
  ingredients?: string;
  categoryId: string;
  category?: Category;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Category
```typescript
{
  id: string;
  name: string;
  description?: string;
  status: "Activo" | "Inactivo";
  createdAt: Date;
  updatedAt?: Date;
}
```

### Customer
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  type: "Regular" | "VIP" | "Ocasional";
  createdAt: Date;
  updatedAt?: Date;
}
```

### StockMovement
```typescript
{
  id: string;
  productId: string;
  userId: string;
  type: "Reabastecimiento" | "Compra" | "Venta" | "Ajuste" | "Devolucion" | "Dañado";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  user?: User;
  product?: Product;
}
```

---

## 📋 Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## ⚠️ Manejo de Errores

### Formato de Error
```json
{
  "error": "Mensaje de error descriptivo"
}
```

### Ejemplos de Errores

#### Validación
```json
{
  "error": "El nombre es requerido"
}
```

#### Recurso no encontrado
```json
{
  "error": "Producto no encontrado"
}
```

#### Conflicto
```json
{
  "error": "El email ya está registrado"
}
```

#### Error interno
```json
{
  "error": "Internal server error"
}
```

---

## 🔧 Configuración del Entorno

### Variables de Entorno Requeridas

```env
# Base de datos
POSTGRES_URL="postgresql://user:password@localhost:5432/coquito_db"

# JWT
JWT_SEED="tu_secret_key_muy_segura"

# Email
MAILER_SERVICE="gmail"
MAILER_EMAIL="tu_email@gmail.com"
MAILER_SECRET_KEY="tu_app_password"

# URLs
WEBSERVICE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:5173"

# Servidor
PORT=3000
PUBLIC_PATH="./public"
```

### Docker Compose

```yaml
services:
  postgres-db:
    image: postgres:latest
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
  
  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
    ports:
      - "5050:80"
```

---

## 🚀 Instalación y Uso

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con tus valores
```

### 3. Configurar Base de Datos
```bash
# Con Docker
docker-compose up -d

# O instalar PostgreSQL localmente
```

### 4. Ejecutar Migraciones
```bash
npx prisma migrate dev
```

### 5. Generar Cliente Prisma
```bash
npx prisma generate
```

### 6. Iniciar Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

---

## 📝 Notas Importantes

- Todos los endpoints requieren `Content-Type: application/json`
- Los endpoints protegidos requieren `Authorization: Bearer <token>`
- Las validaciones usan Zod con mensajes en español
- Los precios se manejan con 2 decimales
- Los UUIDs se generan automáticamente
- Los timestamps se manejan automáticamente
- Las contraseñas se hashean con bcrypt
- Los tokens JWT tienen duración limitada

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

**Desarrollado para Embutidos Coquito - Sistema POS** 🐔