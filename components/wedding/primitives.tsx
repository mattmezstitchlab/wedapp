import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type PressableProps } from "react-native";

export const palette = {
  paper: "#F8F6F1",
  white: "#FFFFFF",
  ink: "#24303A",
  muted: "#7C858B",
  line: "#E7E3DC",
  slate: "#43566B",
  slateSoft: "#E8EDF1",
  coral: "#D88E76",
  coralSoft: "#F4E3DE",
  sage: "#728C79",
  sageSoft: "#E6EEE8",
  sand: "#EEE7DC",
};

export function SectionLabel({ children, action, onAction }: { children: React.ReactNode; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionRow}><Text style={styles.sectionLabel}>{String(children).toUpperCase()}</Text>{action && <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable>}</View>;
}

export function IconButton({ icon, onPress, label, tone = "default" }: { icon: keyof typeof MaterialIcons.glyphMap; onPress?: () => void; label?: string; tone?: "default" | "soft" }) {
  return <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, tone === "soft" && styles.iconButtonSoft, pressed && styles.pressed]}><MaterialIcons name={icon} size={20} color={palette.slate} /></Pressable>;
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "coral" }) {
  const toneStyle = tone === "success" ? styles.pillSuccess : tone === "warning" ? styles.pillWarning : tone === "coral" ? styles.pillCoral : styles.pillDefault;
  return <View style={[styles.pill, toneStyle]}><Text style={[styles.pillText, tone === "success" && styles.pillTextSuccess, tone === "warning" && styles.pillTextWarning, tone === "coral" && styles.pillTextCoral]}>{children}</Text></View>;
}

export function Avatar({ source, size = 44, initials }: { source?: ImageSourcePropType | { uri: string }; size?: number; initials?: string }) {
  return source ? <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}><Text style={styles.avatarText}>{initials ?? "GJ"}</Text></View>;
}

export function Card({ children, style, ...props }: Omit<PressableProps, "style"> & { children: React.ReactNode; style?: object }) {
  return <Pressable {...props} style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}>{children}</Pressable>;
}

export function Metric({ label, value, detail, accent = palette.slate }: { label: string; value: string; detail: string; accent?: string }) {
  return <View style={styles.metric}><View style={[styles.metricDot, { backgroundColor: accent }]} /><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDetail}>{detail}</Text></View>;
}

const styles = StyleSheet.create({
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionLabel: { color: palette.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.4 },
  sectionAction: { color: palette.slate, fontSize: 12, fontWeight: "700" },
  iconButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white, alignItems: "center", justifyContent: "center" },
  iconButtonSoft: { backgroundColor: palette.slateSoft, borderColor: palette.slateSoft },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  card: { backgroundColor: palette.white, borderRadius: 22, borderWidth: 1, borderColor: palette.line, padding: 16, shadowColor: "#2D3942", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  pill: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  pillDefault: { backgroundColor: palette.slateSoft },
  pillSuccess: { backgroundColor: palette.sageSoft },
  pillWarning: { backgroundColor: "#F6EDD8" },
  pillCoral: { backgroundColor: palette.coralSoft },
  pillText: { color: palette.slate, fontSize: 10, fontWeight: "700" },
  pillTextSuccess: { color: palette.sage },
  pillTextWarning: { color: "#9B7734" },
  pillTextCoral: { color: palette.coral },
  avatarFallback: { backgroundColor: palette.slateSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: palette.slate, fontWeight: "800", fontSize: 14 },
  metric: { flex: 1, minWidth: 100, paddingRight: 10 },
  metricDot: { width: 7, height: 7, borderRadius: 4, marginBottom: 8 },
  metricLabel: { color: palette.muted, fontSize: 11, fontWeight: "600" },
  metricValue: { color: palette.ink, fontSize: 20, fontWeight: "800", marginTop: 2 },
  metricDetail: { color: palette.muted, fontSize: 10, marginTop: 3 },
});
