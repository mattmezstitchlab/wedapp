import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { Task, Vendor, VendorStatus } from "./wedding-data";
import {
  assignVendor,
  initialSnapshot,
  parseSnapshot,
  relocateAssignment,
  type Snapshot,
} from "./wedding-workspace";

const STORAGE_KEY = "grandjour.workspace.v1";
const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
type State = { snapshot: Snapshot; previous: Snapshot | null };
type WeddingContextValue = Snapshot & {
  saveEvent: (event: Snapshot["event"]) => void;
  hydrated: boolean;
  storageMessage: string;
  selectedVendorId: string | null;
  setSelectedVendorId: (id: string | null) => void;
  addAssignment: (vendorId: string, momentId: string) => void;
  moveAssignment: (assignmentId: string, momentId: string) => void;
  removeAssignment: (assignmentId: string) => void;
  saveVendor: (vendor: Vendor) => void;
  removeVendor: (vendorId: string) => void;
  saveTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  updateVendorStatus: (vendorId: string, status: VendorStatus) => void;
  undo: () => void;
  canUndo: boolean;
  resetDemo: () => void;
};
const WeddingContext = createContext<WeddingContextValue | null>(null);

export function WeddingProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<State>({
    snapshot: initialSnapshot,
    previous: null,
  });
  const { snapshot, previous } = state;
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [storageMessage, setStorageMessage] = useState(
    "Chargement de la sauvegarde…",
  );
  const writes = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const restored = parseSnapshot(raw);
        if (active) setState({ snapshot: restored, previous: null });
      })
      .catch(() => {
        if (active)
          setStorageMessage(
            "Sauvegarde illisible ou inaccessible. Vos changements ne seront pas enregistrés tant que vous n’aurez pas rechargé ou réinitialisé l’espace.",
          );
        // Do not overwrite unreadable data. Reset is an explicit recovery action.
      })
      .then(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || storageMessage.startsWith("Sauvegarde illisible")) return;
    let active = true;
    setStorageMessage("Enregistrement sur cet appareil…");
    // Serialize writes so an older asynchronous write cannot overwrite a newer one.
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)))
      .then(() => {
        if (active)
          setStorageMessage(
            "Enregistré sur cet appareil uniquement · pas de synchronisation cloud",
          );
      })
      .catch(() => {
        if (active)
          setStorageMessage(
            "Échec de sauvegarde sur cet appareil. Gardez cette page ouverte et vérifiez l’espace de stockage.",
          );
      });
    return () => {
      active = false;
    };
    // Only data changes should trigger a write, not status messages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, snapshot]);

  const commit = useCallback(
    (transform: (current: Snapshot) => Snapshot) => {
      if (!hydrated) return;
      setState((current) => {
        const next = transform(current.snapshot);
        return next === current.snapshot
          ? current
          : { snapshot: next, previous: current.snapshot };
      });
    },
    [hydrated],
  );
  const saveEvent = useCallback(
    (event: Snapshot["event"]) => commit((current) => ({ ...current, event })),
    [commit],
  );
  const addAssignment = useCallback(
    (vendorId: string, momentId: string) => {
      const id = uniqueId();
      commit((current) => assignVendor(current, vendorId, momentId, id));
    },
    [commit],
  );
  const moveAssignment = useCallback(
    (id: string, momentId: string) =>
      commit((current) => relocateAssignment(current, id, momentId)),
    [commit],
  );
  const removeAssignment = useCallback(
    (id: string) =>
      commit((current) => ({
        ...current,
        assignments: current.assignments.filter((a) => a.id !== id),
      })),
    [commit],
  );
  const saveVendor = useCallback(
    (vendor: Vendor) =>
      commit((current) => ({
        ...current,
        vendors: current.vendors.some((v) => v.id === vendor.id)
          ? current.vendors.map((v) => (v.id === vendor.id ? vendor : v))
          : [...current.vendors, vendor],
      })),
    [commit],
  );
  const removeVendor = useCallback(
    (id: string) => {
      commit((current) => ({
        ...current,
        vendors: current.vendors.filter((v) => v.id !== id),
        assignments: current.assignments.filter((a) => a.vendorId !== id),
      }));
      setSelectedVendorId((selected) => (selected === id ? null : selected));
    },
    [commit],
  );
  const saveTask = useCallback(
    (task: Task) =>
      commit((current) => ({
        ...current,
        tasks: current.tasks.some((t) => t.id === task.id)
          ? current.tasks.map((t) => (t.id === task.id ? task : t))
          : [...current.tasks, task],
      })),
    [commit],
  );
  const removeTask = useCallback(
    (id: string) =>
      commit((current) => ({
        ...current,
        tasks: current.tasks.filter((t) => t.id !== id),
      })),
    [commit],
  );
  const toggleTask = useCallback(
    (id: string) =>
      commit((current) => ({
        ...current,
        tasks: current.tasks.map((t) =>
          t.id === id ? { ...t, done: !t.done } : t,
        ),
      })),
    [commit],
  );
  const updateVendorStatus = useCallback(
    (id: string, status: VendorStatus) =>
      commit((current) => ({
        ...current,
        vendors: current.vendors.map((v) =>
          v.id === id
            ? {
                ...v,
                status,
                confirmed: status === "Réservé" || status === "Payé",
              }
            : v,
        ),
      })),
    [commit],
  );
  const undo = useCallback(
    () =>
      setState((current) =>
        current.previous
          ? { snapshot: current.previous, previous: null }
          : current,
      ),
    [],
  );
  const resetDemo = useCallback(() => {
    setStorageMessage("Réinitialisation…");
    commit(() => parseSnapshot(JSON.stringify(initialSnapshot)));
    setSelectedVendorId(null);
  }, [commit]);
  const value = useMemo(
    () => ({
      ...snapshot,
      saveEvent,
      hydrated,
      storageMessage,
      selectedVendorId,
      setSelectedVendorId,
      addAssignment,
      moveAssignment,
      removeAssignment,
      saveVendor,
      removeVendor,
      saveTask,
      removeTask,
      toggleTask,
      updateVendorStatus,
      undo,
      canUndo: Boolean(previous),
      resetDemo,
    }),
    [
      snapshot,
      saveEvent,
      hydrated,
      storageMessage,
      selectedVendorId,
      addAssignment,
      moveAssignment,
      removeAssignment,
      saveVendor,
      removeVendor,
      saveTask,
      removeTask,
      toggleTask,
      updateVendorStatus,
      undo,
      previous,
      resetDemo,
    ],
  );
  return (
    <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
  );
}
export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context)
    throw new Error("useWedding must be used inside WeddingProvider");
  return context;
}
