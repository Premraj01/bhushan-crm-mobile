import { useCallback } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSocketEvents } from "@/lib/socket";

/** Mirrors `backend/src/patients/patient.entity.ts` (the fields the app uses). */
export type Patient = {
  id: string;
  name: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  phone: string;
  email?: string;
  concern?: string;
  treatment: string;
  lastVisit?: string;
  notes?: string;
};

export function usePatients(search: string) {
  const queryClient = useQueryClient();
  const q = search.trim();
  const query = useQuery({
    queryKey: ["patients", { search: q }],
    queryFn: () => api<Patient[]>(`/patients${q ? `?search=${encodeURIComponent(q)}` : ""}`),
    placeholderData: keepPreviousData,
  });
  const refresh = useCallback(
    () => void queryClient.invalidateQueries({ queryKey: ["patients"] }),
    [queryClient],
  );
  useSocketEvents(["patient.created", "patient.updated", "patient.deleted"], refresh);
  return query;
}

export function usePatient(id: string) {
  return useQuery({ queryKey: ["patient", id], queryFn: () => api<Patient>(`/patients/${id}`) });
}

/* ---------- history (medical baseline, hair assessment, active prescriptions) ---------- */

export type PatientHistory = {
  patientId: string;
  medical?: {
    noKnownAllergies: boolean;
    allergies: { substance: string; reaction?: string; severity?: "Mild" | "Moderate" | "Severe" }[];
    conditions: { name: string; status: "Current" | "Past" }[];
    medications: { name: string; dose?: string; affectsBleeding: boolean }[];
    clearance: "Not required" | "Pending" | "Received";
  };
  hair?: { scale: "Norwood" | "Ludwig"; grade: string };
  prescribed: { name: string; dose?: string; frequency?: string; affectsBleeding?: boolean }[];
};

export function useHistory(patientId: string) {
  return useQuery({
    queryKey: ["history", patientId],
    queryFn: () => api<PatientHistory>(`/patients/${patientId}/history`),
  });
}

/** Same list as the web (`history-api.ts` INFECTIOUS). */
const INFECTIOUS = ["HIV", "Hepatitis B", "Hepatitis C"];

/** What the safety strip shows — the same rules as the web `safetyAlerts`. */
export function safetyAlerts(history: PatientHistory) {
  const m = history.medical;
  return {
    recorded: !!m,
    noKnownAllergies: m?.noKnownAllergies ?? false,
    allergies: (m?.allergies ?? []).map((a) =>
      a.severity === "Severe" ? `${a.substance} (severe)` : a.substance,
    ),
    bleeding: [
      ...new Set([
        ...(m?.medications ?? []).filter((x) => x.affectsBleeding).map((x) => x.name),
        ...history.prescribed.filter((x) => x.affectsBleeding).map((x) => x.name),
      ]),
    ],
    infectious: (m?.conditions ?? [])
      .filter((c) => c.status === "Current" && INFECTIOUS.includes(c.name))
      .map((c) => c.name),
    clearancePending: m?.clearance === "Pending",
  };
}

/* ---------- photos ---------- */

export const PHOTO_ANGLES = [
  "Frontal hairline",
  "Top / vertex",
  "Crown",
  "Left profile",
  "Right profile",
  "Back (donor area)",
  "Wet hair",
] as const;

export const PHOTO_MILESTONES = [
  "Pre-operative",
  "Day 1 post-op",
  "1 month",
  "3 months",
  "6 months",
  "1 year",
  "Other",
] as const;

export type PhotoUpload = {
  uri: string;
  mimeType: string;
  angle: (typeof PHOTO_ANGLES)[number];
  milestone: (typeof PHOTO_MILESTONES)[number];
  takenOn: string;
  note?: string;
};

export function usePhotoCount(patientId: string) {
  return useQuery({
    queryKey: ["photos", patientId],
    queryFn: () => api<unknown[]>(`/patients/${patientId}/photos`),
    select: (rows) => rows.length,
  });
}

export function useUploadPhoto(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photo: PhotoUpload) => {
      const body = new FormData();
      const ext = photo.mimeType === "image/png" ? "png" : photo.mimeType === "image/webp" ? "webp" : "jpg";
      // React Native's FormData takes a { uri, name, type } descriptor for files.
      body.append("file", { uri: photo.uri, name: `photo.${ext}`, type: photo.mimeType } as unknown as Blob);
      body.append("angle", photo.angle);
      body.append("milestone", photo.milestone);
      body.append("takenOn", photo.takenOn);
      if (photo.note) body.append("note", photo.note);
      return api(`/patients/${patientId}/photos`, { method: "POST", body });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["photos", patientId] }),
  });
}
