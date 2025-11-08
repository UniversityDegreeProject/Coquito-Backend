-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_variable_weight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price_per_kg" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "product_batches" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "weight" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_batches_batch_code_key" ON "product_batches"("batch_code");

-- CreateIndex
CREATE INDEX "product_batches_product_id_idx" ON "product_batches"("product_id");

-- CreateIndex
CREATE INDEX "product_batches_stock_idx" ON "product_batches"("stock");

-- CreateIndex
CREATE INDEX "product_batches_created_at_idx" ON "product_batches"("created_at");

-- CreateIndex
CREATE INDEX "products_is_variable_weight_idx" ON "products"("is_variable_weight");

-- AddForeignKey
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
