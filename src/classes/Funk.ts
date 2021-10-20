import WebSocket from "ws";
import { FunkFullDataResponse, FunkOptions, FunkStation } from "../interfaces";
import { FunkMessage } from "../interfaces/FunkMessage";

export class Funk {
    private options: FunkOptions = {};
    private ws: WebSocket;
    private subscriptions: { fullData: ((fullData: FunkStation[]) => void)[]; stationChanged: ((station: FunkStation) => void)[] } = { fullData: [], stationChanged: [] };

    constructor(options?: FunkOptions) {
        if (options) this.options = options;
        this.ws = new WebSocket(this.options.urlOverride || "wss://funk.statio.cc");
        this.ws.on("open", () => {
            if (!this.options.disableAutoPing)
                setInterval(() => {
                    this.emitPing();
                }, 10000);
            if (!this.options.dontGetFullDataAutomatically) this.emitGetFullData();
        });
        this.ws.on("message", (data: string) => {
            const message: FunkMessage = JSON.parse(data);
            if (this.options.debugLogging) console.log(`RECEIVED | ${JSON.stringify(message)}`);
            if (message.type === "fullData") {
                this.subscriptions.fullData.forEach((sub) => sub(message.data));
            } else if (message.type === "stationChanged") {
                this.subscriptions.stationChanged.forEach((sub) => sub(message.data));
            }
        });
    }

    public on(event: "fullData", callback: (fullData: FunkStation[]) => void): void;
    public on(event: "stationChanged", callback: (station: FunkStation) => void): void;
    public on(event: "fullData" | "stationChanged", callback: ((fullData: FunkStation[]) => void) | ((station: FunkStation) => void)): void {
        if (event === "fullData") {
            this.subscriptions.fullData.push(callback as any);
        } else if (event === "stationChanged") {
            this.subscriptions.stationChanged.push(callback as any);
        }
    }

    public emitPing() {
        this.send({ type: "ping" });
    }

    public emitGetFullData() {
        this.send({ type: "getFullData" });
    }

    public send(message: FunkMessage) {
        this.ws.send(JSON.stringify(message));
        if (this.options.debugLogging) console.log(`SENT     | ${JSON.stringify(message)}`);
    }
}
