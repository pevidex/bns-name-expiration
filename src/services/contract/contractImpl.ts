import { StacksMainnet, StacksTestnet, StacksNetwork } from "@stacks/network";
import { bufferCVFromString, callReadOnlyFunction } from "@stacks/transactions";
import { ClientError, Network } from "../../definitions";
import { ContractService } from "./contractService";

const CONTRACT_ADDRESS = "SP000000000000000000002Q6VF78";
const CONTRACT_NAME = "bns";

export class ContractImpl implements ContractService {
  #network: StacksNetwork;
  constructor(private readonly network: Network) {
    this.#network =
      network == Network.Mainnet ? new StacksMainnet() : new StacksTestnet();
  }
  async getExpireBlockByName(username: string): Promise<number> {
    const options = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "name-resolve",
      functionArgs: [
        bufferCVFromString("btc"),
        bufferCVFromString(username.replace(".btc", "")),
      ],
      network: this.#network,
      senderAddress: CONTRACT_ADDRESS,
    };

    const result: any = await callReadOnlyFunction(options);
    const leasingEnd = result?.value?.data?.["lease-ending-at"]?.value?.value;
    if (!leasingEnd) {
      throw new ClientError("Invalid username");
    }
    return Number(leasingEnd);
  }
}
