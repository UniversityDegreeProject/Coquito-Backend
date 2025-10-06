# 📋 REFACTORIZACIÓN Y MAPA CONCEPTUAL - SISTEMA POS COQUITO

**Fecha:** 03 de Octubre de 2025  
**Versión:** 2.0  
**Base de Datos:** PostgreSQL - COQUITO_DB

---

## 📝 RESUMEN EJECUTIVO

Esta refactorización convierte todos los enums del sistema de inglés a español para facilitar la integración con el frontend y mejorar la legibilidad del código. Además, se agregó la funcionalidad de verificación de correo electrónico.

---

## 🔄 CAMBIOS DETALLADOS

### 1️⃣ **ENUMS REFACTORIZADOS A ESPAÑOL**

#### **UserRole** (Rol de Usuario)
```prisma
// ANTES (Inglés)
enum UserRole {
  ADMIN
  CASHIER
}

// DESPUÉS (Español) ✅
enum UserRole {
  Administrador  // Acceso completo al sistema
  Cajero         // Acceso limitado (sin gestión de usuarios)
}
```

**Uso en Frontend:**
- ✅ Ahora puedes enviar directamente: `"Administrador"` o `"Cajero"`
- ✅ No necesitas mapeo adicional

---

#### **UserStatus** (Estado de Usuario)
```prisma
// ANTES (Inglés)
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

// DESPUÉS (Español) ✅
enum UserStatus {
  Activo      // Usuario puede acceder al sistema
  Inactivo    // Usuario deshabilitado temporalmente
  Suspendido  // Usuario sancionado
}
```

**Uso en Frontend:**
- ✅ Enviar: `"Activo"`, `"Inactivo"`, `"Suspendido"`

---

#### **CategoryStatus** (Estado de Categoría)
```prisma
// ANTES (Inglés)
enum CategoryStatus {
  ACTIVE
  INACTIVE
}

// DESPUÉS (Español) ✅
enum CategoryStatus {
  Activo
  Inactivo
}
```

---

#### **ProductStatus** (Estado de Producto)
```prisma
// ANTES (Inglés)
enum ProductStatus {
  AVAILABLE
  OUT_OF_STOCK
  DISCONTINUED
}

// DESPUÉS (Español) ✅
enum ProductStatus {
  Disponible     // Producto listo para venta
  SinStock       // Producto agotado
  Descontinuado  // Producto retirado del catálogo
}
```

**Uso en Frontend:**
- ✅ Enviar: `"Disponible"`, `"SinStock"`, `"Descontinuado"`

---

#### **CustomerType** (Tipo de Cliente)
```prisma
// ANTES (Inglés)
enum CustomerType {
  REGULAR
  VIP
  OCCASIONAL
}

// DESPUÉS (Español) ✅
enum CustomerType {
  Regular    // Cliente habitual
  VIP        // Cliente premium
  Ocasional  // Cliente esporádico
}
```

---

#### **StockMovementType** (Tipo de Movimiento de Inventario)
```prisma
// ANTES (Inglés)
enum StockMovementType {
  PURCHASE
  SALE
  ADJUSTMENT
  RETURN
  DAMAGED
}

// DESPUÉS (Español) ✅
enum StockMovementType {
  Compra      // Entrada de mercancía
  Venta       // Salida por venta
  Ajuste      // Corrección de inventario
  Devolucion  // Devolución de producto
  Dañado      // Producto dañado (baja)
}
```

---

#### **OrderStatus** (Estado de Orden)
```prisma
// ANTES (Inglés)
enum OrderStatus {
  PENDING
  COMPLETED
  CANCELLED
  REFUNDED
}

// DESPUÉS (Español) ✅
enum OrderStatus {
  Pendiente    // Orden en proceso
  Completado   // Orden finalizada
  Cancelado    // Orden cancelada
  Reembolsado  // Orden reembolsada
}
```

---

