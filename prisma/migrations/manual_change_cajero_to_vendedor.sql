-- AlterEnum: Change Cajero to Vendedor in UserRole
-- First, update all existing users from Cajero to Vendedor
UPDATE "users" SET role = 'Vendedor' WHERE role = 'Cajero';

-- Then alter the enum
ALTER TYPE "UserRole" RENAME VALUE 'Cajero' TO 'Vendedor';
