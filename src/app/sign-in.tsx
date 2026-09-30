import { ChevronRight, Headset, Lock, Mail, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Field } from "@/components/ui";
import { errorText } from "@/lib/api";
import { ROLE_LABELS, useAuth, type Role } from "@/lib/auth";
import { fonts, panelShadow, radius, useTheme } from "@/theme";

/** Same one-click accounts as the web sign-in (only work while the server has DEMO_LOGINS on). */
const DEMO_ACCOUNTS: { role: Role; person: string; icon: LucideIcon }[] = [
  { role: "Admin", person: "Dr. Bhushan Patil · full access", icon: ShieldCheck },
  { role: "Doctor", person: "Dr. Sonal Desai · clinical", icon: Stethoscope },
  { role: "Reception", person: "Priya More · front desk", icon: Headset },
];

export default function SignIn() {
  const { colors } = useTheme();
  const { signIn, demoSignIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"form" | Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "form" | Role, action: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(e));
      setBusy(null);
    }
  }

  const submit = () => {
    if (!email.trim() || password.length < 6) return setError("Enter your email and a password of at least 6 characters.");
    void run("form", () => signIn(email.trim(), password));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
          {/* .auth-brand */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={[{ width: 52, height: 52, borderRadius: 14, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" }, panelShadow]}>
              <Image source={require("../../assets/brand/logo-mark.png")} style={{ width: 44, height: 44 }} accessibilityLabel="Dr. Bhushan’s Rejuvenation logo" />
            </View>
            <View>
              <Text style={{ color: colors.foreground, fontFamily: fonts.headingHeavy, fontSize: 15 }}>Dr. Bhushan’s</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: fonts.heading, fontSize: 9, letterSpacing: 2 }}>REJUVENATION</Text>
            </View>
          </View>

          <Text style={{ marginTop: 34, color: colors.foreground, fontFamily: fonts.headingHeavy, fontSize: 26 }}>Sign in</Text>
          <Text style={{ marginTop: 8, marginBottom: 26, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 13 }}>
            Welcome back to your clinic workspace.
          </Text>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ marginBottom: 7, color: colors.foreground, fontFamily: fonts.heading, fontSize: 11 }}>Email address</Text>
              <Field icon={Mail} value={email} onChangeText={setEmail} placeholder="you@clinic.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" />
            </View>
            <View>
              <Text style={{ marginBottom: 7, color: colors.foreground, fontFamily: fonts.heading, fontSize: 11 }}>Password</Text>
              <Field icon={Lock} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
            </View>
            <Button size="lg" onPress={submit} loading={busy === "form"} disabled={busy !== null} style={{ marginTop: 6 }}>
              {busy === "form" ? "Signing you in…" : "Sign in"}
            </Button>
          </View>

          {/* .auth-divider + .demo-logins */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24, marginBottom: 14 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ color: colors.mutedForeground, fontFamily: fonts.heading, fontSize: 10, letterSpacing: 1.2 }}>OR USE A DEMO ACCOUNT</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>
          <View style={{ gap: 8 }}>
            {DEMO_ACCOUNTS.map(({ role, person, icon: Icon }) => (
              <Pressable
                key={role}
                accessibilityRole="button"
                accessibilityLabel={`Sign in as ${ROLE_LABELS[role]}`}
                disabled={busy !== null}
                onPress={() => void run(role, () => demoSignIn(role))}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, borderWidth: 1, borderColor: pressed ? colors.primary : colors.border, borderRadius: radius.lg, backgroundColor: pressed ? colors.tealSoft : colors.card, padding: 8, paddingRight: 14, opacity: busy !== null && busy !== role ? 0.6 : 1 })}
              >
                <View style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: fonts.heading, fontSize: 13 }}>{ROLE_LABELS[role]}</Text>
                  <Text style={{ marginTop: 2, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>{person}</Text>
                </View>
                {busy === role ? <ActivityIndicator size="small" color={colors.primary} /> : <ChevronRight size={16} color={colors.mutedForeground} />}
              </Pressable>
            ))}
          </View>

          {error && (
            <Text accessibilityRole="alert" style={{ marginTop: 14, color: colors.destructive, fontFamily: fonts.bodySemi, fontSize: 12 }}>
              {error}
            </Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 22 }}>
            <ShieldCheck size={13} color={colors.success} />
            <Text style={{ color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>Secure access for authorised clinic staff</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
