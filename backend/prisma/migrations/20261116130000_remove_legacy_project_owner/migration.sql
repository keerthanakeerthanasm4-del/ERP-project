-- The former lead_user_id value has been backfilled to projectLeadId.
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_lead_user_id_fkey";
ALTER TABLE "Project" DROP COLUMN IF EXISTS "lead_user_id";
