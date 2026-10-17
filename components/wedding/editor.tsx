import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { palette } from "./primitives";
import type {
  Task,
  Vendor,
  VendorCategory,
  VendorStatus,
} from "@/lib/wedding-data";
import { eventSchema } from "@/lib/wedding-workspace";
import { useWedding } from "@/lib/wedding-store";

export function Action({
  label,
  onPress,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={{
        padding: 12,
        borderRadius: 12,
        backgroundColor: danger ? palette.coralSoft : palette.slateSoft,
        marginVertical: 4,
      }}
    >
      <Text
        style={{ color: danger ? "#963B24" : palette.slate, fontWeight: "700" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChangeText,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
}) {
  return (
    <View style={{ marginVertical: 7 }}>
      <Text style={{ color: palette.ink, marginBottom: 5 }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={numeric ? "decimal-pad" : "default"}
        style={{
          borderWidth: 1,
          borderColor: palette.line,
          borderRadius: 10,
          padding: 12,
          color: palette.ink,
          backgroundColor: palette.white,
        }}
      />
    </View>
  );
}
function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0008",
          justifyContent: "center",
          alignItems: "center",
          padding: 18,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 560,
            maxHeight: "90%",
            backgroundColor: palette.paper,
            borderRadius: 20,
            padding: 18,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text
              accessibilityRole="header"
              style={{ fontSize: 22, fontWeight: "800", color: palette.ink }}
            >
              {title}
            </Text>
            {children}
            <Action label="Fermer sans enregistrer" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function VendorEditor({
  vendor,
  onClose,
}: {
  vendor?: Vendor;
  onClose: () => void;
}) {
  const { saveVendor, removeVendor } = useWedding();
  const [draft, setDraft] = useState<Vendor>(
    () =>
      vendor ?? {
        id: uid(),
        name: "",
        category: "Lieu",
        service: "",
        status: "À contacter",
        price: 0,
        availability: "À confirmer",
        contact: "",
        phone: "",
        notes: "",
        photo: "",
        confirmed: false,
      },
  );
  const [price, setPrice] = useState(String(draft.price));
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const change = (key: keyof Vendor, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const submit = () => {
    const amount = Number(price.replace(",", "."));
    if (
      !draft.name.trim() ||
      !draft.service.trim() ||
      !price.trim() ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setError("Indiquez un nom, une prestation et un montant positif ou nul.");
      return;
    }
    saveVendor({
      ...draft,
      name: draft.name.trim(),
      service: draft.service.trim(),
      price: amount,
      confirmed: draft.status === "Réservé" || draft.status === "Payé",
    });
    onClose();
  };
  return (
    <Sheet
      title={vendor ? "Modifier le prestataire" : "Nouveau prestataire"}
      onClose={onClose}
    >
      <Field
        label="Nom"
        value={draft.name}
        onChangeText={(v) => change("name", v)}
      />
      <Text>Catégorie</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
        {(
          [
            "Lieu",
            "Traiteur",
            "Image",
            "Musique",
            "Fleurs",
            "Beauté",
          ] as VendorCategory[]
        ).map((category) => (
          <Action
            key={category}
            label={`${draft.category === category ? "✓ " : ""}${category}`}
            onPress={() => change("category", category)}
          />
        ))}
      </View>
      <Field
        label="Prestation"
        value={draft.service}
        onChangeText={(v) => change("service", v)}
      />
      <Field
        label="Prix estimé (€)"
        value={price}
        onChangeText={setPrice}
        numeric
      />
      <Text>Statut</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
        {(
          [
            "À rechercher",
            "À contacter",
            "Devis demandé",
            "Option",
            "Réservé",
            "Payé",
          ] as VendorStatus[]
        ).map((status) => (
          <Action
            key={status}
            label={`${draft.status === status ? "✓ " : ""}${status}`}
            onPress={() => change("status", status)}
          />
        ))}
      </View>
      <Field
        label="Contact"
        value={draft.contact}
        onChangeText={(v) => change("contact", v)}
      />
      <Field
        label="Téléphone"
        value={draft.phone}
        onChangeText={(v) => change("phone", v)}
      />
      <Field
        label="Disponibilité"
        value={draft.availability}
        onChangeText={(v) => change("availability", v)}
      />
      <Field
        label="Notes"
        value={draft.notes}
        onChangeText={(v) => change("notes", v)}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: "#963B24" }}>
          {error}
        </Text>
      )}
      <Action label="Enregistrer le prestataire" onPress={submit} />
      {vendor && (
        <Action
          danger
          label={
            confirmDelete
              ? "Confirmer la suppression et retirer ses affectations"
              : "Supprimer le prestataire"
          }
          onPress={() => {
            if (confirmDelete) {
              removeVendor(vendor.id);
              onClose();
            } else setConfirmDelete(true);
          }}
        />
      )}
    </Sheet>
  );
}
export function TaskEditor({
  task,
  onClose,
}: {
  task?: Task;
  onClose: () => void;
}) {
  const { saveTask, removeTask } = useWedding();
  const [draft, setDraft] = useState<Task>(
    () =>
      task ?? {
        id: uid(),
        title: "",
        detail: "",
        category: "Organisation",
        due: "",
        done: false,
      },
  );
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const change = (key: keyof Task, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  return (
    <Sheet
      title={task ? "Modifier la tâche" : "Nouvelle tâche"}
      onClose={onClose}
    >
      <Field
        label="Titre"
        value={draft.title}
        onChangeText={(v) => change("title", v)}
      />
      <Field
        label="Détails"
        value={draft.detail}
        onChangeText={(v) => change("detail", v)}
      />
      <Field
        label="Échéance"
        value={draft.due}
        onChangeText={(v) => change("due", v)}
      />
      <Field
        label="Catégorie"
        value={draft.category}
        onChangeText={(v) => change("category", v)}
      />
      <Action
        label={draft.urgent ? "✓ Prioritaire" : "Marquer comme prioritaire"}
        onPress={() =>
          setDraft((current) => ({ ...current, urgent: !current.urgent }))
        }
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: "#963B24" }}>
          {error}
        </Text>
      )}
      <Action
        label="Enregistrer la tâche"
        onPress={() => {
          if (!draft.title.trim()) {
            setError("Indiquez le titre de la tâche.");
            return;
          }
          saveTask({ ...draft, title: draft.title.trim() });
          onClose();
        }}
      />
      {task && (
        <Action
          danger
          label={
            confirmDelete ? "Confirmer la suppression" : "Supprimer la tâche"
          }
          onPress={() => {
            if (confirmDelete) {
              removeTask(task.id);
              onClose();
            } else setConfirmDelete(true);
          }}
        />
      )}
    </Sheet>
  );
}

export function EventEditor({ onClose }: { onClose: () => void }) {
  const { event, saveEvent } = useWedding();
  const [draft, setDraft] = useState(event);
  const [error, setError] = useState("");
  return (
    <Sheet title="Votre mariage" onClose={onClose}>
      <Field
        label="Nom du mariage"
        value={draft.name}
        onChangeText={(name) => setDraft({ ...draft, name })}
      />
      <Field
        label="Date (AAAA-MM-JJ)"
        value={draft.date}
        onChangeText={(date) => setDraft({ ...draft, date })}
      />
      <Field
        label="Lieu"
        value={draft.location}
        onChangeText={(location) => setDraft({ ...draft, location })}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: "#963B24" }}>
          {error}
        </Text>
      )}
      <Action
        label="Enregistrer le mariage"
        onPress={() => {
          const result = eventSchema.safeParse({
            ...draft,
            name: draft.name.trim(),
          });
          if (!result.success) {
            setError("Vérifiez le nom et la date (AAAA-MM-JJ).");
            return;
          }
          saveEvent(result.data);
          onClose();
        }}
      />
    </Sheet>
  );
}
