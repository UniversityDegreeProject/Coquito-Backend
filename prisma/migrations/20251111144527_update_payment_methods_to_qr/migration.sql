/*
  Warnings:

  - The values [Transferencia,Multiplo] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `transfer_sales` on the `cash_registers` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_sales` on the `daily_sales_reports` table. All the data in the column will be lost.
  - Added the required column `qr_sales` to the `daily_sales_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('Efectivo', 'Tarjeta', 'QR');
ALTER TABLE "orders" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "cash_registers" DROP COLUMN "transfer_sales",
ADD COLUMN     "qr_sales" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "daily_sales_reports" DROP COLUMN "transfer_sales",
ADD COLUMN     "qr_sales" DECIMAL(10,2) NOT NULL;
