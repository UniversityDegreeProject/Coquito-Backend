# 🔧 REFACTORIZACIÓN OPCIÓN 1 - BACKEND COQUITO

**Fecha:** 6 de Octubre de 2025  
**Tipo:** Corrección de Bugs y Mejora Arquitectónica

---

## 📋 RESUMEN EJECUTIVO

Se realizó una refactorización completa para corregir **bugs críticos** en la arquitectura y mejorar la consistencia del código.

### ✅ Problemas Resueltos:
1. ✅ AuthDatasource con dependencia innecesaria
2. ✅ Instanciación incorrecta en routes
3. ✅ Bug en verificación de usuarios existentes
4. ✅ Campo `emailValidate` vs `emailVerified`
5. ✅ Errores no lanzados correctamente (sin `throw`)
6. ✅ Schema de validación sin campo `username`

---

## 🔍 CAMBIOS DETALLADOS

### 1️⃣ **AuthDatasourceImpl - Acceso Directo a Prisma**

#### ❌ **ANTES (Con dependencia innecesaria):**
```typescript
export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly userDatasource: UserDatasource  // ❌ Acoplamiento
  ) {}

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userDatasource.getUserByUsername(username);
    if (!user) HttpCustomErrors.notFound("User not found");  // ❌ Sin throw
    // ...
  }
}
```

#### ✅ **DESPUÉS (Sin dependencias, acceso directo):**
```typescript
import { prismaClient } from "../../data/postgres";

export class AuthDatasourceImpl implements AuthDatasource {
  
  // Constructor sin dependencias - acceso directo a Prisma
  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const { username, password } = loginUserDto;
    
    // Acceso directo a Prisma (igual que UserDatasourceImpl)
    const user = await prismaClient.user.findUnique({
      where: { username }
    });
    
    if (!user) throw HttpCustomErrors.notFound("User not found");
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw HttpCustomErrors.unauthorized("Invalid password");
    
    return UserEntity.mapFromPrisma(user);
  }
}
```

**Ventajas:**
- ✅ Sin acoplamiento innecesario
- ✅ Consistente con `UserDatasourceImpl`
- ✅ Más simple y testeable
- ✅ Errores lanzados correctamente

---

### 2️⃣ **AuthRoutes - Instanciación Corregida**

#### ❌ **ANTES (Bug en instanciación):**
```typescript
static get routes(): Router {
  const router = Router();
  const userDatasourceImpl = new UserDatasourceImpl();
  const userRepositoryImpl = new UserRepositoryImpl(userDatasourceImpl);
  const authDatasourceImpl = new AuthDatasourceImpl();  // ❌ Faltaba parámetro
  // ...
}
```

#### ✅ **DESPUÉS (Sin dependencias):**
```typescript
static get routes(): Router {
  const router = Router();
  
  // Instancias de User (para register)
  const userDatasourceImpl = new UserDatasourceImpl();
  const userRepositoryImpl = new UserRepositoryImpl(userDatasourceImpl);
  
  // Instancias de Auth (para login) - sin dependencias
  const authDatasourceImpl = new AuthDatasourceImpl();
  const authRepositoryImpl = new AuthRepositoryImpl(authDatasourceImpl);
  
  // Controller con ambos repositorios
  const authController = new AuthController(userRepositoryImpl, authRepositoryImpl);
  
  router.post('/login', authController.loginUser);
  router.post('/register', authController.registerUser);
  
  return router;
}
```

---

### 3️⃣ **UserDatasourceImpl.createUser - Verificación Correcta**

#### ❌ **ANTES (Lógica incorrecta):**
```typescript
async createUser(user: RegisterUserDto): Promise<UserEntity> {
  const { password, ...rest } = user;
  
  // ❌ getUserByEmail lanza error 404 si no existe
  // Nunca llegará al if
  const userExists = await this.getUserByEmail(user.email);
  if (userExists) HttpCustomErrors.badRequest("Usuario ya existe");
  // ...
}
```

