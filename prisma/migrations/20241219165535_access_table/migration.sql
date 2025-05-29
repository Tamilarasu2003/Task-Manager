-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Access" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "create" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,

    CONSTRAINT "Access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Access_role_key" ON "Access"("role");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "Access"("role") ON DELETE RESTRICT ON UPDATE CASCADE;
