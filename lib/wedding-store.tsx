import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { trpc } from "./trpc";
import { assignments as seedAssignments, moments as seedMoments, tasks as seedTasks, vendors as seedVendors, type Assignment, type Moment, type Task, type Vendor, type VendorStatus } from "./wedding-data";

const STORAGE_KEY = "grandjour.workspace.v1";

type Snapshot = { moments: Moment[]; vendors: Vendor[]; assignments: Assignment[]; tasks: Task[] };

type WeddingContextValue = Snapshot & {
  selectedVendorId: string | null;
  setSelectedVendorId: (id: string | null) => void;
  addAssignment: (vendorId: string, momentId: string) => void;
  moveAssignment: (assignmentId: string, momentId: string) => void;
  toggleTask: (taskId: string) => void;
  updateVendorStatus: (vendorId: string, status: VendorStatus) => void;
  undo: () => void;
  canUndo: boolean;
  resetDemo: () => void;
};

const initialSnapshot: Snapshot = { moments: seedMoments, vendors: seedVendors, assignments: seedAssignments, tasks: seedTasks };

const WeddingContext = createContext<WeddingContextValue | null>(null);

export function WeddingProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [previous, setPrevious] = useState<Snapshot | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { mutate: persistSnapshot } = trpc.wedding.saveSnapshot.useMutation();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Snapshot;
          if (parsed.moments && parsed.vendors && parsed.assignments && parsed.tasks) setSnapshot(parsed);
        } catch {
          // Keep the seeded workspace when local data is invalid.
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => undefined);
    if (hydrated) persistSnapshot({ eventId: 1, snapshot });
  }, [hydrated, persistSnapshot, snapshot]);

  const commit = useCallback((next: Snapshot) => {
    setPrevious(snapshot);
    setSnapshot(next);
  }, [snapshot]);

  const addAssignment = useCallback((vendorId: string, momentId: string) => {
    if (snapshot.assignments.some((assignment) => assignment.vendorId === vendorId && assignment.momentId === momentId)) return;
    const vendor = snapshot.vendors.find((item) => item.id === vendorId);
    if (!vendor) return;
    commit({ ...snapshot, assignments: [...snapshot.assignments, { id: `assignment-${Date.now()}`, vendorId, momentId, responsibility: vendor.service, startTime: "18:00", endTime: "20:00" }] });
  }, [commit, snapshot]);

  const moveAssignment = useCallback((assignmentId: string, momentId: string) => {
    commit({ ...snapshot, assignments: snapshot.assignments.map((assignment) => assignment.id === assignmentId ? { ...assignment, momentId } : assignment) });
  }, [commit, snapshot]);

  const toggleTask = useCallback((taskId: string) => {
    commit({ ...snapshot, tasks: snapshot.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) });
  }, [commit, snapshot]);

  const updateVendorStatus = useCallback((vendorId: string, status: VendorStatus) => {
    commit({ ...snapshot, vendors: snapshot.vendors.map((vendor) => vendor.id === vendorId ? { ...vendor, status, confirmed: status === "Réservé" || status === "Payé" } : vendor) });
  }, [commit, snapshot]);

  const undo = useCallback(() => {
    if (!previous) return;
    setSnapshot(previous);
    setPrevious(null);
  }, [previous]);

  const resetDemo = useCallback(() => {
    setPrevious(snapshot);
    setSnapshot(initialSnapshot);
  }, [snapshot]);

  const value = useMemo(() => ({ ...snapshot, selectedVendorId, setSelectedVendorId, addAssignment, moveAssignment, toggleTask, updateVendorStatus, undo, canUndo: Boolean(previous), resetDemo }), [addAssignment, moveAssignment, previous, resetDemo, selectedVendorId, snapshot, toggleTask, undo, updateVendorStatus]);
  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) throw new Error("useWedding must be used inside WeddingProvider");
  return context;
}
