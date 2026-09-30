import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { clinicToday } from "@/lib/dates";
import { useSocketEvents } from "@/lib/socket";
import type { Tone } from "@/components/ui";

/** Mirrors `backend/src/appointments/appointment.entity.ts` (the fields the app uses). */
export type AppointmentStatus = "Scheduled" | "Rescheduled" | "Checked in" | "Completed" | "Missed";

export type Appointment = {
  id: string;
  patientId?: string;
  patientName: string;
  type: string;
  doctor: string;
  startsAt: string;
  durationMinutes: number;
  days?: number;
  status: AppointmentStatus;
  notes?: string;
  billStatus?: "Pending" | "Partially paid" | "Paid" | null;
};

const REALTIME = ["appointment.created", "appointment.updated", "appointment.deleted"];

export function useTodayAppointments() {
  const queryClient = useQueryClient();
  const date = clinicToday();
  const query = useQuery({
    queryKey: ["appointments", { date }],
    queryFn: () => api<Appointment[]>(`/appointments?date=${date}`),
    select: (rows) => [...rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  });
  const refresh = useCallback(
    () => void queryClient.invalidateQueries({ queryKey: ["appointments"] }),
    [queryClient],
  );
  useSocketEvents(REALTIME, refresh);
  return query;
}

/** Check in (patient arrived) or undo it — the tick in the web day list. */
export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, undo }: { id: string; undo?: boolean }) =>
      api<Appointment>(`/appointments/${id}/check-in`, { method: undo ? "DELETE" : "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

/** Chip colours — same as the web `appointmentTone` / `paymentChip`. */
export function appointmentTone(status: AppointmentStatus): Tone {
  if (status === "Completed") return "success";
  if (status === "Checked in") return "info";
  if (status === "Rescheduled") return "warning";
  if (status === "Missed") return "error";
  return "neutral";
}

export function paymentChip(a: Appointment): { label: string; tone: Tone } | null {
  if (a.status !== "Completed") return null;
  if (a.billStatus === "Pending") return { label: "Payment pending", tone: "warning" };
  if (a.billStatus === "Partially paid") return { label: "Partly paid", tone: "warning" };
  return null;
}

export const canCheckIn = (a: Appointment) =>
  a.status === "Scheduled" || a.status === "Rescheduled" || a.status === "Missed";
