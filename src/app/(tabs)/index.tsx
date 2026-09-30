import { router } from "expo-router";
import { CalendarDays, CalendarX2, Check, CheckCheck, CircleAlert, UserCheck, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appointmentTone, canCheckIn, paymentChip, useCheckIn, useTodayAppointments, type Appointment } from "@/api/appointments";
import { Avatar, Banner, EmptyState, MetricCard, PageHeader, Panel, SectionHeader, Segmented, StatusChip } from "@/components/ui";
import { errorText } from "@/lib/api";
import { confirm, notify } from "@/lib/dialogs";
import { greetingName, initials, useUser } from "@/lib/auth";
import { clinicTime, clinicToday, greetingFor, longDate } from "@/lib/dates";
import { fonts, radius, useTheme } from "@/theme";

/** Today's schedule: who's due, who's arrived, one-tap check-in. */
export default function Today() {
  const user = useUser();
  const { colors } = useTheme();
  const query = useTodayAppointments();
  // Doctors start on their own list; everyone else sees the whole clinic.
  const [scope, setScope] = useState<"mine" | "all">(user.role === "Doctor" ? "mine" : "all");

  const rows = useMemo(
    () => (query.data ?? []).filter((a) => scope === "all" || a.doctor === user.name),
    [query.data, scope, user.name],
  );
  const arrived = rows.filter((a) => a.status === "Checked in").length;
  const done = rows.filter((a) => a.status === "Completed").length;
  const next = rows.find((a) => a.status === "Scheduled" || a.status === "Rescheduled");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingTop: 21, paddingBottom: 34, gap: 12 }}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}
      >
        <PageHeader
          eyebrow="Today’s schedule"
          title={`${greetingFor()}, ${greetingName(user.name)}`}
          description={`${longDate(clinicToday())} · Pune clinic`}
        />

        {user.role === "Doctor" && (
          <Segmented value={scope} onChange={setScope} options={[{ value: "mine", label: "My patients" }, { value: "all", label: "Whole clinic" }]} />
        )}

        <View style={{ flexDirection: "row", gap: 9 }}>
          <MetricCard label="Visits" value={String(rows.length)} note={next ? `Next at ${clinicTime(next.startsAt).time} ${clinicTime(next.startsAt).period}` : "No one waiting"} icon={CalendarDays} />
          <MetricCard label="Arrived" value={String(arrived)} note="Checked in" icon={UserCheck} />
          <MetricCard label="Done" value={String(done)} note="Completed" icon={CheckCheck} />
        </View>

        {query.isError && <Banner tone="error" icon={CircleAlert}>{errorText(query.error)}</Banner>}

        <Panel>
          <SectionHeader title="Appointments" subtitle={query.isPending ? "Loading…" : `${rows.length} today · tap the circle when a patient arrives`} />
          {!query.isPending && rows.length === 0 ? (
            <EmptyState icon={query.isError ? Users : CalendarX2} title="No appointments today" message={scope === "mine" ? "Nothing booked with you — switch to the whole clinic to see everyone." : "Bookings made on the dashboard will show here."} />
          ) : (
            <View style={{ paddingHorizontal: 12 }}>
              {rows.map((a, i) => <AppointmentRow key={a.id} appointment={a} last={i === rows.length - 1} />)}
            </View>
          )}
        </Panel>
      </ScrollView>
    </SafeAreaView>
  );
}

/** `.schedule-row` — time, initials, name and visit, status, and the check-in tick. */
function AppointmentRow({ appointment: a, last }: { appointment: Appointment; last: boolean }) {
  const { colors } = useTheme();
  const checkIn = useCheckIn();
  const { time, period } = clinicTime(a.startsAt);
  const payment = paymentChip(a);
  const checked = a.status === "Checked in" || a.status === "Completed";
  const tickable = canCheckIn(a) || a.status === "Checked in";

  function toggle() {
    const undo = a.status === "Checked in";
    const go = () =>
      checkIn.mutate({ id: a.id, undo }, { onError: (e) => notify("Couldn’t update check-in", errorText(e)) });
    if (undo) confirm("Undo check-in?", `${a.patientName} will be marked as not arrived.`, "Undo", go);
    else go();
  }

  return (
    <Pressable
      disabled={!a.patientId}
      onPress={() => a.patientId && router.push({ pathname: "/patients/[id]", params: { id: a.patientId } })}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13, borderBottomWidth: last ? 0 : 1, borderColor: colors.border, opacity: pressed ? 0.7 : 1 })}
    >
      <View style={{ width: 46 }}>
        <Text style={{ color: colors.heading, fontFamily: fonts.heading, fontSize: 12 }}>{time}</Text>
        <Text style={{ marginTop: 2, color: colors.mutedForeground, fontFamily: fonts.bodySemi, fontSize: 9 }}>{period}</Text>
      </View>
      <Avatar label={initials(a.patientName)} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text numberOfLines={1} style={{ color: colors.foreground, fontFamily: fonts.heading, fontSize: 12 }}>{a.patientName}</Text>
        <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>
          {a.type} · {a.durationMinutes} min{a.days && a.days > 1 ? ` · ${a.days} days` : ""} · {a.doctor}
        </Text>
        <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
          <StatusChip tone={appointmentTone(a.status)}>{a.status}</StatusChip>
          {payment && <StatusChip tone={payment.tone}>{payment.label}</StatusChip>}
        </View>
      </View>
      {tickable || checked ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked, disabled: !tickable || checkIn.isPending }}
          accessibilityLabel={checked ? `${a.patientName} checked in` : `Check in ${a.patientName}`}
          disabled={!tickable || checkIn.isPending}
          onPress={toggle}
          hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: radius.pill, borderWidth: 1.5, borderColor: checked ? colors.success : colors.border, backgroundColor: checked ? colors.success : colors.card, alignItems: "center", justifyContent: "center", opacity: checkIn.isPending ? 0.5 : 1 }}
        >
          {checked && <Check size={17} color={colors.card} strokeWidth={3} />}
        </Pressable>
      ) : null}
    </Pressable>
  );
}
