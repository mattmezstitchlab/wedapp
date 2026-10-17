import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Card, IconButton, Pill, SectionLabel, palette } from "@/components/wedding/primitives";
import { Action, EventEditor } from "@/components/wedding/editor";
import { type VendorStatus } from "@/lib/wedding-data";
import { detectConflicts, formatEuro, getBudget, getProgress } from "@/lib/wedding-rules";
import { useWedding } from "@/lib/wedding-store";

const statusTone: Record<VendorStatus, "default" | "success" | "warning" | "coral"> = {
  "À rechercher": "coral",
  "À contacter": "warning",
  "Devis demandé": "warning",
  Option: "default",
  Réservé: "success",
  Payé: "success",
};

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const { event, moments, vendors, assignments, tasks, selectedVendorId, setSelectedVendorId, addAssignment, moveAssignment, removeAssignment, storageMessage, resetDemo, undo, canUndo } = useWedding();
  const [editingEvent, setEditingEvent] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [notice, setNotice] = useState("Touchez un prestataire puis un moment pour l’affecter.");
  const eventDate = new Date(`${event.date}T12:00:00`);
  const daysToGo = Math.ceil((new Date(`${event.date}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId);
  const budget = useMemo(() => getBudget(vendors, assignments), [assignments, vendors]);
  const conflicts = useMemo(() => detectConflicts(assignments, vendors, moments), [assignments, moments, vendors]);
  const progress = useMemo(() => getProgress(vendors, assignments, tasks), [assignments, tasks, vendors]);

  const handleMomentPress = (momentId: string) => {
    setActiveMomentId(momentId);
    if (!selectedVendorId) {
      setNotice("Choisissez d’abord une carte prestataire dans la bibliothèque ou le planning.");
      return;
    }
    addAssignment(selectedVendorId, momentId);
    const moment = moments.find((item) => item.id === momentId);
    setNotice(`${selectedVendor?.name ?? "La ressource"} est affecté à ${moment?.title ?? "ce moment"}.`);
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 14) }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandLine}><View style={styles.brandMark}><Text style={styles.brandMarkText}>GJ</Text></View><View><Text style={styles.eyebrow}>LE GRAND JOUR</Text><Text style={styles.eventName}>{event.name}</Text></View></View>
          <View style={styles.headerActions}><IconButton icon="notifications-none" label="Voir les tâches" onPress={() => router.push("/tasks")} /><IconButton icon="more-horiz" label="Plus d’options" onPress={() => setShowOptions(!showOptions)} /></View>
        </View>

        <Text accessibilityLiveRegion="polite" style={styles.notice}>{storageMessage}</Text>
        {showOptions && <Card><Action label="Personnaliser le mariage" onPress={() => setEditingEvent(true)} /><Text>Les données d’exemple sont modifiables. Les comptes et la collaboration cloud ne sont pas configurés.</Text><Action danger label={confirmReset ? "Confirmer la réinitialisation de cet appareil" : "Réinitialiser les données d’exemple"} onPress={() => { if (confirmReset) { resetDemo(); setConfirmReset(false); setShowOptions(false); } else setConfirmReset(true); }} /></Card>}
        <View style={styles.contextRow}><View><Text style={styles.date}>{eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</Text><Text style={styles.location}>{event.location}</Text></View><View style={styles.dayBadge}><Text style={styles.dayNumber}>{Math.abs(daysToGo)}</Text><Text style={styles.dayLabel}>{daysToGo < 0 ? "PASSÉS" : "JOURS"}</Text></View></View>

        <Card style={styles.progressCard}>
          <View style={styles.progressTop}><View><Text style={styles.progressKicker}>VOTRE ÉLAN</Text><Text style={styles.progressTitle}>Le prochain geste est déjà là.</Text></View><Text style={styles.progressValue}>{progress}%</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
          <View style={styles.progressBottom}><Text style={styles.progressCaption}>{budget.assignedCount} prestataires positionnés</Text><Text style={styles.progressCaption}>{tasks.filter((task) => task.done).length}/{tasks.length} tâches faites</Text></View>
        </Card>

        {conflicts.length > 0 && <Card style={styles.alertCard}><View style={styles.alertIcon}><MaterialIcons name="priority-high" color={palette.coral} size={18} /></View><View style={{ flex: 1 }}><Text style={styles.alertTitle}>{conflicts.length} point à vérifier</Text><Text style={styles.alertText}>{conflicts[0].detail}</Text></View><MaterialIcons name="chevron-right" color={palette.coral} size={22} /></Card>}

        <View style={styles.sectionHeader}><SectionLabel action={canUndo ? "Annuler" : undefined} onAction={undo}>JOUR J · TIMELINE</SectionLabel><Pressable onPress={() => router.push("/library")}><Text style={styles.textButton}>+ Ressource</Text></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeline}>
          {moments.map((moment) => {
            const momentAssignments = assignments.filter((assignment) => assignment.momentId === moment.id);
            return <Pressable key={moment.id} onPress={() => handleMomentPress(moment.id)} style={({ pressed }) => [styles.momentCard, pressed && styles.momentPressed, selectedVendorId && styles.momentReady]}>
              <View style={[styles.momentAccent, { backgroundColor: moment.accent }]} /><Text style={styles.momentTime}>{moment.time}</Text><Text style={styles.momentTitle}>{moment.title}</Text><Text style={styles.momentSubtitle}>{moment.subtitle}</Text>
              <View style={styles.momentPeople}>{momentAssignments.slice(0, 3).map((assignment) => { const vendor = vendors.find((item) => item.id === assignment.vendorId); return <Avatar key={assignment.id} source={vendor ? { uri: vendor.photo } : undefined} size={28} initials={vendor?.name.slice(0, 2).toUpperCase()} />; })}{momentAssignments.length === 0 && <View style={styles.addCircle}><MaterialIcons name="add" color={palette.slate} size={17} /></View>}</View>
              <Text style={styles.momentCount}>{momentAssignments.length ? `${momentAssignments.length} ressource${momentAssignments.length > 1 ? "s" : ""}` : "Ajouter"}</Text>
            </Pressable>;
          })}
        </ScrollView>

        <View style={styles.sectionHeader}><SectionLabel>À L’INTÉRIEUR DU MOMENT</SectionLabel><Pressable onPress={() => router.push("/library")}><Text style={styles.textButton}>Voir la bibliothèque</Text></Pressable></View>
        {selectedVendor ? <Card style={styles.selectedCard} onPress={() => router.push("/library")}><View style={styles.selectedTop}><Avatar source={{ uri: selectedVendor.photo }} size={54} /><View style={{ flex: 1, marginLeft: 12 }}><View style={styles.vendorNameRow}><Text style={styles.vendorName}>{selectedVendor.name}</Text><Pill tone={statusTone[selectedVendor.status]}>{selectedVendor.status}</Pill></View><Text style={styles.vendorService}>{selectedVendor.service}</Text></View><IconButton icon="close" label="Fermer la sélection" onPress={() => setSelectedVendorId(null)} /></View><View style={styles.selectedMeta}><View><Text style={styles.metaLabel}>PRESTATION</Text><Text style={styles.metaValue}>{selectedVendor.contact}</Text></View><View><Text style={styles.metaLabel}>BUDGET</Text><Text style={styles.metaValue}>{formatEuro(selectedVendor.price)}</Text></View><View><Text style={styles.metaLabel}>DISPONIBILITÉ</Text><Text style={styles.metaValue} numberOfLines={1}>{selectedVendor.availability}</Text></View></View><Text style={styles.notice}>{notice}</Text></Card> : <Card style={styles.emptyCard} onPress={() => router.push("/library")}><View style={styles.emptyIcon}><MaterialIcons name="touch-app" size={22} color={palette.slate} /></View><View style={{ flex: 1 }}><Text style={styles.emptyTitle}>Composez votre journée</Text><Text style={styles.emptyText}>{notice}</Text></View><MaterialIcons name="arrow-forward" size={20} color={palette.slate} /></Card>}

        <SectionLabel>AFFECTATIONS {activeMomentId ? `· ${moments.find((m) => m.id === activeMomentId)?.title}` : "· TOUS LES MOMENTS"}</SectionLabel>
        {activeMomentId && <Action label="Voir tous les moments" onPress={() => setActiveMomentId(null)} />}
        {assignments.filter((a) => !activeMomentId || a.momentId === activeMomentId).map((assignment) => <Card key={assignment.id} style={{ marginBottom: 10 }}>
          <Text style={styles.vendorName}>{vendors.find((v) => v.id === assignment.vendorId)?.name}</Text>
          <Text style={styles.vendorService}>{moments.find((m) => m.id === assignment.momentId)?.title} · {assignment.startTime}–{assignment.endTime}</Text>
          <Text style={styles.metaLabel}>DÉPLACER VERS</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>{moments.filter((m) => m.id !== assignment.momentId).map((moment) => <Action key={moment.id} label={moment.title} onPress={() => moveAssignment(assignment.id, moment.id)} />)}</View>
          <Action danger label="Retirer du planning" onPress={() => removeAssignment(assignment.id)} />
        </Card>)}
        <View style={styles.bottomMetrics}><View style={styles.metricBlock}><Text style={styles.metricLabel}>BUDGET ENGAGÉ</Text><Text style={styles.metricValue}>{formatEuro(budget.confirmed)}</Text><Text style={styles.metricCaption}>sur {formatEuro(budget.estimated)}</Text></View><View style={styles.verticalRule} /><View style={styles.metricBlock}><Text style={styles.metricLabel}>À CONFIRMER</Text><Text style={[styles.metricValue, { color: palette.coral }]}>{budget.missing.length}</Text><Text style={styles.metricCaption}>informations manquantes</Text></View></View>
      </ScrollView>
      {editingEvent && <EventEditor onClose={() => setEditingEvent(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper }, content: { paddingHorizontal: 18, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }, brandLine: { flexDirection: "row", alignItems: "center" }, brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: palette.slate, alignItems: "center", justifyContent: "center", marginRight: 10 }, brandMarkText: { color: palette.white, fontSize: 12, fontWeight: "900", letterSpacing: -0.5 }, eyebrow: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.7 }, eventName: { color: palette.ink, fontSize: 15, fontWeight: "800", marginTop: 3 }, headerActions: { flexDirection: "row", gap: 8 }, contextRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }, date: { color: palette.ink, fontSize: 25, fontWeight: "800", letterSpacing: -0.6 }, location: { color: palette.muted, fontSize: 13, marginTop: 4 }, dayBadge: { backgroundColor: palette.coralSoft, borderRadius: 18, width: 58, height: 58, alignItems: "center", justifyContent: "center" }, dayNumber: { color: palette.coral, fontSize: 21, fontWeight: "900" }, dayLabel: { color: palette.coral, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  progressCard: { backgroundColor: palette.slate, borderColor: palette.slate, marginBottom: 12 }, progressTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, progressKicker: { color: "#B9C5CE", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }, progressTitle: { color: palette.white, fontSize: 17, fontWeight: "800", marginTop: 5 }, progressValue: { color: palette.white, fontSize: 26, fontWeight: "900" }, progressTrack: { height: 8, borderRadius: 5, backgroundColor: "#607284", overflow: "hidden", marginTop: 18 }, progressFill: { height: "100%", borderRadius: 5, backgroundColor: "#D4B484" }, progressBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 }, progressCaption: { color: "#C9D2D9", fontSize: 11 }, alertCard: { flexDirection: "row", alignItems: "center", borderColor: "#F0D8D1", backgroundColor: "#FFF9F7", marginBottom: 22 }, alertIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.coralSoft, alignItems: "center", justifyContent: "center", marginRight: 11 }, alertTitle: { color: palette.coral, fontWeight: "800", fontSize: 13 }, alertText: { color: palette.muted, fontSize: 11, marginTop: 3 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }, textButton: { color: palette.slate, fontSize: 12, fontWeight: "800" }, timeline: { paddingVertical: 8, paddingRight: 16, gap: 10, marginBottom: 18 }, momentCard: { width: 140, minHeight: 174, borderRadius: 21, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, padding: 14, shadowColor: "#26333D", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 }, momentReady: { borderColor: palette.slate, borderWidth: 1.5 }, momentPressed: { opacity: 0.85, transform: [{ translateY: 2 }] }, momentAccent: { width: 28, height: 5, borderRadius: 3, marginBottom: 13 }, momentTime: { color: palette.muted, fontSize: 12, fontWeight: "700" }, momentTitle: { color: palette.ink, fontSize: 17, fontWeight: "800", marginTop: 6 }, momentSubtitle: { color: palette.muted, fontSize: 11, marginTop: 3 }, momentPeople: { flexDirection: "row", alignItems: "center", marginTop: "auto", paddingTop: 12 }, addCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: palette.line, alignItems: "center", justifyContent: "center" }, momentCount: { color: palette.muted, fontSize: 10, marginTop: 7 }, selectedCard: { marginBottom: 18 }, selectedTop: { flexDirection: "row", alignItems: "center" }, vendorNameRow: { flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" }, vendorName: { color: palette.ink, fontSize: 15, fontWeight: "800" }, vendorService: { color: palette.muted, fontSize: 12, marginTop: 5 }, selectedMeta: { flexDirection: "row", gap: 16, borderTopWidth: 1, borderTopColor: palette.line, marginTop: 16, paddingTop: 13 }, metaLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 }, metaValue: { color: palette.ink, fontSize: 11, fontWeight: "700", marginTop: 4, maxWidth: 115 }, notice: { color: palette.slate, fontSize: 11, lineHeight: 16, marginTop: 14, backgroundColor: palette.slateSoft, borderRadius: 9, padding: 9 }, emptyCard: { flexDirection: "row", alignItems: "center", marginBottom: 18 }, emptyIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.slateSoft, alignItems: "center", justifyContent: "center", marginRight: 11 }, emptyTitle: { color: palette.ink, fontWeight: "800", fontSize: 14 }, emptyText: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, bottomMetrics: { flexDirection: "row", backgroundColor: palette.sand, borderRadius: 20, padding: 16, alignItems: "center" }, metricBlock: { flex: 1 }, metricLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 }, metricValue: { color: palette.ink, fontSize: 20, fontWeight: "900", marginTop: 5 }, metricCaption: { color: palette.muted, fontSize: 10, marginTop: 2 }, verticalRule: { width: 1, height: 44, backgroundColor: "#D7CEC1", marginHorizontal: 15 },
});
