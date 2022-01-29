import { NextFunction, Request, Response } from "express";
import NodeCache from "node-cache";
import { BlockDetails, ClientError } from "../definitions";
import { ContractService } from "../services/contract/contractService";
import { HttpService } from "../services/http/httpService";
import { calculateExpireDate } from "../utils";

/**
 * Builds and returns a response containing the expiring date of the given username
 *
 * @param httpService service responsible to handle http calls
 * @param contractService service responsible to perform blockchain direct calls
 * @returns void
 */
const getExpiringDate = (
  httpService: HttpService,
  contractService: ContractService,
  cache: NodeCache,
) => {
  // Arrow function that returns a function. This is a simple way to allow dependency injection and consequently makes test easier
  return async (req: Request, res: Response, next: NextFunction) => {
    // Obtaining username
    const username = req.params.username;
    if (!username || !(typeof username === "string")) {
      return res
        .status(400)
        .json({ message: "Query parameter username missing" });
    }

    // Cache lookup for this username
    // Super simple cache system. In a real scenario, the key should not be the username
    if (cache.has(username)) {
      return res.status(200).json({
        expiring_date: cache.get(username),
      });
    }

    // For simplicity, I'm only considering two domains
    // TODO: getting the average block time and current block details can be cached or hardcoded. 
    // I'm just not aware how frequent they change so I decided to have them fetched in runtime. 
    // I'm aware of the performance impact it has
    let promises: [Promise<number>, Promise<BlockDetails>, Promise<number>] = [
      httpService.getAvgBlockTime(),
      httpService.getCurrBlock(),
      username.endsWith(".btc")
        ? contractService.getExpireBlockByName(username)
        : username.endsWith(".id")
        ? httpService
            .getNameDetails(username)
            .then((data) => data["expire_block"])
        : Promise.reject(new ClientError("Unexpected domain")),
    ];

    // All promises can be run in paralell
    return Promise.all(promises)
      .then((values) => {
        const expireDateStr = calculateExpireDate(
          values[2], // avg block time
          values[1], // curr block details
          values[0] // exp block
        ).toUTCString();
        // cache set
        cache.set(username, expireDateStr);
        return res.status(200).json({
          expiring_date: expireDateStr,
        });
      })
      .catch((error: Error) => {
        console.log(error.message);
        if (error instanceof ClientError) {
          return res.status(400).json({ message: error.message });
        }
        return res
          .status(500)
          .json({ message: "Something happened on our side" });
      });
  };
};

export default { getExpiringDate };
