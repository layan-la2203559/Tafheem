import { okMessage, handleError } from "@/lib/errors";
import { requireRole } from "@/lib/guards/requireRole";
import { createServiceClient } from "@/lib/supabase/server";
import { deleteKeyword } from "@/lib/services/moderation.service";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Removing keywords is admin-only.
    await requireRole(req, "admin");
    const db = createServiceClient();
    await deleteKeyword(db, params.id);
    return okMessage("Keyword removed");
  } catch (err) {
    return handleError(err);
  }
}
