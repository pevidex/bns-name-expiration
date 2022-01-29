import { BlockDetails, NameDetails } from "../../definitions";

export interface HttpService {
    getAvgBlockTime: () => Promise<number>;
    getCurrBlock: () => Promise<BlockDetails>;
    getNameDetails: (name: string) => Promise<NameDetails>;
}