#### **PaymentMethod** (Método de Pago)
```prisma
// ANTES (Inglés)
enum PaymentMethod {
  CASH
  CARD
  TRANSFER
  MULTIPLE
}

// DESPUÉS (Español) ✅
enum PaymentMethod {
  Efectivo       // Pago en efectivo
  Tarjeta        // Pago con tarjeta
  Transferencia  // Pago por transferencia bancaria
  Multiplo       // Combinación de métodos
}
```

---

#### **CashRegisterStatus** (Estado de Caja)
```prisma
// ANTES (Inglés)
enum CashRegisterStatus {
  OPEN
  CLOSED
}

// DESPUÉS (Español) ✅
enum CashRegisterStatus {
  Abierto  // Caja operativa
  Cerrado  // Caja cerrada
}
```

---

### 2️⃣ **NUEVO CAMPO: Verificación de Email**

#### **Modelo User - Cambios**

```prisma
model User {
  id            String     @id @default(uuid())
  email         String     @unique
  
  // ✅ NUEVO CAMPO
  emailVerified Boolean    @default(false) @map("email_verified")
  
  password      String
  firstName     String     @map("first_name")
  lastName      String     @map("last_name")
  phone         String?
  role          UserRole   @default(Cajero)      // ✅ Cambiado a español
  status        UserStatus @default(Activo)       // ✅ Cambiado a español
  
  // ... resto del modelo
}
```

**Detalles del campo:**
- **Nombre:** `emailVerified`
- **Tipo:** `Boolean`
- **Default:** `false` (no verificado al crear usuario)
- **Mapeo DB:** `email_verified` (snake_case en PostgreSQL)

**Flujo de Verificación Sugerido:**

1. **Registro de usuario:**
   ```typescript
   // emailVerified = false por defecto
   ```

2. **Envío de email de verificación:**
   ```typescript
   // Generar token único
   // Enviar email con link de verificación
   ```

3. **Usuario hace clic en el link:**
   ```typescript
   // Validar token
   // Actualizar: emailVerified = true
   ```

4. **Restricciones opcionales:**
   ```typescript
   // Puedes requerir emailVerified = true para ciertas acciones
   // Ejemplo: Crear órdenes mayores a $X, cerrar caja, etc.
   ```

---

## 🗺️ MAPA CONCEPTUAL DEL SISTEMA

### **ARQUITECTURA GENERAL**

```
┌────────────────────────────────────────────────────────────────┐
│                    SISTEMA POS COQUITO                         │
│                     14 TABLAS - 9 ENUMS                        │
└────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │  AUTENTICACIÓN  │       │   OPERACIONES  │
            │   & USUARIOS    │       │    DE NEGOCIO  │
            └───────┬────────┘       └───────┬────────┘
                    │                         │
        ┌───────────┴───────────┐   ┌────────┴────────┐
        │                       │   │                 │
    ┌───▼───┐            ┌─────▼───▼─────┐      ┌───▼────┐
    │ Users │            │   Catálogo    │      │ Ventas │
    └───┬───┘            └───────┬───────┘      └───┬────┘
        │                        │                  │
        │                ┌───────┴───────┐         │
        │                │               │         │
        │         ┌──────▼──────┐  ┌────▼─────┐   │
        │         │ Categories  │  │ Products │   │
        │         └─────────────┘  └────┬─────┘   │
        │                               │         │
        │                       ┌───────┴─────────┴────┐
        │                       │                      │
        │                ┌──────▼─────┐         ┌─────▼──────┐
        └───────────────►│   Orders   │         │ Inventory  │
                         └──────┬─────┘         └─────┬──────┘
                                │                     │
                    ┌───────────┴───────┐            │
                    │                   │            │
            ┌───────▼────────┐  ┌───────▼─────┐     │
            │  Order Items   │  │  Customers  │     │
            └────────────────┘  └─────────────┘     │
                                                     │
                    ┌────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
    ┌───▼────────┐       ┌───────▼──────────┐
    │ Cash       │       │ Stock Movements  │
    │ Registers  │       └──────────────────┘
    └───┬────────┘
        │
        └────────► Reportes & Métricas
                   • Daily Sales Reports
                   • Hourly Sales
                   • Top Products
                   • Activity Logs
```

