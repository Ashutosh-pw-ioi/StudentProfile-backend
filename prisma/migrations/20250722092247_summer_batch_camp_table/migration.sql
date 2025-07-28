-- CreateTable
CREATE TABLE "summerCampBatch" (
    "id" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,

    CONSTRAINT "summerCampBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "summerCampBatch_contactNumber_key" ON "summerCampBatch"("contactNumber");
