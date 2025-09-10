-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "objectId" TEXT NOT NULL,
    "siteId" TEXT,
    "gearId" TEXT,
    "date" DATETIME NOT NULL,
    "seeing" INTEGER,
    "transparency" INTEGER,
    "moonPhase" INTEGER,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Observation_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "Object" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Observation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Observation_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "Gear" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Observation" ("createdAt", "date", "description", "gearId", "id", "imageUrl", "moonPhase", "objectId", "seeing", "siteId", "transparency") SELECT "createdAt", "date", "description", "gearId", "id", "imageUrl", "moonPhase", "objectId", "seeing", "siteId", "transparency" FROM "Observation";
DROP TABLE "Observation";
ALTER TABLE "new_Observation" RENAME TO "Observation";
CREATE INDEX "Observation_objectId_idx" ON "Observation"("objectId");
CREATE INDEX "Observation_siteId_idx" ON "Observation"("siteId");
CREATE INDEX "Observation_gearId_idx" ON "Observation"("gearId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
