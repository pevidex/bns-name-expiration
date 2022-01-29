/** source/routes/posts.ts */
import express from "express";
import { Network } from "../definitions";
import controller from "../controllers/username";
import { ContractImpl } from "../services/contract/contractImpl";
import { ContractService } from "../services/contract/contractService";
import { AxiosHttpService } from "../services/http/axiosHttpService";
import { HttpService } from "../services/http/httpService";
import NodeCache from "node-cache";

export const createRoutes = (
  httpService: HttpService = new AxiosHttpService(Network.Mainnet),
  contractService: ContractService = new ContractImpl(Network.Mainnet),
  cache = new NodeCache({ stdTTL: 15 }),
) => {
  const router = express.Router();
  router.get(
    "/expiring-date/:username",
    controller.getExpiringDate(httpService, contractService, cache)
  );
  return router;
};
