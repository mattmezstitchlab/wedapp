import { describe, expect, it } from "vitest";
import {
  assignVendor,
  initialSnapshot,
  parseSnapshot,
  relocateAssignment,
  snapshotSchema,
} from "../lib/wedding-workspace";
import { detectConflicts, getBudget } from "../lib/wedding-rules";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

describe("workspace persistence and assignments", () => {
  it("restores edited data instead of the demo", () => {
    const changed = {
      ...initialSnapshot,
      tasks: [
        {
          id: "custom",
          title: "Test",
          detail: "",
          category: "",
          due: "",
          done: true,
        },
      ],
    };
    expect(parseSnapshot(JSON.stringify(changed))).toEqual(changed);
  });
  it("keeps an empty workspace empty after reload", () => {
    const empty = {
      event: initialSnapshot.event,
      moments: [],
      vendors: [],
      assignments: [],
      tasks: [],
    };
    expect(parseSnapshot(JSON.stringify(empty))).toEqual(empty);
  });
  it("rejects corrupt storage and dangling relationships", () => {
    expect(() => parseSnapshot("not json")).toThrow();
    expect(() => parseSnapshot('{"tasks":true}')).toThrow();
    expect(
      snapshotSchema.safeParse({ ...initialSnapshot, vendors: [] }).success,
    ).toBe(false);
  });
  it("derives new assignment times from the selected moment and avoids duplicates", () => {
    const base = { ...initialSnapshot, assignments: [] };
    const next = assignVendor(base, base.vendors[0].id, "ceremony", "new");
    expect(next.assignments[0]).toMatchObject({
      startTime: "15:00",
      endTime: "17:00",
    });
    expect(
      assignVendor(next, base.vendors[0].id, "ceremony", "duplicate"),
    ).toBe(next);
    expect(assignVendor(base, "missing", "ceremony", "bad")).toBe(base);
  });
  it("moves the assignment with its schedule, preserving id", () => {
    const base = { ...initialSnapshot, assignments: [] };
    const next = assignVendor(base, base.vendors[0].id, "ceremony", "new");
    expect(
      relocateAssignment(next, "new", "party").assignments[0],
    ).toMatchObject({
      id: "new",
      momentId: "party",
      startTime: "23:00",
      endTime: "24:00",
    });
    expect(relocateAssignment(next, "new", "invalid")).toBe(next);
  });
  it("does not double count a vendor and clears the balance when paid", () => {
    const paid = {
      ...initialSnapshot.vendors[0],
      price: 1000,
      status: "Payé" as const,
      confirmed: true,
    };
    const budget = getBudget(
      [paid],
      [
        { ...initialSnapshot.assignments[0], vendorId: paid.id },
        { ...initialSnapshot.assignments[0], id: "second", vendorId: paid.id },
      ],
    );
    expect(budget).toMatchObject({
      estimated: 1000,
      confirmed: 1000,
      deposit: 1000,
      balance: 0,
      assignedCount: 1,
    });
  });
});
describe("private wedding data", () => {
  it("denies anonymous reads and writes before accessing the database", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} },
      res: {},
    } as TrpcContext);
    await expect(
      caller.wedding.workspace({ eventId: 1 }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.wedding.saveSnapshot({ eventId: 1, snapshot: initialSnapshot }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("schedule conflicts", () => {
  const base = initialSnapshot.assignments[0];
  it("detects all nested overlapping bookings", () => {
    const assignments = [
      {
        ...base,
        id: "a",
        momentId: "prep",
        startTime: "09:00",
        endTime: "20:00",
      },
      {
        ...base,
        id: "b",
        momentId: "prep",
        startTime: "10:00",
        endTime: "11:00",
      },
      {
        ...base,
        id: "c",
        momentId: "prep",
        startTime: "12:00",
        endTime: "13:00",
      },
    ];
    expect(
      detectConflicts(
        assignments,
        initialSnapshot.vendors,
        initialSnapshot.moments,
      ),
    ).toHaveLength(2);
  });
  it("handles bookings across midnight without conflating next-day brunch", () => {
    const night = {
      ...base,
      id: "night",
      momentId: "party",
      startTime: "23:00",
      endTime: "01:00",
    };
    const overlap = {
      ...base,
      id: "overlap",
      momentId: "party",
      startTime: "23:30",
      endTime: "02:00",
    };
    const brunch = {
      ...base,
      id: "brunch",
      momentId: "nextday",
      startTime: "11:00",
      endTime: "12:00",
    };
    expect(
      detectConflicts(
        [night, overlap, brunch],
        initialSnapshot.vendors,
        initialSnapshot.moments,
      ),
    ).toHaveLength(1);
  });
});
