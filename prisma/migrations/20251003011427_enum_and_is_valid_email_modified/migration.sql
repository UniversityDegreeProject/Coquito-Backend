/*
  Warnings:

  - The values [OPEN,CLOSED] on the enum `CashRegisterStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE] on the enum `CategoryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REGULAR,OCCASIONAL] on the enum `CustomerType` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,COMPLETED,CANCELLED,REFUNDED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CASH,CARD,TRANSFER,MULTIPLE] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [AVAILABLE,OUT_OF_STOCK,DISCONTINUED] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PURCHASE,SALE,ADJUSTMENT,RETURN,DAMAGED] on the enum `StockMovementType` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,CASHIER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE,SUSPENDED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CashRegisterStatus_new" AS ENUM ('Abierto', 'Cerrado');
ALTER TABLE "public"."cash_registers" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "cash_registers" ALTER COLUMN "status" TYPE "CashRegisterStatus_new" USING ("status"::text::"CashRegisterStatus_new");
ALTER TYPE "CashRegisterStatus" RENAME TO "CashRegisterStatus_old";
ALTER TYPE "CashRegisterStatus_new" RENAME TO "CashRegisterStatus";
DROP TYPE "public"."CashRegisterStatus_old";
ALTER TABLE "cash_registers" ALTER COLUMN "status" SET DEFAULT 'Abierto';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CategoryStatus_new" AS ENUM ('Activo', 'Inactivo');
ALTER TABLE "public"."categories" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "categories" ALTER COLUMN "status" TYPE "CategoryStatus_new" USING ("status"::text::"CategoryStatus_new");
ALTER TYPE "CategoryStatus" RENAME TO "CategoryStatus_old";
ALTER TYPE "CategoryStatus_new" RENAME TO "CategoryStatus";
DROP TYPE "public"."CategoryStatus_old";
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'Activo';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CustomerType_new" AS ENUM ('Regular', 'VIP', 'Ocasional');
ALTER TABLE "public"."customers" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "customers" ALTER COLUMN "type" TYPE "CustomerType_new" USING ("type"::text::"CustomerType_new");
ALTER TYPE "CustomerType" RENAME TO "CustomerType_old";
ALTER TYPE "CustomerType_new" RENAME TO "CustomerType";
DROP TYPE "public"."CustomerType_old";
ALTER TABLE "customers" ALTER COLUMN "type" SET DEFAULT 'Regular';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Pendiente', 'Completado', 'Cancelado', 'Reembolsado');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pendiente';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('Efectivo', 'Tarjeta', 'Transferencia', 'Multiplo');
ALTER TABLE "orders" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('Disponible', 'SinStock', 'Descontinuado');
ALTER TABLE "public"."products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'Disponible';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StockMovementType_new" AS ENUM ('Compra', 'Venta', 'Ajuste', 'Devolucion', 'Dañado');
ALTER TABLE "stock_movements" ALTER COLUMN "type" TYPE "StockMovementType_new" USING ("type"::text::"StockMovementType_new");
ALTER TYPE "StockMovementType" RENAME TO "StockMovementType_old";
ALTER TYPE "StockMovementType_new" RENAME TO "StockMovementType";
DROP TYPE "public"."StockMovementType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('Administrador', 'Cajero');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Cajero';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('Activo', 'Inactivo', 'Suspendido');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'Activo';
COMMIT;

-- AlterTable
ALTER TABLE "cash_registers" ALTER COLUMN "status" SET DEFAULT 'Abierto';

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'Activo';

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "type" SET DEFAULT 'Regular';

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'Pendiente';

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'Disponible';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" SET DEFAULT 'Cajero',
ALTER COLUMN "status" SET DEFAULT 'Activo';
