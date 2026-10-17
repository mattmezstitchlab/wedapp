import { z } from "zod";
import { snapshotSchema } from "../lib/wedding-workspace";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { workspaceSnapshots } from "../drizzle/schema";
import { adminProcedure, router } from "./_core/trpc";

const workspaceSchema = z.object({
  eventId: z.number().int().positive().default(1),
  snapshot: snapshotSchema,
});

export const weddingRouter = router({
  workspace: adminProcedure.input(z.object({ eventId: z.number().int().positive().default(1) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { eventId: input.eventId, synced: false, snapshot: null };
    const rows = await db.select().from(workspaceSnapshots).where(eq(workspaceSnapshots.eventId, input.eventId)).orderBy(desc(workspaceSnapshots.updatedAt)).limit(1);
    return { eventId: input.eventId, synced: rows.length > 0, snapshot: rows[0]?.payload ? JSON.parse(rows[0].payload) : null };
  }),
  saveSnapshot: adminProcedure.input(workspaceSchema).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) return { ok: false, eventId: input.eventId, savedAt: new Date().toISOString(), snapshotKeys: Object.keys(input.snapshot) };
    const payload = JSON.stringify(input.snapshot);
    await db.insert(workspaceSnapshots).values({ eventId: input.eventId, payload }).onDuplicateKeyUpdate({ set: { payload } });
    return { ok: true, eventId: input.eventId, savedAt: new Date().toISOString(), snapshotKeys: Object.keys(input.snapshot) };
  }),
});
