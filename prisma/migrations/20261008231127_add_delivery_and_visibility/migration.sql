-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('INSTANT', 'MANUAL');

-- CreateEnum
CREATE TYPE "ProductVisibility" AS ENUM ('BOTH', 'GROUP_ONLY', 'INDIVIDUAL_ONLY');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "delivery" "DeliveryType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "visibility" "ProductVisibility" NOT NULL DEFAULT 'BOTH';