---

### **1. MÓDULO DE AUTENTICACIÓN Y USUARIOS** 👥

```
┌─────────────────────────────────────────────────────┐
│                    USER (Usuario)                    │
├─────────────────────────────────────────────────────┤
│ • id: UUID                                          │
│ • email: String (UNIQUE)                            │
│ • emailVerified: Boolean ⭐ NUEVO                   │
│ • password: String (Hash)                           │
│ • firstName, lastName: String                       │
│ • phone: String?                                    │
│ • role: UserRole (Administrador | Cajero)          │
│ • status: UserStatus (Activo | Inactivo | Suspendido)│
├─────────────────────────────────────────────────────┤
│ RELACIONES:                                         │
│ ├─► orders[] (Órdenes creadas)                     │
│ ├─► cashRegisters[] (Cajas asignadas)              │
│ ├─► stockMovements[] (Movimientos de inventario)   │
│ └─► activityLogs[] (Registro de actividades)       │
└─────────────────────────────────────────────────────┘
```

**Control de Acceso:**
- **Administrador:** CRUD completo de usuarios, productos, categorías, reportes
- **Cajero:** Crear/ver órdenes, cerrar caja, ver catálogo (NO gestionar usuarios)

---

### **2. MÓDULO DE CATÁLOGO** 📦

```
┌──────────────────────────────────────────────────┐
│               CATEGORY (Categoría)                │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • name: String (UNIQUE)                          │
│ • description: String?                           │
│ • status: CategoryStatus (Activo | Inactivo)    │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ └─► products[] (1:N con Products)               │
└──────────────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌──────────────────────────────────────────────────┐
│                PRODUCT (Producto)                │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • name: String                                   │
│ • description: String?                           │
│ • price: Decimal(10,2)                           │
│ • sku: String? (UNIQUE)                          │
│ • stock: Int (default: 0)                        │
│ • minStock: Int (default: 5)                     │
│ • image: String?                                 │
│ • status: ProductStatus                          │
│   (Disponible | SinStock | Descontinuado)       │
│ • categoryId: UUID                               │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ ├─► category (N:1 con Category)                 │
│ ├─► orderItems[] (Items en órdenes)             │
│ └─► stockMovements[] (Historial de inventario)  │
└──────────────────────────────────────────────────┘
```

**Índices:**
- `categoryId`, `status`, `stock` (para alertas de stock bajo)

---

### **3. MÓDULO DE CLIENTES** 👤

```
┌──────────────────────────────────────────────────┐
│               CUSTOMER (Cliente)                  │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • firstName, lastName: String                    │
│ • email: String? (UNIQUE)                        │
│ • phone: String?                                 │
│ • address: String?                               │
│ • type: CustomerType                             │
│   (Regular | VIP | Ocasional)                   │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ └─► orders[] (Órdenes del cliente)              │
└──────────────────────────────────────────────────┘
```

---

### **4. MÓDULO DE ÓRDENES Y VENTAS** 🛒

