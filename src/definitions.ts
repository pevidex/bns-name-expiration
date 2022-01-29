export enum Network {
  Testnet = "testnet",
  Mainnet = "mainnet",
}
export interface NameDetails {
  address: string;
  blockchain: string;
  expire_block: number;
  last_txid: string;
  status: string;
  zonefile: string;
  zonefile_hash: string;
}

export class ClientError extends Error {
  constructor(readonly clientMessage: string) {
    super(clientMessage);
  }
}

export interface BlockDetails {
  burn_block_time: number,
  height: number,
}
