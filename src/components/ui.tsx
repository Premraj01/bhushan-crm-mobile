import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { fonts, panelShadow, radius, useTheme, type Colors } from "@/theme";

/* Each component mirrors a class in the web `styles.css`, noted beside it. */

export type Tone = "success" | "warning" | "error" | "neutral" | "info";

function toneColors(c: Colors, tone: Tone) {
  switch (tone) {
    case "info":
      return { bg: c.tealSoft, fg: c.primary };
    case "success":
      return { bg: c.successSoft, fg: c.success };
    case "warning":
      return { bg: c.warningSoft, fg: c.warning };
    case "error":
      return { bg: c.errorSoft, fg: c.destructive };
    default:
      return { bg: c.secondary, fg: c.mutedForeground };
  }
}

/** `.eyebrow` — small uppercase Montserrat label above a heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.mutedForeground, fontFamily: fonts.heading, fontSize: 10, textTransform: "uppercase", marginBottom: 5 }}>
      {children}
    </Text>
  );
}

/** `.page-header h1` (mobile size) + `.page-description`. */
export function PageHeader({ title, description, eyebrow }: { title: string; description?: string; eyebrow?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 18 }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Text style={{ color: colors.heading, fontFamily: fonts.heading, fontSize: 24, lineHeight: 30 }}>{title}</Text>
      {description && (
        <Text style={{ marginTop: 6, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 }}>
          {description}
        </Text>
      )}
    </View>
  );
}

/** `.panel` — bordered white card with the panel shadow. */
export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card, overflow: "hidden" },
        panelShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** `.section-header` — title and subtitle row at the top of a panel. */
export function SectionHeader({ title, subtitle, trailing }: { title: string; subtitle?: string; trailing?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontFamily: fonts.heading, fontSize: 14 }}>{title}</Text>
        {subtitle && <Text style={{ marginTop: 4, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>{subtitle}</Text>}
      </View>
      {trailing}
    </View>
  );
}

/** `.metric-card` — label, icon tile and a big Montserrat figure. */
export function MetricCard({ label, value, note, icon: Icon }: { label: string; value: string; note?: string; icon: LucideIcon }) {
  const { colors } = useTheme();
  return (
    <Panel style={{ flex: 1, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ flex: 1, color: colors.mutedForeground, fontFamily: fonts.bodySemi, fontSize: 11 }}>{label}</Text>
        <IconTile icon={Icon} />
      </View>
      <Text style={{ marginTop: 12, color: colors.heading, fontFamily: fonts.heading, fontSize: 20 }}>{value}</Text>
      {note && <Text style={{ marginTop: 6, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 10 }}>{note}</Text>}
    </Panel>
  );
}

/** `.metric-icon` / `.menu-icon` — 32px tinted square with an icon. */
export function IconTile({ icon: Icon, tone }: { icon: LucideIcon; tone?: Tone }) {
  const { colors } = useTheme();
  const { bg, fg } = tone ? toneColors(colors, tone) : { bg: colors.tealSoft, fg: colors.primary };
  return (
    <View style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Icon size={16} color={fg} />
    </View>
  );
}

/** `.schedule-avatar` / `.person > span` — square initials tile (not a circle). */
export function Avatar({ label, size = 34 }: { label: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: radius.sm, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: colors.primary, fontFamily: fonts.heading, fontSize: size > 40 ? 15 : 10 }}>{label}</Text>
    </View>
  );
}

/** `.status-chip` with `.status-dot`. */
export function StatusChip({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const { colors } = useTheme();
  const { bg, fg } = toneColors(colors, tone);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", minHeight: 23, borderWidth: 1, borderColor: tone === "neutral" ? colors.border : `${fg}47`, borderRadius: radius.pill, backgroundColor: bg, paddingHorizontal: 8 }}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: fg }} />
      <Text style={{ color: fg, fontFamily: fonts.bodySemi, fontSize: 9, fontWeight: "700" }}>{children}</Text>
    </View>
  );
}

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** shadcn `Button` as themed on the web: primary teal, outline, ghost. */
export function Button({ children, variant = "primary", size = "md", icon: Icon, loading, disabled, style, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const fg = variant === "primary" ? colors.primaryForeground : colors.primary;
  const height = size === "lg" ? 48 : size === "sm" ? 34 : 42;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderRadius: radius.md,
          paddingHorizontal: size === "sm" ? 12 : 16,
          backgroundColor: variant === "primary" ? colors.primary : variant === "outline" ? colors.card : "transparent",
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : Icon && <Icon size={size === "sm" ? 14 : 16} color={fg} />}
      <Text style={{ color: fg, fontFamily: fonts.heading, fontSize: size === "sm" ? 11 : 13 }}>{children}</Text>
    </Pressable>
  );
}

/** `.auth-input` / `.field-search` — bordered field with a leading icon. */
export function Field({ icon: Icon, style, ...props }: TextInputProps & { icon?: LucideIcon; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.card, paddingHorizontal: 14 }}>
      {Icon && <Icon size={16} color={colors.mutedForeground} />}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[{ flex: 1, minHeight: 44, color: colors.foreground, fontFamily: fonts.body, fontSize: 14 }, style]}
        {...props}
      />
    </View>
  );
}

/** `.banner` — tinted one-line message. */
export function Banner({ tone, icon: Icon, children }: { tone: Tone; icon?: LucideIcon; children: ReactNode }) {
  const { colors } = useTheme();
  const { bg, fg } = toneColors(colors, tone);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: `${fg}47`, borderRadius: radius.md, backgroundColor: bg, paddingHorizontal: 12, paddingVertical: 10 }}>
      {Icon && <Icon size={14} color={fg} />}
      <Text style={{ flex: 1, color: fg, fontFamily: fonts.bodySemi, fontSize: 11, lineHeight: 16 }}>{children}</Text>
    </View>
  );
}

/** `.empty-state`. */
export function EmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 42, paddingHorizontal: 20 }}>
      <Icon size={26} color={colors.mutedForeground} />
      <Text style={{ marginTop: 10, color: colors.foreground, fontFamily: fonts.heading, fontSize: 14 }}>{title}</Text>
      {message && <Text style={{ marginTop: 5, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12, textAlign: "center" }}>{message}</Text>}
    </View>
  );
}

/** Pill toggle — `.auth-tabs` styling, used for filters. */
export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.secondary, padding: 4 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[{ flex: 1, minHeight: 34, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: active ? colors.card : "transparent" }, active && panelShadow]}
          >
            <Text style={{ color: active ? colors.foreground : colors.mutedForeground, fontFamily: fonts.heading, fontSize: 12 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Selectable chip for short option lists (photo angle, milestone). */
export function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ borderWidth: 1, borderColor: selected ? colors.primary : colors.border, borderRadius: radius.pill, backgroundColor: selected ? colors.primary : colors.card, paddingHorizontal: 12, paddingVertical: 8 }}
    >
      <Text style={{ color: selected ? colors.primaryForeground : colors.foreground, fontFamily: fonts.bodySemi, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