```
┌──────────────────────────────────────────────────┐
│                 ORDER (Orden)                     │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • orderNumber: String (UNIQUE)                   │
│ • customerId: UUID? (Opcional)                   │
│ • userId: UUID (Cajero que creó la orden)       │
│ • cashRegisterId: UUID? (Caja asociada)         │
│ • subtotal: Decimal(10,2)                        │
│ • tax: Decimal(10,2)                             │
│ • total: Decimal(10,2)                           │
│ • paymentMethod: PaymentMethod                   │
│   (Efectivo | Tarjeta | Transferencia | Multiplo)│
│ • amountPaid: Decimal(10,2)                      │
│ • change: Decimal(10,2)                          │
│ • status: OrderStatus                            │
│   (Pendiente | Completado | Cancelado | Reembolsado)│
│ • notes: String?                                 │
│ • completedAt: DateTime?                         │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ ├─► customer (N:1 con Customer)                 │
│ ├─► user (N:1 con User)                         │
│ ├─► cashRegister (N:1 con CashRegister)         │
│ └─► items[] (1:N con OrderItem)                 │
└──────────────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌──────────────────────────────────────────────────┐
│             ORDER ITEM (Item de Orden)           │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • orderId: UUID                                  │
│ • productId: UUID                                │
│ • quantity: Int                                  │
│ • unitPrice: Decimal(10,2)                       │
│ • total: Decimal(10,2)                           │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ ├─► order (N:1 con Order)                       │
│ └─► product (N:1 con Product)                   │
└──────────────────────────────────────────────────┘
```

**Flujo de Venta:**
1. Cajero crea orden
2. Agrega items (productos)
3. Calcula subtotal, tax, total
4. Registra método de pago
5. Actualiza inventario automáticamente
6. Genera movimiento de stock (Venta)

---

### **5. MÓDULO DE INVENTARIO** 📊

```
┌──────────────────────────────────────────────────┐
│         STOCK MOVEMENT (Movimiento de Stock)     │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • productId: UUID                                │
│ • userId: UUID (Usuario que registró)           │
│ • type: StockMovementType                        │
│   (Compra | Venta | Ajuste | Devolucion | Dañado)│
│ • quantity: Int (+ entrada, - salida)           │
│ • previousStock: Int                             │
│ • newStock: Int                                  │
│ • reason: String?                                │
│ • reference: String? (ID de orden, factura)     │
│ • notes: String?                                 │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ ├─► product (N:1 con Product)                   │
│ └─► user (N:1 con User)                         │
└──────────────────────────────────────────────────┘
```

**Casos de Uso:**
- **Compra:** +10 unidades (entrada)
- **Venta:** -2 unidades (salida automática)
- **Ajuste:** Corrección de inventario
- **Devolución:** +1 unidad
- **Dañado:** -1 unidad (baja)

---

### **6. MÓDULO DE CAJA** 💰

```
┌──────────────────────────────────────────────────┐
│          CASH REGISTER (Registro de Caja)        │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • userId: UUID (Cajero asignado)                │
│ • openingAmount: Decimal(10,2)                   │
│ • openedAt: DateTime                             │
│ • closingAmount: Decimal(10,2)?                  │
│ • expectedAmount: Decimal(10,2)?                 │
│ • difference: Decimal(10,2)?                     │
│ • closedAt: DateTime?                            │
│ • totalSales: Decimal(10,2)                      │
│ • totalOrders: Int                               │
│ • cashSales, cardSales, transferSales: Decimal   │
│ • status: CashRegisterStatus                     │
│   (Abierto | Cerrado)                           │
│ • notes: String?                                 │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ ├─► user (N:1 con User)                         │
│ └─► orders[] (Órdenes de esta caja)             │
└──────────────────────────────────────────────────┘
```

**Flujo de Cierre de Caja:**
1. Cajero inicia turno: estado = `Abierto`
2. Registra monto inicial (`openingAmount`)
3. Durante el día: órdenes se asocian a esta caja
4. Fin del turno: Cierre de caja
   - Contar efectivo real → `closingAmount`
   - Sistema calcula → `expectedAmount`
   - Diferencia = closingAmount - expectedAmount
5. Estado = `Cerrado`

---

### **7. MÓDULO DE REPORTES Y MÉTRICAS** 📈

