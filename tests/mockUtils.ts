import { BlockDetails, NameDetails } from "../src/definitions";
import { ContractService } from "../src/services/contract/contractService";
import { HttpService } from "../src/services/http/httpService";

export class MockedHttpService implements HttpService {
  constructor(
    private readonly avgBlockTime: number,
    private readonly currBlock: BlockDetails,
    private readonly nameDetails: NameDetails
  ) {}
  getAvgBlockTime() {
    return Promise.resolve(this.avgBlockTime);
  }
  getCurrBlock() {
    return Promise.resolve(this.currBlock);
  }
  getNameDetails() {
    return Promise.resolve(this.nameDetails);
  }
}

export class MockedContractService implements ContractService {
  constructor(private readonly expireBlock: number) {}
  getExpireBlockByName() {
    return Promise.resolve(this.expireBlock);
  }
}

export const isValidDate = (date: any) => {
  return date instanceof Date && !isNaN(date as any);
};
