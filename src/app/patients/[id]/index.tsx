import { router, Stack, useLocalSearchParams } from "expo-router";
import { Camera, CircleAlert, Phone, Pill } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Linking, RefreshControl, ScrollView, Text, View } from "react-native";
import { useHistory, usePatient, usePhotoCount } from "@/api/patients";
import { SafetyStrip } from "@/components/safety-strip";
import { Avatar, Banner, Button, Panel, SectionHeader, StatusChip } from "@/components/ui";
import { errorText } from "@/lib/api";
import { initials } from "@/lib/auth";
import { shortDate } from "@/lib/dates";
import { fonts, useTheme } from "@/theme";

/** Read-only patient snapshot: safety first, then the essentials and a photo shortcut. */
export default function PatientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const patient = usePatient(id);
  const history = useHistory(id);
  const photos = usePhotoCount(id);

  if (patient.isPending) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />;
  if (patient.isError)
    return (
      <View style={{ padding: 14 }}>
        <Banner tone="error" icon={CircleAlert}>{errorText(patient.error)}</Banner>
      </View>
    );

  const p = patient.data;
  const details = [p.age != null && `${p.age} yrs`, p.gender, p.id].filter(Boolean).join(" · ");

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 34 }}
      refreshControl={
        <RefreshControl
          refreshing={patient.isRefetching || history.isRefetching}
          onRefresh={() => void Promise.all([patient.refetch(), history.refetch(), photos.refetch()])}
          tintColor={colors.primary}
        />
      }
    >
      <Stack.Screen options={{ title: p.name }} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar label={initials(p.name)} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.heading, fontFamily: fonts.heading, fontSize: 20 }}>{p.name}</Text>
          <Text style={{ marginTop: 4, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12 }}>{details}</Text>
        </View>
      </View>

      {history.data ? (
        <SafetyStrip history={history.data} />
      ) : history.isError ? (
        <Banner tone="warning" icon={CircleAlert}>Couldn’t load the medical history — check allergies before any procedure.</Banner>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button icon={Camera} style={{ flex: 1 }} onPress={() => router.push({ pathname: "/patients/[id]/photo", params: { id } })}>
          Add photo
        </Button>
        <Button variant="outline" icon={Phone} style={{ flex: 1 }} onPress={() => void Linking.openURL(`tel:${p.phone.replace(/[^\d+]/g, "")}`)}>
          Call
        </Button>
      </View>

      <Panel>
        <SectionHeader title="Overview" />
        <View style={{ paddingHorizontal: 14 }}>
          <Row label="Phone">{p.phone}</Row>
          <Row label="Concern">{p.concern ?? "Not recorded"}</Row>
          <Row label="Treatment">{p.treatment}</Row>
          <Row label="Hair grade">{history.data?.hair ? `${history.data.hair.scale} ${history.data.hair.grade}` : "Not assessed"}</Row>
          <Row label="Last visit">{p.lastVisit ? shortDate(p.lastVisit) : "No visits yet"}</Row>
          <Row label="Photos" last>
            {photos.data == null ? "—" : `${photos.data} on record`}
          </Row>
        </View>
      </Panel>

      <Panel>
        <SectionHeader title="Current medication" subtitle="Active prescriptions from the clinic" trailing={<Pill size={16} color={colors.mutedForeground} />} />
        <View style={{ padding: 14, gap: 10 }}>
          {history.data?.prescribed.length ? (
            history.data.prescribed.map((rx, i) => (
              <View key={`${rx.name}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: fonts.bodySemi, fontSize: 13 }}>{rx.name}</Text>
                  {(rx.dose || rx.frequency) && (
                    <Text style={{ marginTop: 2, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>
                      {[rx.dose, rx.frequency].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </View>
                {rx.affectsBleeding && <StatusChip tone="error">Bleeding risk</StatusChip>}
              </View>
            ))
          ) : (
            <Text style={{ color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12 }}>None active.</Text>
          )}
        </View>
      </Panel>

      {p.notes ? (
        <Panel>
          <SectionHeader title="Notes" />
          <Text style={{ padding: 14, color: colors.foreground, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 }}>{p.notes}</Text>
        </Panel>
      ) : null}
    </ScrollView>
  );
}

function Row({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : 1, borderColor: colors.border }}>
      <Text style={{ width: 90, color: colors.mutedForeground, fontFamily: fonts.bodySemi, fontSize: 11 }}>{label}</Text>
      <Text style={{ flex: 1, color: colors.foreground, fontFamily: fonts.body, fontSize: 12 }}>{children}</Text>
    </View>
  );
}
