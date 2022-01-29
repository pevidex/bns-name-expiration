import {
  NameDetails,
  Network,
  ClientError,
  BlockDetails,
} from "../../definitions";
import { HttpService } from "./httpService";
import get from "axios";

export class AxiosHttpService implements HttpService {
  #url: string;
  constructor(private readonly network: Network) {
    this.#url = `https://stacks-node-api.${network}.stacks.co`;
  }
  async getAvgBlockTime(): Promise<number> {
    return get(
      `${this.#url}/extended/v1/info/network_block_time/${this.network}`
    ).then((res) => res.data["target_block_time"] * 1000);
  }
  async getCurrBlock(): Promise<BlockDetails> {
    return get(`${this.#url}/extended/v1/block`).then((res) => {
      return {
        height: res.data["total"],
        burn_block_time: res.data["results"][0]["burn_block_time"] * 1000,
      };
    });
  }
  async getNameDetails(name: string): Promise<NameDetails> {
    return get(`${this.#url}/v1/names/${name}`)
      .then((res) => res.data)
      .catch((error) => {
        console.log(error);
        throw new ClientError("Invalid username");
      });
  }
}
