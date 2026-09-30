import { router } from "expo-router";
import { ChevronRight, CircleAlert, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { usePatients } from "@/api/patients";
import { Avatar, Banner, EmptyState, Field } from "@/components/ui";
import { errorText } from "@/lib/api";
import { initials } from "@/lib/auth";
import { shortDate } from "@/lib/dates";
import { fonts, useTheme } from "@/theme";

/** Find a patient by name, phone or ID — the web Patients search. */
export default function Patients() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);
  const query = usePatients(debounced);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 14, paddingBottom: 10, gap: 10 }}>
        <Field icon={Search} value={search} onChangeText={setSearch} placeholder="Search name, phone or patient ID" autoCorrect={false} autoCapitalize="none" returnKeyType="search" clearButtonMode="while-editing" />
        {query.isError && <Banner tone="error" icon={CircleAlert}>{errorText(query.error)}</Banner>}
      </View>
      {query.isPending ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(p) => p.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }}
          ListEmptyComponent={<EmptyState icon={Search} title="No patients found" message="Try a different name, phone number or patient ID." />}
          renderItem={({ item: p, index }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/patients/[id]", params: { id: p.id } })}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: index === 0 ? 0 : 1, borderColor: colors.border, backgroundColor: pressed ? colors.tealSoft : "transparent" })}
            >
              <Avatar label={initials(p.name)} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: colors.foreground, fontFamily: fonts.heading, fontSize: 12 }}>{p.name}</Text>
                <Text numberOfLines={1} style={{ marginTop: 4, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 11 }}>
                  {p.id}{p.age != null ? ` · ${p.age} yrs` : ""} · {p.treatment}
                </Text>
                <Text style={{ marginTop: 2, color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 10 }}>
                  {p.lastVisit ? `Last visit ${shortDate(p.lastVisit)}` : "No visits yet"}
                </Text>
              </View>
              <ChevronRight size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
