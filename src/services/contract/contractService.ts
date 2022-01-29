export interface ContractService {
    getExpireBlockByName: (username: string) => Promise<number>;
}