#### ✅ **DESPUÉS (Verificación correcta):**
```typescript
async createUser(user: RegisterUserDto): Promise<UserEntity> {
  const { password, ...rest } = user;
  
  // Verificar si el usuario ya existe (por email o username)
  const existingUserByEmail = await prismaClient.user.findUnique({
    where: { email: user.email }
  });
  
  if (existingUserByEmail) {
    throw HttpCustomErrors.badRequest("El email ya está registrado");
  }
  
  const existingUserByUsername = await prismaClient.user.findUnique({
    where: { username: user.username }
  });
  
  if (existingUserByUsername) {
    throw HttpCustomErrors.badRequest("El username ya está en uso");
  }

  // Hash de contraseña
  const hashedPassword = await bcrypt.hash(password);
  
  // Crear usuario
  const newUser = await prismaClient.user.create({
    data: {
      ...rest,
      password: hashedPassword,
    },
  });
  
  return UserEntity.mapFromPrisma(newUser);
}
```

**Mejoras:**
- ✅ Verifica email Y username
- ✅ No depende de métodos que lanzan errores
- ✅ Mensajes de error más específicos

---

### 4️⃣ **UserDatasourceImpl - Errores con `throw`**

#### ❌ **ANTES (Sin throw):**
```typescript
async getUserByUsername(username: string): Promise<UserEntity> {
  const user = await prismaClient.user.findUnique({ where: { username } });
  if (!user) HttpCustomErrors.notFound("User not found");  // ❌ No lanza
  return UserEntity.mapFromPrisma(user!);
}

async getUserById(id: string | number): Promise<UserEntity> {
  const user = await prismaClient.user.findUnique({ where: { id: id.toString() } });
  if (!user) HttpCustomErrors.notFound("User not found");  // ❌ No lanza
  return UserEntity.mapFromPrisma(user!);
}

async getUserByEmail(email: string): Promise<UserEntity> {
  const user = await prismaClient.user.findUnique({ where: { email } });
  if (!user) HttpCustomErrors.notFound("Usuario no encontrado");  // ❌ No lanza
  return UserEntity.mapFromPrisma(user!);
}
```

#### ✅ **DESPUÉS (Con throw):**
```typescript
async getUserByUsername(username: string): Promise<UserEntity> {
  const user = await prismaClient.user.findUnique({ where: { username } });
  if (!user) throw HttpCustomErrors.notFound("User not found");
  return UserEntity.mapFromPrisma(user);
}

async getUserById(id: string | number): Promise<UserEntity> {
  const user = await prismaClient.user.findUnique({ where: { id: id.toString() } });
  if (!user) throw HttpCustomErrors.notFound("User not found");
  return UserEntity.mapFromPrisma(user);
}

async getUserByEmail(email: string): Promise<UserEntity> {
  const user = await prismaClient.user.findUnique({ where: { email } });
  if (!user) throw HttpCustomErrors.notFound("Usuario no encontrado");
  return UserEntity.mapFromPrisma(user);
}
```

---

### 5️⃣ **UserEntity - Campo Correcto `emailVerified`**

#### ❌ **ANTES (Campo incorrecto):**
```typescript
export class UserEntity {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public emailValidate: boolean,  // ❌ No coincide con Prisma
    // ...
  ) {}

  public static mapFromPrisma(prismaUser: {[key:string]: any}): UserEntity {
    const { id, username, email, emailValidate, ... } = prismaUser;  // ❌
    if (emailValidate === undefined) HttpCustomErrors.badRequest("...");  // ❌
    // ...
    return new UserEntity(id, username, email, emailValidate, ...);
  }
}
```

#### ✅ **DESPUÉS (Campo correcto):**
```typescript
export class UserEntity {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public emailVerified: boolean,  // ✅ Coincide con Prisma
    // ...
  ) {}

  public static mapFromPrisma(prismaUser: {[key:string]: any}): UserEntity {
    const { id, username, email, emailVerified, ... } = prismaUser;
    
    if (!id) throw HttpCustomErrors.badRequest("id is required");
    if (!email) throw HttpCustomErrors.badRequest("email is required");
    if (!username) throw HttpCustomErrors.badRequest("username is required");
    if (emailVerified === undefined) throw HttpCustomErrors.badRequest("emailVerified is required");
    // ...
    
    return new UserEntity(id, username, email, emailVerified, ...);
  }
}
```

---

### 6️⃣ **Schema de Validación - Campo `username` Agregado**

