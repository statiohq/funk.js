import { FunkMessage } from "./FunkMessage";
import { FunkStation } from "./FunkStation";

export interface FunkFullDataResponse extends FunkMessage {
    data: FunkStation[];
}
