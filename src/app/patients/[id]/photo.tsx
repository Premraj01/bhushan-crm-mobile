import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Camera, CircleAlert, ImagePlus } from "lucide-react-native";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { PHOTO_ANGLES, PHOTO_MILESTONES, usePatient, useUploadPhoto, type PhotoUpload } from "@/api/patients";
import { Banner, Button, Choice, Eyebrow, Field } from "@/components/ui";
import { errorText } from "@/lib/api";
import { notify } from "@/lib/dialogs";
import { clinicToday } from "@/lib/dates";
import { fonts, radius, useTheme } from "@/theme";

type Picked = { uri: string; mimeType: string };

/**
 * Take (or choose) a progress photo and file it under an angle and milestone —
 * the same fields as the web Photo vault upload (`POST /patients/:id/photos`).
 */
export default function AddPhoto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const patient = usePatient(id);
  const upload = useUploadPhoto(id);
  const [photo, setPhoto] = useState<Picked | null>(null);
  const [angle, setAngle] = useState<PhotoUpload["angle"]>("Frontal hairline");
  const [milestone, setMilestone] = useState<PhotoUpload["milestone"]>("Pre-operative");
  const [note, setNote] = useState("");

  async function pick(source: "camera" | "library") {
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted)
        return notify("Camera access needed", "Allow camera access in Settings to take patient photos.");
    }
    // quality < 1 makes iOS re-encode to JPEG — the server accepts JPEG, PNG and WebP only (no HEIC).
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.85 };
    const result =
      source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset) setPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" });
  }

  function save() {
    if (!photo) return;
    upload.mutate(
      { ...photo, angle, milestone, takenOn: clinicToday(), note: note.trim() || undefined },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {patient.data && (
        <Text style={{ color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12 }}>
          For <Text style={{ color: colors.foreground, fontFamily: fonts.heading }}>{patient.data.name}</Text> · {patient.data.id}
        </Text>
      )}

      {photo ? (
        <View style={{ gap: 8 }}>
          <Image source={{ uri: photo.uri }} style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: radius.lg, backgroundColor: colors.secondary }} resizeMode="cover" accessibilityLabel="Selected photo" />
          <Button variant="outline" size="sm" icon={Camera} onPress={() => void pick("camera")}>Retake</Button>
        </View>
      ) : (
        <View style={{ alignItems: "center", gap: 12, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.card, paddingVertical: 34, paddingHorizontal: 16 }}>
          <Camera size={28} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: fonts.body, fontSize: 12, textAlign: "center" }}>
            Frame the area in good light, against a plain background.
          </Text>
          <View style={{ flexDirection: "row", gap: 8, alignSelf: "stretch" }}>
            <Button icon={Camera} style={{ flex: 1 }} onPress={() => void pick("camera")}>Take photo</Button>
            <Button variant="outline" icon={ImagePlus} style={{ flex: 1 }} onPress={() => void pick("library")}>Library</Button>
          </View>
        </View>
      )}

      <View>
        <Eyebrow>Angle</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {PHOTO_ANGLES.map((a) => <Choice key={a} label={a} selected={angle === a} onPress={() => setAngle(a)} />)}
        </View>
      </View>

      <View>
        <Eyebrow>Milestone</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {PHOTO_MILESTONES.map((m) => <Choice key={m} label={m} selected={milestone === m} onPress={() => setMilestone(m)} />)}
        </View>
      </View>

      <View>
        <Eyebrow>Note (optional)</Eyebrow>
        <Field value={note} onChangeText={setNote} placeholder="e.g. Slight redness at recipient area" maxLength={300} />
      </View>

      {upload.isError && <Banner tone="error" icon={CircleAlert}>{errorText(upload.error)}</Banner>}

      <Button size="lg" disabled={!photo} loading={upload.isPending} onPress={save}>
        {upload.isPending ? "Uploading…" : "Save to patient record"}
      </Button>
    </ScrollView>
  );
}