```
┌──────────────────────────────────────────────────┐
│         DAILY SALES REPORT (Reporte Diario)      │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • date: Date (UNIQUE)                            │
│ • totalSales: Decimal(10,2)                      │
│ • totalOrders: Int                               │
│ • averageTicket: Decimal(10,2)                   │
│ • newCustomers: Int                              │
│ • cashSales, cardSales, transferSales: Decimal   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│           HOURLY SALES (Ventas por Hora)         │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • date: Date                                     │
│ • hour: Int (0-23)                               │
│ • totalSales: Decimal(10,2)                      │
│ • totalOrders: Int                               │
│ • UNIQUE(date, hour)                             │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│        TOP PRODUCT (Producto más Vendido)        │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • date: Date                                     │
│ • productId: UUID                                │
│ • productName: String                            │
│ • totalQuantity: Int                             │
│ • totalRevenue: Decimal(10,2)                    │
│ • UNIQUE(date, productId)                        │
└──────────────────────────────────────────────────┘
```

---

### **8. MÓDULO DE SISTEMA** ⚙️

```
┌──────────────────────────────────────────────────┐
│      SYSTEM CONFIG (Configuración del Sistema)   │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • key: String (UNIQUE)                           │
│ • value: String (JSON)                           │
│ • description: String?                           │
└──────────────────────────────────────────────────┘

Ejemplos de configuraciones:
- tax_rate: "0.19"
- currency: "COP"
- business_name: "Coquito Store"
- max_discount_percent: "20"

┌──────────────────────────────────────────────────┐
│      ACTIVITY LOG (Registro de Actividades)      │
├──────────────────────────────────────────────────┤
│ • id: UUID                                       │
│ • userId: UUID                                   │
│ • action: String                                 │
│ • entity: String                                 │
│ • entityId: String?                              │
│ • description: String                            │
│ • metadata: String? (JSON)                       │
│ • ipAddress, userAgent: String?                  │
├──────────────────────────────────────────────────┤
│ RELACIONES:                                      │
│ └─► user (N:1 con User)                         │
└──────────────────────────────────────────────────┘

Ejemplos de logs:
- "CREATE_PRODUCT" → "Producto 'Coca Cola' creado"
- "UPDATE_ORDER" → "Orden #12345 completada"
- "CLOSE_CASH_REGISTER" → "Caja cerrada con diferencia de $0"
```

---

## 🔗 DIAGRAMA DE RELACIONES COMPLETO

```
┌─────────┐
│  User   │────┐
└────┬────┘    │
     │         │
     │ 1:N     │ 1:N
     │         │
     ▼         ▼
┌──────────┐ ┌──────────────┐
│  Orders  │ │ CashRegister │
└────┬─────┘ └──────┬───────┘
     │              │
     │ 1:N          │ 1:N
     │              │
     ▼              ▼
┌────────────┐  ┌────────┐
│ OrderItem  │  │ Orders │
└─────┬──────┘  └────────┘
      │
      │ N:1
      ▼
┌──────────┐
│ Product  │────────┐
└────┬─────┘        │
     │              │ N:1
     │ N:1          │
     ▼              ▼
┌──────────┐  ┌─────────────────┐
│ Category │  │ StockMovement   │
└──────────┘  └─────────┬───────┘
                        │
                        │ N:1
                        ▼
                   ┌────────┐
                   │  User  │
                   └────────┘

┌──────────┐
│ Customer │────┐
└──────────┘    │ 1:N
                ▼
           ┌──────────┐
           │  Orders  │
           └──────────┘

┌──────────┐
│   User   │────┐
└──────────┘    │ 1:N
                ▼
         ┌──────────────┐
         │ ActivityLog  │
         └──────────────┘
```

---

## 📊 RESUMEN DE ENUMS

