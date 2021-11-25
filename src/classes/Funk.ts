import { FunkOptions, FunkStation } from "../interfaces";
import { FunkMessage } from "../interfaces/FunkMessage";
import { w3cwebsocket, IMessageEvent } from "websocket";

/**
 * Class representing the Funk API Wrapper
 */
export class Funk {
    /**
     * @hidden
     */
    private options: FunkOptions = {};

    /**
     * @hidden
     */
    private ws: WebSocket | w3cwebsocket;

    /**
     * @hidden
     */
    private subscriptions: { fullData: ((fullData: FunkStation[]) => void)[]; stationChanged: ((station: FunkStation) => void)[] } = { fullData: [], stationChanged: [] };

    /**
     * Constructs the Funk API Wrapper
     */
    constructor(options?: FunkOptions) {
        if (options) this.options = options;
        if (typeof process === "object") {
            this.ws = new w3cwebsocket(this.options.urlOverride || "wss://funk.statio.cc");
            this.ws.onopen = () => this.onOpen(this);
            this.ws.onmessage = ({ data }: IMessageEvent) => this.onMessage(this, data);
            /*
            this.ws.on("open", () => this.onOpen(this));
            this.ws.on("message", (data: string | MessageEvent<any>) => this.onMessage(this, data));
            */
        } else {
            this.ws = new WebSocket(this.options.urlOverride || "wss://funk.statio.cc");
            this.ws.onopen = () => this.onOpen(this);
            this.ws.onmessage = (data: string | MessageEvent<any>) => this.onMessage(this, data);
        }
    }

    /**
     * Event returning full station data when the websocket is opened
     */
    public on(event: "fullData", callback: (fullData: FunkStation[]) => void): void;

    /**
     * Event returning data updates to be merged with full data from websocket connection
     */
    public on(event: "stationChanged", callback: (station: FunkStation) => void): void;

    public on(event: "fullData" | "stationChanged", callback: ((fullData: FunkStation[]) => void) | ((station: FunkStation) => void)): void {
        if (event === "fullData") {
            this.subscriptions.fullData.push(callback as any);
        } else if (event === "stationChanged") {
            this.subscriptions.stationChanged.push(callback as any);
        }
    }

    /**
     * Sends a ping message to the server (by default, automatic pinging is enabled)
     */
    public emitPing() {
        this.send({ type: "ping" });
    }

    /**
     * Sends a message to the server requesting full data (by default, automatic full data request on connection is enabled)
     */
    public emitGetFullData() {
        this.send({ type: "getFullData" });
    }

    /**
     * Sends a custom message to the Funk Server
     */
    public send(message: FunkMessage) {
        this.ws.send(JSON.stringify(message));
        if (this.options.debugLogging) console.log(`SENT     | ${JSON.stringify(message)}`);
    }

    /**
     * Returns the current websocket connection
     */
    public getWs(): WebSocket | w3cwebsocket {
        return this.ws;
    }

    /**
     * @hidden
     */
    private onMessage(self: Funk, data: string | MessageEvent<any> | Buffer | IMessageEvent | ArrayBuffer) {
        let message: FunkMessage;

        if (data instanceof Buffer || data instanceof ArrayBuffer) {
            data = data.toString();
        }

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

    /**
     * @hidden
     */
    private onOpen(self: Funk) {
        if (!self.options.disableAutoPing)
            setInterval(() => {
                self.emitPing();
            }, 10000);
        if (!self.options.dontGetFullDataAutomatically) self.emitGetFullData();
    }
}
