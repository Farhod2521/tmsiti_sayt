import { useEffect, useRef, useState } from "react";
import { config } from "@/config";

// https://main.tmsiti.uz/api/ -> wss://main.tmsiti.uz/ws/<path>
export const wsUrl = (path) => {
  const base = new URL(config.BASE_MAIN_API);
  const proto = base.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${base.host}/ws/${path}`;
};

// Uzilsa o'zi qayta ulanadigan WebSocket. onEvent — serverdan kelgan har bir JSON;
// onOpen(socket) — ulangandan keyin (masalan, avtorizatsiya xabari yuborish uchun).
// Qaytaradi: ulanganmi (true/false) — ulanmagan paytda REST bilan so'rab turish uchun.
export const useLiveSocket = (path, { onEvent, onOpen, enabled = true } = {}) => {
  const [connected, setConnected] = useState(false);
  const handlers = useRef({ onEvent, onOpen });
  handlers.current = { onEvent, onOpen };

  useEffect(() => {
    if (!enabled || !path || typeof window === "undefined" || !window.WebSocket) return undefined;
    let socket = null;
    let retry = 0;
    let retryTimer = null;
    let pingTimer = null;
    let stopped = false;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl(path));
      } catch (e) {
        schedule();
        return;
      }
      socket.onopen = () => {
        retry = 0;
        setConnected(true);
        if (handlers.current.onOpen) handlers.current.onOpen(socket);
        pingTimer = setInterval(() => {
          if (socket.readyState === 1) socket.send(JSON.stringify({ type: "ping" }));
        }, 25000);
      };
      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.event !== "pong" && handlers.current.onEvent) handlers.current.onEvent(data);
        } catch (err) {
          // JSON bo'lmagan xabar — e'tiborsiz
        }
      };
      socket.onclose = (e) => {
        setConnected(false);
        clearInterval(pingTimer);
        // 4401/4404 — token yaroqsiz: qayta ulanish befoyda
        if (!stopped && e.code !== 4401 && e.code !== 4404) schedule();
      };
    };

    const schedule = () => {
      retry += 1;
      retryTimer = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(retry, 5)));
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      if (socket) socket.close();
      setConnected(false);
    };
  }, [path, enabled]);

  return connected;
};
