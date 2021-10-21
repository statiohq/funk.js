import { FunkOptions, FunkStation } from "../interfaces";
import { FunkMessage } from "../interfaces/FunkMessage";

export class Funk {
    private options: FunkOptions = {};
    private ws: WebSocket;
    private subscriptions: { fullData: ((fullData: FunkStation[]) => void)[]; stationChanged: ((station: FunkStation) => void)[] } = { fullData: [], stationChanged: [] };

    constructor(options?: FunkOptions) {
        if (options) this.options = options;
        this.ws = new WebSocket(this.options.urlOverride || "wss://funk.statio.cc");
        this.ws.onopen = () => this.onOpen(this);
        this.ws.onmessage = (data: string | MessageEvent<any>) => this.onMessage(this, data);
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

    private onMessage(self: Funk, data: string | MessageEvent<any>) {
        let message: FunkMessage;
        if (typeof data === "string") {
            message = JSON.parse(data);
        } else {
            message = JSON.parse(data.data);
        }
        if (self.options.debugLogging) console.log(`RECEIVED | ${JSON.stringify(message)}`);
        if (message.type === "fullData") {
            self.subscriptions.fullData.forEach((sub) => sub(message.data));
        } else if (message.type === "stationChanged") {
            self.subscriptions.stationChanged.forEach((sub) => sub(message.data));
        }
    }

    private onOpen(self: Funk) {
        if (!self.options.disableAutoPing)
            setInterval(() => {
                self.emitPing();
            }, 10000);
        if (!self.options.dontGetFullDataAutomatically) self.emitGetFullData();
    }
}
