import { AlertTriangle, Droplet, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import { safetyAlerts, type PatientHistory } from "@/api/patients";
import { fonts, radius, useTheme } from "@/theme";

type Item = { icon: LucideIcon; tone: "danger" | "warning" | "ok"; text: string };

/**
 * Allergies, bleeding-risk medication, infectious conditions and pending clearance —
 * the same alerts, wording and colours as the web `SafetyStrip`.
 */
export function SafetyStrip({ history }: { history: PatientHistory }) {
  const { colors } = useTheme();
  const alerts = safetyAlerts(history);

  const items: Item[] = [];
  if (!alerts.recorded && alerts.bleeding.length === 0) {
    items.push({ icon: AlertTriangle, tone: "warning", text: "Medical history not recorded — check allergies and medication before any procedure." });
  } else {
    if (alerts.allergies.length) items.push({ icon: ShieldAlert, tone: "danger", text: `Allergies: ${alerts.allergies.join(", ")}` });
    if (alerts.bleeding.length) items.push({ icon: Droplet, tone: "danger", text: `Affects bleeding: ${alerts.bleeding.join(", ")}` });
    if (alerts.infectious.length) items.push({ icon: AlertTriangle, tone: "warning", text: `Infection precautions: ${alerts.infectious.join(", ")}` });
    if (alerts.clearancePending) items.push({ icon: AlertTriangle, tone: "warning", text: "Medical clearance pending" });
    if (!alerts.recorded) items.push({ icon: AlertTriangle, tone: "warning", text: "Medical history not recorded — check allergies before any procedure" });
    if (items.length === 0)
      items.push({
        icon: ShieldCheck,
        tone: "ok",
        text: `${alerts.noKnownAllergies ? "No known drug allergies" : "No allergies recorded"} · no bleeding-risk medication`,
      });
  }

  const palette = {
    danger: { bg: colors.errorSoft, fg: colors.destructive },
    warning: { bg: colors.warningSoft, fg: colors.warning },
    ok: { bg: colors.successSoft, fg: colors.success },
  };

  return (
    <View accessibilityLabel="Safety alerts" style={{ gap: 6 }}>
      {items.map(({ icon: Icon, tone, text }) => (
        <View key={text} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: `${palette[tone].fg}4d`, borderRadius: radius.md, backgroundColor: palette[tone].bg, paddingHorizontal: 10, paddingVertical: 8 }}>
          <Icon size={14} color={palette[tone].fg} />
          <Text style={{ flex: 1, color: palette[tone].fg, fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 17 }}>{text}</Text>
        </View>
      ))}
    </View>
  );
}
