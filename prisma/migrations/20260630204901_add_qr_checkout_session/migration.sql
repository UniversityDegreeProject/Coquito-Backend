-- CreateEnum
CREATE TYPE "QrCheckoutStatus" AS ENUM ('Reservado', 'Completado', 'Cancelado');

-- CreateTable
CREATE TABLE "qr_checkout_sessions" (
    "id" TEXT NOT NULL,
    "codigo_recaudacion" TEXT NOT NULL,
    "id_transaccion" TEXT,
    "identificador_deuda" TEXT,
    "user_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "cash_register_id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "status" "QrCheckoutStatus" NOT NULL DEFAULT 'Reservado',
    "sale_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_checkout_sessions_codigo_recaudacion_key" ON "qr_checkout_sessions"("codigo_recaudacion");

-- CreateIndex
CREATE UNIQUE INDEX "qr_checkout_sessions_sale_id_key" ON "qr_checkout_sessions"("sale_id");

-- CreateIndex
CREATE INDEX "qr_checkout_sessions_status_idx" ON "qr_checkout_sessions"("status");

-- CreateIndex
CREATE INDEX "qr_checkout_sessions_created_at_idx" ON "qr_checkout_sessions"("created_at");
