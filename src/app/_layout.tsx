import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { AuthProvider, useAuth } from "@/lib/auth";
import { fonts, useTheme } from "@/theme";

void SplashScreen.preventAutoHideAsync();

// Refetch when the app comes back to the foreground (TanStack Query's "window focus" on native).
AppState.addEventListener("change", (state) => focusManager.setFocused(state === "active"));

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootStack ready={fontsLoaded} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootStack({ ready }: { ready: boolean }) {
  const { user } = useAuth();
  const { colors, dark } = useTheme();
  const loading = !ready || user === undefined;

  useEffect(() => {
    if (!loading) void SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.heading, fontSize: 15, color: colors.heading },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="patients/[id]/index" options={{ title: "Patient" }} />
          <Stack.Screen name="patients/[id]/photo" options={{ title: "Add photo", presentation: "modal" }} />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