#### ❌ **ANTES (Sin username):**
```typescript
export const createUserSchema = zod.object({
  // ❌ FALTA username
  email: zod.string()...,
  password: zod.string()...,
  firstName: zod.string()...,
  // ...
});
```

#### ✅ **DESPUÉS (Con username y validación mejorada):**
```typescript
export const createUserSchema = zod.object({
  username: zod
    .string({ message: "Usuario es requerido" })
    .min(3, { message: "El usuario debe tener al menos 3 caracteres" })
    .max(20, { message: "El usuario debe tener máximo 20 caracteres" }),

  email: zod
    .string({ message: "Email es requerido" })
    .min(1, { message: "El email no puede estar vacio" })
    .email({ message: "Formato de email invalido" }),
  
  password: zod
    .string({ message: "Contraseña es requerida" })
    .min(6, { message: "Contraseña debe tener al menos 6 caracteres" })
    .max(16, { message: "Contraseña debe estar entre 6 y 16 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { 
        message: "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial" 
      }
    ),
  // ...
  role: zod.enum(["Administrador", "Cajero"], { 
    message: "Rol es requerido" 
  }),
  
  status: zod
    .enum(["Activo", "Inactivo", "Suspendido"], { 
      message: "Estado es requerido" 
    })
    .default("Activo"),
});
```

**Mejoras:**
- ✅ Campo `username` requerido (coincide con Prisma)
- ✅ Validación de longitud (3-20 caracteres)
- ✅ Mensajes de error consistentes con `message` en lugar de `error`

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### **Arquitectura:**

#### ❌ ANTES:
```
AuthDatasourceImpl
    └── depende de → UserDatasource
                         └── depende de → Prisma

UserDatasourceImpl
    └── depende de → Prisma
```

#### ✅ DESPUÉS:
```
AuthDatasourceImpl
    └── depende de → Prisma  ✅

UserDatasourceImpl
    └── depende de → Prisma  ✅
```

**Resultado:** Ambos datasources acceden directamente a Prisma, sin acoplamiento innecesario.

---

## ✅ BENEFICIOS DE LA REFACTORIZACIÓN

1. **🔧 Arquitectura más limpia:**
   - Sin dependencias circulares o innecesarias
   - Patrón consistente en todos los datasources

2. **🐛 Bugs corregidos:**
   - Errores ahora se lanzan correctamente con `throw`
   - Verificación de usuarios existentes funciona
   - Campos de entidad coinciden con Prisma

3. **✨ Código más robusto:**
   - Validación completa en schemas
   - Verificación de email Y username en registro
   - Mensajes de error más descriptivos

4. **🧪 Más testeable:**
   - Menos dependencias = más fácil de mockear
   - Lógica más clara y predecible

5. **📚 Mejor mantenibilidad:**
   - Código más legible
   - Comentarios en español
   - Estructura consistente

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

### Implementar (Pendientes):
1. **JWT completo** - Generar y validar tokens reales
2. **Middleware de autenticación** - Proteger rutas
3. **Middleware de roles** - Control de acceso por rol
4. **Métodos pendientes** - `updateUser`, `deleteUser`
5. **Tests unitarios** - Cobertura de código

### Opcional (Mejoras futuras):
6. **Contenedor de IoC** - Inyección de dependencias centralizada
7. **Logging estructurado** - Winston o Pino
8. **Validación de DTOs** - Middleware automático
9. **Transacciones Prisma** - Para operaciones complejas
10. **Documentación API** - Swagger/OpenAPI

---

## 📝 ARCHIVOS MODIFICADOS

1. ✅ `src/infrastructure/datasource/auth.datasource.impl.ts`
2. ✅ `src/infrastructure/datasource/user.datasource.impl.ts`
3. ✅ `src/presentation/auth/routes/auth.route.ts`
4. ✅ `src/domain/entities/user.entity.ts`
5. ✅ `src/domain/schemas/user-validator.schema.ts`

---

## ✅ VERIFICACIÓN

- ✅ Sin errores de linting
- ✅ TypeScript strict mode cumplido
- ✅ Arquitectura Clean mantenida
- ✅ Principios SOLID respetados
- ✅ Código en inglés, comentarios en español

---

**Refactorización completada exitosamente** 🎉  
**Backend Coquito - Sistema POS**  
**© 2025**

