import { useQuery } from "@tanstack/react-query";
import { Activity, LogOut } from "lucide-react-native";
import { Image, ScrollView, Text, View } from "react-native";
import { Button, IconTile, Panel } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { confirm } from "@/lib/dialogs";
import { initials, ROLE_LABELS, useAuth, useUser } from "@/lib/auth";
import { fonts, radius, useTheme } from "@/theme";

export default function Account() {
  const user = useUser();
  const { signOut } = useAuth();
  const { colors } = useTheme();
  const health = useQuery({ queryKey: ["health"], queryFn: () => api("/health"), refetchInterval: 60_000, retry: 0 });

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* The web sidebar's brand block, as a card */}
      <View style={{ borderRadius: radius.md, backgroundColor: colors.brand, padding: 18, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
          <View style={{ width: 38, height: 38, borderRadius: radius.md, backgroundColor: "#FAFCFA", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Image source={require("../../../assets/brand/logo-mark.png")} style={{ width: 38, height: 38 }} />
          </View>
          <View>
            <Text style={{ color: colors.brandForeground, fontFamily: fonts.heading, fontSize: 14 }}>Dr. Bhushan’s</Text>
            <Text style={{ marginTop: 3, color: colors.brandForeground, opacity: 0.72, fontFamily: fonts.heading, fontSize: 9, letterSpacing: 1.4 }}>REJUVENATION</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
          <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.accentForeground, fontFamily: fonts.heading, fontSize: 13 }}>{initials(user.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.brandForeground, fontFamily: fonts.heading, fontSize: 14 }}>{user.name}</Text>
            <Text style={{ marginTop: 3, color: colors.brandForeground, opacity: 0.66, fontFamily: fonts.body, fontSize: 11 }}>
              {ROLE_LABELS[user.role]} · {user.email}
            </Text>
          </View>
        </View>
      </View>

      {/* .support — clinic status */}
      <Panel style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12 }}>
        <IconTile icon={Activity} tone={health.isError ? "error" : "success"} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontFamily: fonts.heading, fontSize: 12 }}>Clinic status</Text>
          <Text style={{ marginTop: 3, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>
            {health.isPending ? "Checking…" : health.isError ? "Server unreachable" : "All systems operational"}
          </Text>
          <Text numberOfLines={1} style={{ marginTop: 2, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 10 }}>{API_URL}</Text>
        </View>
      </Panel>

      <Button
        variant="outline"
        icon={LogOut}
        onPress={() => confirm("Sign out?", "You’ll need to sign in again to use the app.", "Sign out", () => void signOut())}
      >
        Sign out
      </Button>

      <Text style={{ marginTop: 6, textAlign: "center", color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 10, lineHeight: 16 }}>
        Dr. Bhushan’s Rejuvenation{"\n"}Pune, Maharashtra
      </Text>
    </ScrollView>
  );
}
