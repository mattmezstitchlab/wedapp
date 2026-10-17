import { z } from "zod";
import { assignments, moments, tasks, vendors } from "./wedding-data";

const id = z.string().min(1);
export const vendorSchema = z.object({
  id,
  name: z.string().min(1),
  category: z.enum([
    "Lieu",
    "Traiteur",
    "Image",
    "Musique",
    "Fleurs",
    "Beauté",
  ]),
  service: z.string().min(1),
  status: z.enum([
    "À rechercher",
    "À contacter",
    "Devis demandé",
    "Option",
    "Réservé",
    "Payé",
  ]),
  price: z.number().finite().nonnegative(),
  availability: z.string(),
  contact: z.string(),
  phone: z.string(),
  notes: z.string(),
  photo: z.string(),
  confirmed: z.boolean(),
});
export const taskSchema = z.object({
  id,
  title: z.string().min(1),
  detail: z.string(),
  due: z.string(),
  category: z.string(),
  done: z.boolean(),
  urgent: z.boolean().optional(),
});
export const eventSchema = z.object({
  name: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T12:00:00Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Date invalide"),
  location: z.string(),
});
export const snapshotSchema = z
  .object({
    event: eventSchema.default({
      name: "Mariage d’Élise & Thomas",
      date: "2025-06-14",
      location: "Domaine des Pins · Provence",
    }),
    moments: z.array(
      z.object({
        id,
        title: z.string(),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        subtitle: z.string(),
        accent: z.string(),
      }),
    ),
    vendors: z.array(vendorSchema),
    assignments: z.array(
      z.object({
        id,
        vendorId: id,
        momentId: id,
        responsibility: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
    tasks: z.array(taskSchema),
  })
  .superRefine((value, ctx) => {
    for (const key of ["moments", "vendors", "assignments", "tasks"] as const) {
      if (new Set(value[key].map((item) => item.id)).size !== value[key].length)
        ctx.addIssue({
          code: "custom",
          message: "Identifiants dupliqués",
          path: [key],
        });
    }
    if (
      value.assignments.some(
        (a) =>
          !value.vendors.some((v) => v.id === a.vendorId) ||
          !value.moments.some((m) => m.id === a.momentId),
      )
    )
      ctx.addIssue({ code: "custom", message: "Affectation invalide" });
  });
export type Snapshot = z.infer<typeof snapshotSchema>;
export const initialSnapshot: Snapshot = snapshotSchema.parse({
  moments,
  vendors,
  assignments,
  tasks,
});

export function parseSnapshot(raw: string | null): Snapshot {
  if (!raw) return initialSnapshot;
  const parsed = snapshotSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("Sauvegarde invalide");
  return parsed.data;
}

export function assignVendor(
  snapshot: Snapshot,
  vendorId: string,
  momentId: string,
  assignmentId: string,
): Snapshot {
  const vendor = snapshot.vendors.find((v) => v.id === vendorId);
  const index = snapshot.moments.findIndex((m) => m.id === momentId);
  if (
    !vendor ||
    index < 0 ||
    snapshot.assignments.some(
      (a) => a.vendorId === vendorId && a.momentId === momentId,
    )
  )
    return snapshot;
  const startTime = snapshot.moments[index].time;
  const nextTime = snapshot.moments[index + 1]?.time;
  const endTime = nextTime && nextTime > startTime ? nextTime : "24:00";
  return {
    ...snapshot,
    assignments: [
      ...snapshot.assignments,
      {
        id: assignmentId,
        vendorId,
        momentId,
        responsibility: vendor.service,
        startTime,
        endTime,
      },
    ],
  };
}

export function relocateAssignment(
  snapshot: Snapshot,
  assignmentId: string,
  momentId: string,
): Snapshot {
  const assignment = snapshot.assignments.find((a) => a.id === assignmentId);
  if (!assignment || assignment.momentId === momentId) return snapshot;
  const without = {
    ...snapshot,
    assignments: snapshot.assignments.filter((a) => a.id !== assignmentId),
  };
  const next = assignVendor(
    without,
    assignment.vendorId,
    momentId,
    assignmentId,
  );
  return next === without ? snapshot : next;
}