| Enum                 | Valores                                          | Uso                      |
|---------------------|--------------------------------------------------|--------------------------|
| UserRole            | Administrador, Cajero                            | Roles de usuario         |
| UserStatus          | Activo, Inactivo, Suspendido                     | Estado de cuenta         |
| CategoryStatus      | Activo, Inactivo                                 | Visibilidad categoría    |
| ProductStatus       | Disponible, SinStock, Descontinuado              | Estado de producto       |
| CustomerType        | Regular, VIP, Ocasional                          | Tipo de cliente          |
| StockMovementType   | Compra, Venta, Ajuste, Devolucion, Dañado       | Tipo de movimiento       |
| OrderStatus         | Pendiente, Completado, Cancelado, Reembolsado    | Estado de orden          |
| PaymentMethod       | Efectivo, Tarjeta, Transferencia, Multiplo       | Método de pago           |
| CashRegisterStatus  | Abierto, Cerrado                                 | Estado de caja           |

---

## 🎯 ÍNDICES Y OPTIMIZACIONES

### **Índices Implementados:**

| Tabla          | Índices                                    | Propósito                          |
|----------------|--------------------------------------------|------------------------------------|
| Product        | categoryId, status, stock                  | Búsquedas rápidas y alertas        |
| Order          | userId, customerId, cashRegisterId, status | Filtrado de órdenes                |
| OrderItem      | orderId, productId                         | Joins optimizados                  |
| StockMovement  | productId, userId, type, createdAt         | Historial y auditoría              |
| CashRegister   | userId, status, openedAt                   | Búsqueda de cajas activas          |
| DailySales     | date                                       | Reportes rápidos por fecha         |
| HourlySales    | date                                       | Gráficas por hora                  |
| TopProduct     | date                                       | Ranking de productos               |
| ActivityLog    | userId, (entity, entityId), createdAt      | Auditoría y trazabilidad           |

---

## ✅ VALIDACIONES RECOMENDADAS

### **Backend (Prisma/Express Validator):**

```typescript
// Ejemplo: Validación de orden
- subtotal > 0
- total = subtotal + tax
- amountPaid >= total
- change = amountPaid - total
- paymentMethod in [Efectivo, Tarjeta, Transferencia, Multiplo]
- status in [Pendiente, Completado, Cancelado, Reembolsado]
```

### **Frontend (React Hook Form + Zod):**

```typescript
// Ejemplo: Validación de producto
const productSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  price: z.number().positive("Precio debe ser positivo"),
  stock: z.number().nonnegative("Stock no puede ser negativo"),
  status: z.enum(["Disponible", "SinStock", "Descontinuado"]),
  categoryId: z.string().uuid("Categoría inválida")
});
```

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Aplicar la migración:**
   ```bash
   npx prisma migrate dev --name refactor_enums_to_spanish_and_add_email_verification
   ```

2. **Generar Prisma Client actualizado:**
   ```bash
   npx prisma generate
   ```

3. **Actualizar código existente:**
   - Cambiar todos los enums en el backend de inglés a español
   - Actualizar DTOs y validadores
   - Actualizar tipos en el frontend

4. **Implementar verificación de email:**
   - Endpoint `POST /auth/send-verification-email`
   - Endpoint `GET /auth/verify-email/:token`
   - Middleware para requerir email verificado (opcional)

5. **Crear seed de datos de prueba:**
   - Usuario administrador inicial
   - Categorías básicas
   - Productos de muestra
   - Configuraciones del sistema

6. **Testing:**
   - Pruebas unitarias para cada módulo
   - Pruebas de integración para flujos completos
   - Validación de constraints y relaciones

---

## 📝 NOTAS IMPORTANTES

⚠️ **BREAKING CHANGES:**
- Todos los enums cambiaron de inglés a español
- Campo `emailValidate` renombrado a `emailVerified`
- Requiere actualización de código frontend y backend

✅ **VENTAJAS:**
- Mayor claridad en el código español
- Menor necesidad de mapeo frontend ↔ backend
- Mejor experiencia de desarrollo
- Facilita debugging y logs legibles

🔒 **SEGURIDAD:**
- Passwords hasheados (bcrypt recomendado)
- JWT para autenticación
- Control de acceso por rol estricto
- Logs de auditoría completos

---

**Documentación generada automáticamente**  
**Backend Coquito - Sistema POS**  
**© 2025 - Todos los derechos reservados**

