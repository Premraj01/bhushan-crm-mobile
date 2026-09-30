import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL, getToken } from "./api";

let socket: Socket | undefined;

/** Lazily opens a single shared connection to the backend's /realtime namespace. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${API_URL}/realtime`, {
      auth: (cb) => cb({ token: getToken() }),
      transports: ["websocket"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = undefined;
}

/** Subscribe to realtime events (e.g. "appointment.updated") for the lifetime of a component. */
export function useSocketEvents(events: string[], handler: () => void) {
  const key = events.join(",");
  useEffect(() => {
    const s = getSocket();
    for (const event of key.split(",")) s.on(event, handler);
    return () => {
      for (const event of key.split(",")) s.off(event, handler);
    };
  }, [key, handler]);
}
