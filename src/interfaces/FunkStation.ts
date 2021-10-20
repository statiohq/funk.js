import { FunkParentType } from "../types";
import { FunkStationPlaying } from "./FunkStationPlaying";
import { FunkStationPresenter } from "./FunkStationPresenter";

export interface FunkStation {
    id: number;
    slug?: string;
    fullName?: string;
    shortName?: string;
    active?: boolean;
    logo?: string;
    slogan?: string;
    description?: string;
    website?: string;
    language?: string;
    country?: string;
    parentStation?: FunkStation;
    parentType?: FunkParentType;
    streamUrl?: string;
    presenter?: FunkStationPresenter;
    playing?: FunkStationPlaying;
    listening?: number;
}
