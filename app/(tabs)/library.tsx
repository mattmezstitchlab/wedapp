import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, IconButton, Pill, SectionLabel, palette } from "@/components/wedding/primitives";
import { type VendorCategory, type VendorStatus } from "@/lib/wedding-data";
import { formatEuro } from "@/lib/wedding-rules";
import { useWedding } from "@/lib/wedding-store";

const categories: ("Tous" | VendorCategory)[] = ["Tous", "Lieu", "Traiteur", "Image", "Musique", "Fleurs", "Beauté"];
const statuses: VendorStatus[] = ["À rechercher", "À contacter", "Devis demandé", "Option", "Réservé", "Payé"];
const toneForStatus = (status: VendorStatus) => status === "Réservé" || status === "Payé" ? "success" : status === "À rechercher" ? "coral" : "warning";

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { vendors, setSelectedVendorId, updateVendorStatus } = useWedding();
  const [category, setCategory] = useState<(typeof categories)[number]>("Tous");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => vendors.filter((vendor) => (category === "Tous" || vendor.category === category) && `${vendor.name} ${vendor.service}`.toLowerCase().includes(query.toLowerCase())), [category, query, vendors]);

  const selectVendor = (id: string) => { setSelectedVendorId(id); router.push("/"); };
  const cycleStatus = (id: string, current: VendorStatus) => updateVendorStatus(id, statuses[(statuses.indexOf(current) + 1) % statuses.length]);

  return <View style={[styles.screen, { paddingTop: Math.max(insets.top, 14) }]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.kicker}>RESSOURCES</Text><Text style={styles.title}>Votre bibliothèque</Text><Text style={styles.subtitle}>Tout ce qui compose le grand jour.</Text></View><IconButton icon="add" label="Ajouter une ressource" onPress={() => setQuery("")} /></View>
    <View style={styles.searchBox}><MaterialIcons name="search" size={20} color={palette.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Rechercher une ressource" placeholderTextColor={palette.muted} style={styles.searchInput} /><Text style={styles.count}>{filtered.length}</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={styles.sectionRow}><SectionLabel>{filtered.length} PRESTATAIRES</SectionLabel><Text style={styles.viewHint}>Touchez pour affecter</Text></View>
    {filtered.map((vendor) => <Card key={vendor.id} onPress={() => selectVendor(vendor.id)} style={styles.vendorCard}><Image source={{ uri: vendor.photo }} style={styles.vendorPhoto} /><View style={styles.vendorBody}><View style={styles.vendorTop}><View style={{ flex: 1 }}><Text style={styles.vendorCategory}>{vendor.category.toUpperCase()}</Text><Text style={styles.vendorName}>{vendor.name}</Text><Text style={styles.vendorService}>{vendor.service}</Text></View><Text style={styles.vendorPrice}>{formatEuro(vendor.price)}</Text></View><View style={styles.vendorBottom}><Pill tone={toneForStatus(vendor.status)}>{vendor.status}</Pill><Text style={styles.availability} numberOfLines={1}>{vendor.availability}</Text><Pressable onPress={() => cycleStatus(vendor.id, vendor.status)} hitSlop={8}><MaterialIcons name="sync" size={18} color={palette.slate} /></Pressable></View></View></Card>)}
    {filtered.length === 0 && <View style={styles.empty}><MaterialIcons name="search-off" color={palette.muted} size={30} /><Text style={styles.emptyTitle}>Aucune ressource trouvée</Text><Text style={styles.emptyText}>Essayez une autre catégorie ou un autre mot.</Text></View>}
    <View style={styles.tip}><MaterialIcons name="lightbulb-outline" size={19} color={palette.coral} /><Text style={styles.tipText}>Astuce : un même prestataire peut être affecté à plusieurs moments, sans créer de doublon.</Text></View>
  </ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper }, content: { paddingHorizontal: 18, paddingBottom: 28 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }, kicker: { color: palette.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 }, title: { color: palette.ink, fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 5 }, subtitle: { color: palette.muted, fontSize: 13, marginTop: 5 }, searchBox: { height: 48, borderRadius: 17, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 }, searchInput: { flex: 1, color: palette.ink, marginLeft: 9, fontSize: 13 }, count: { color: palette.slate, fontSize: 12, fontWeight: "800", backgroundColor: palette.slateSoft, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 }, chips: { gap: 8, paddingBottom: 23 }, chip: { borderRadius: 15, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: palette.white }, chipActive: { backgroundColor: palette.slate, borderColor: palette.slate }, chipText: { color: palette.muted, fontSize: 11, fontWeight: "700" }, chipTextActive: { color: palette.white }, sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }, viewHint: { color: palette.muted, fontSize: 10 }, vendorCard: { flexDirection: "row", padding: 9, marginTop: 10, borderRadius: 20 }, vendorPhoto: { width: 82, height: 100, borderRadius: 15, backgroundColor: palette.sand }, vendorBody: { flex: 1, padding: 6, paddingLeft: 12 }, vendorTop: { flexDirection: "row", alignItems: "flex-start" }, vendorCategory: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 }, vendorName: { color: palette.ink, fontSize: 15, fontWeight: "800", marginTop: 4 }, vendorService: { color: palette.muted, fontSize: 11, marginTop: 3 }, vendorPrice: { color: palette.ink, fontSize: 13, fontWeight: "900" }, vendorBottom: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }, availability: { flex: 1, color: palette.muted, fontSize: 9 }, empty: { alignItems: "center", justifyContent: "center", padding: 50 }, emptyTitle: { color: palette.ink, fontWeight: "800", marginTop: 12 }, emptyText: { color: palette.muted, fontSize: 12, marginTop: 4 }, tip: { flexDirection: "row", alignItems: "center", backgroundColor: palette.coralSoft, borderRadius: 16, padding: 13, marginTop: 20 }, tipText: { color: palette.coral, flex: 1, fontSize: 11, lineHeight: 16, marginLeft: 9 },
});
