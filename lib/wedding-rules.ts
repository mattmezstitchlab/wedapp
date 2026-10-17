import type { Assignment, Moment, Task, Vendor } from "./wedding-data";

export function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getBudget(vendors: Vendor[], assignments: Assignment[]) {
  const assignedVendorIds = new Set(
    assignments.map((assignment) => assignment.vendorId),
  );
  const estimated = vendors.reduce((sum, vendor) => sum + vendor.price, 0);
  const confirmed = vendors
    .filter((vendor) => vendor.confirmed)
    .reduce((sum, vendor) => sum + vendor.price, 0);
  const paid = vendors
    .filter((vendor) => vendor.status === "Payé")
    .reduce((sum, vendor) => sum + vendor.price, 0);
  const deposit = paid + Math.round((confirmed - paid) * 0.3);
  const assigned = vendors.filter((vendor) => assignedVendorIds.has(vendor.id));
  const missing = vendors.filter(
    (vendor) => !vendor.confirmed || vendor.status === "À rechercher",
  );
  return {
    estimated,
    confirmed,
    deposit,
    balance: confirmed - deposit,
    assignedCount: assigned.length,
    missing,
  };
}

export function consolidateNeeds(vendors: Vendor[], assignments: Assignment[]) {
  const unique = new Map<
    string,
    { label: string; category: string; count: number; ready: boolean }
  >();
  vendors.forEach((vendor) => {
    const key = `${vendor.category}:${vendor.service}`.toLowerCase();
    const current = unique.get(key);
    unique.set(key, {
      label: vendor.service,
      category: vendor.category,
      count: (current?.count ?? 0) + 1,
      ready: Boolean(current?.ready || vendor.confirmed),
    });
  });
  assignments.forEach((assignment) => {
    const vendor = vendors.find(
      (candidate) => candidate.id === assignment.vendorId,
    );
    if (!vendor) return;
    const key = `${vendor.category}:${vendor.service}`.toLowerCase();
    const current = unique.get(key);
    if (current) current.count = Math.max(current.count, 1);
  });
  return Array.from(unique.values());
}

export function detectConflicts(
  assignments: Assignment[],
  vendors: Vendor[],
  moments: Moment[],
) {
  const conflicts: { id: string; title: string; detail: string }[] = [];
  const minutes = (time: string) => {
    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
  };
  // A descending moment time starts the next day (e.g. party at 23:00, brunch at 11:00).
  const offsets = new Map<string, number>();
  let day = 0;
  moments.forEach((moment, index) => {
    if (index > 0 && minutes(moment.time) < minutes(moments[index - 1].time))
      day += 1440;
    offsets.set(moment.id, day);
  });
  const windows = assignments.map((assignment) => {
    const offset = offsets.get(assignment.momentId) ?? 0;
    const start = minutes(assignment.startTime) + offset;
    let end = minutes(assignment.endTime) + offset;
    if (end < start) end += 1440;
    return { ...assignment, start, end };
  });
  for (let index = 0; index < windows.length; index += 1) {
    for (let other = index + 1; other < windows.length; other += 1) {
      const a = windows[index];
      const b = windows[other];
      if (a.vendorId !== b.vendorId || a.start >= b.end || b.start >= a.end)
        continue;
      const vendor = vendors.find((candidate) => candidate.id === a.vendorId);
      conflicts.push({
        id: `${a.id}-${b.id}`,
        title: "Chevauchement à vérifier",
        detail: `${vendor?.name ?? "Prestataire"} est affecté à deux créneaux qui se chevauchent.`,
      });
    }
  }
  return conflicts;
}

export function getProgress(
  vendors: Vendor[],
  assignments: Assignment[],
  tasks: Task[],
) {
  const booked = vendors.filter((vendor) => vendor.confirmed).length;
  const completedTasks = tasks.filter((task) => task.done).length;
  const coverage = vendors.length
    ? Math.round((booked / vendors.length) * 100)
    : 0;
  const taskProgress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const assignmentProgress = vendors.length
    ? Math.min(100, Math.round((assignments.length / vendors.length) * 100))
    : 0;
  return Math.round((coverage + taskProgress + assignmentProgress) / 3);
}
