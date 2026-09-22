import { CompanionDevice, CompanionPayload, CompanionSession } from "../../types";

const PAIRING_KEY = "droidforge_companion_pairing_code";
const CHANNEL_NAME = "droidforge_companion_broadcast";

export function generatePairingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DF-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getStoredPairingCode(): string {
  try {
    const existing = localStorage.getItem(PAIRING_KEY);
    if (existing && existing.startsWith("DF-")) {
      return existing;
    }
  } catch (e) {
    // ignore
  }
  const newCode = generatePairingCode();
  try {
    localStorage.setItem(PAIRING_KEY, newCode);
  } catch (e) {
    // ignore
  }
  return newCode;
}

export function resetStoredPairingCode(): string {
  const newCode = generatePairingCode();
  try {
    localStorage.setItem(PAIRING_KEY, newCode);
  } catch (e) {
    // ignore
  }
  return newCode;
}

// In-memory broadcast & listeners
type SessionListener = (session: CompanionSession) => void;
type PayloadListener = (payload: CompanionPayload) => void;

class CompanionBridge {
  private channel: BroadcastChannel | null = null;
  private sessionListeners: Set<SessionListener> = new Set();
  private payloadListeners: Set<PayloadListener> = new Set();

  private session: CompanionSession = {
    pairingCode: getStoredPairingCode(),
    status: "disconnected",
    connectionType: "wifi",
    connectedDevice: null,
    lastSyncTimestamp: null,
    autoSync: true,
    logs: [
      {
        id: "log_init",
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        message: "Companion bridge initialized. Ready for pairing.",
      },
    ],
  };

  private lastPayload: CompanionPayload | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type === "SYNC_PAYLOAD") {
            this.lastPayload = data;
            this.payloadListeners.forEach((cb) => cb(data));
          } else if (type === "DEVICE_CONNECTED") {
            this.session.connectedDevice = data.device;
            this.session.status = "connected";
            this.addLog("success", `Device connected via ${data.device.connectionType}: ${data.device.name}`);
            this.notifySession();
          } else if (type === "RESET_CONNECTION") {
            this.resetSessionLocal(false);
          } else if (type === "REFRESH_SCREEN") {
            if (this.lastPayload) {
              this.payloadListeners.forEach((cb) => cb(this.lastPayload!));
            }
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel error:", e);
      }
    }
  }

  public getSession(): CompanionSession {
    return { ...this.session };
  }

  public getLastPayload(): CompanionPayload | null {
    return this.lastPayload;
  }

  public subscribeSession(cb: SessionListener): () => void {
    this.sessionListeners.add(cb);
    cb(this.session);
    return () => this.sessionListeners.delete(cb);
  }

  public subscribePayload(cb: PayloadListener): () => void {
    this.payloadListeners.add(cb);
    if (this.lastPayload) {
      cb(this.lastPayload);
    }
    return () => this.payloadListeners.delete(cb);
  }

  public addLog(type: "info" | "success" | "warn" | "error", message: string) {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    this.session.logs = [newLog, ...this.session.logs].slice(0, 50);
    this.notifySession();
  }

  // Push updated screen to companion
  public pushPayload(payload: CompanionPayload, manualRefresh: boolean = false) {
    this.lastPayload = payload;
    this.session.lastSyncTimestamp = Date.now();
    if (this.session.status === "connected") {
      this.session.status = "syncing";
      setTimeout(() => {
        if (this.session.status === "syncing") {
          this.session.status = "connected";
          this.notifySession();
        }
      }, 300);
    }

    // Broadcast across tabs
    if (this.channel) {
      this.channel.postMessage({ type: "SYNC_PAYLOAD", data: payload });
    }

    // Also store in localStorage for cross-window polling
    try {
      localStorage.setItem(`companion_payload_${this.session.pairingCode}`, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }

    // Notify listeners
    this.payloadListeners.forEach((cb) => cb(payload));

    const compCount = payload.screen.rootComponent?.children?.length ?? 0;
    this.addLog(
      "info",
      manualRefresh
        ? `Manual Refresh: Screen '${payload.screen.name}' (${compCount} components) pushed to companion.`
        : `Auto-Sync: Screen '${payload.screen.name}' synced with companion device.`
    );
    this.notifySession();

    // Send to backend API asynchronously for remote companion phone devices
    try {
      fetch("/api/companion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairingCode: this.session.pairingCode,
          payload,
        }),
      }).catch(() => {});
    } catch (e) {
      // silent
    }
  }

  // Connect device (e.g. WiFi companion app or USB bridge)
  public connectDevice(device: CompanionDevice) {
    this.session.connectedDevice = device;
    this.session.status = "connected";
    this.session.connectionType = device.connectionType;
    this.addLog(
      "success",
      `Connected: ${device.name} (${device.model}) [${device.connectionType.toUpperCase()}] • Latency ${device.latencyMs}ms`
    );
    this.notifySession();

    if (this.channel) {
      this.channel.postMessage({ type: "DEVICE_CONNECTED", data: { device } });
    }

    // Sync latest payload immediately upon connect
    if (this.lastPayload) {
      this.pushPayload(this.lastPayload, true);
    }
  }

  // Reset Connection: Terminate session, invalidate code, disconnect device
  public resetConnection() {
    this.resetSessionLocal(true);
  }

  private resetSessionLocal(broadcast: boolean) {
    const newCode = resetStoredPairingCode();
    this.session.pairingCode = newCode;
    this.session.status = "disconnected";
    this.session.connectedDevice = null;
    this.session.lastSyncTimestamp = null;
    this.addLog("warn", `Connection reset. New pairing code generated: ${newCode}`);
    this.notifySession();

    if (broadcast && this.channel) {
      this.channel.postMessage({ type: "RESET_CONNECTION" });
    }

    try {
      fetch("/api/companion/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCode: this.session.pairingCode }),
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }

  // Refresh Companion Screen: Forces instantaneous reload on connected device
  public refreshCompanionScreen() {
    if (this.channel) {
      this.channel.postMessage({ type: "REFRESH_SCREEN" });
    }
    if (this.lastPayload) {
      this.pushPayload(this.lastPayload, true);
    } else {
      this.addLog("info", "Refresh triggered. Waiting for screen payload.");
    }
  }

  public setAutoSync(enabled: boolean) {
    this.session.autoSync = enabled;
    this.addLog("info", `Auto-Sync ${enabled ? "enabled" : "disabled"}.`);
    this.notifySession();
  }

  private notifySession() {
    this.sessionListeners.forEach((cb) => cb({ ...this.session }));
  }
}

export const companionBridge = new CompanionBridge();
