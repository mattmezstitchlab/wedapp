import type { Assignment, Moment, Task, Vendor } from "./wedding-data";

export function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function getBudget(vendors: Vendor[], assignments: Assignment[]) {
  const assignedVendorIds = new Set(assignments.map((assignment) => assignment.vendorId));
  const estimated = vendors.reduce((sum, vendor) => sum + vendor.price, 0);
  const confirmed = vendors.filter((vendor) => vendor.confirmed).reduce((sum, vendor) => sum + vendor.price, 0);
  const deposit = Math.round(confirmed * 0.3);
  const assigned = vendors.filter((vendor) => assignedVendorIds.has(vendor.id));
  const missing = vendors.filter((vendor) => !vendor.confirmed || vendor.status === "À rechercher");
  return { estimated, confirmed, deposit, balance: confirmed - deposit, assignedCount: assigned.length, missing };
}

export function consolidateNeeds(vendors: Vendor[], assignments: Assignment[]) {
  const unique = new Map<string, { label: string; category: string; count: number; ready: boolean }>();
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
    const vendor = vendors.find((candidate) => candidate.id === assignment.vendorId);
    if (!vendor) return;
    const key = `${vendor.category}:${vendor.service}`.toLowerCase();
    const current = unique.get(key);
    if (current) current.count = Math.max(current.count, 1);
  });
  return Array.from(unique.values());
}

export function detectConflicts(assignments: Assignment[], vendors: Vendor[], moments: Moment[]) {
  const conflicts: { id: string; title: string; detail: string }[] = [];
  const byVendor = new Map<string, Assignment[]>();
  assignments.forEach((assignment) => {
    const list = byVendor.get(assignment.vendorId) ?? [];
    list.push(assignment);
    byVendor.set(assignment.vendorId, list);
  });
  byVendor.forEach((list, vendorId) => {
    if (list.length < 2) return;
    const sorted = [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let index = 1; index < sorted.length; index += 1) {
      if (sorted[index - 1].endTime > sorted[index].startTime) {
        const vendor = vendors.find((candidate) => candidate.id === vendorId);
        conflicts.push({ id: `${vendorId}-${index}`, title: "Chevauchement à vérifier", detail: `${vendor?.name ?? "Prestataire"} est affecté à deux moments proches.` });
      }
    }
  });
  return conflicts;
}

export function getProgress(vendors: Vendor[], assignments: Assignment[], tasks: Task[]) {
  const booked = vendors.filter((vendor) => vendor.confirmed).length;
  const completedTasks = tasks.filter((task) => task.done).length;
  const coverage = vendors.length ? Math.round((booked / vendors.length) * 100) : 0;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const assignmentProgress = vendors.length ? Math.min(100, Math.round((assignments.length / vendors.length) * 100)) : 0;
  return Math.round((coverage + taskProgress + assignmentProgress) / 3);
}
