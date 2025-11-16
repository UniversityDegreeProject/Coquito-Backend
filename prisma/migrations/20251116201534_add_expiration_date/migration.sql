-- AlterTable
ALTER TABLE "product_batches" ADD COLUMN     "expiration_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "expiration_date" TIMESTAMP(3);
