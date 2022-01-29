import http from "http";
import express, { Express } from "express";
import { createRoutes } from "./routes/username";
import { HttpService } from "./services/http/httpService";
import { AxiosHttpService } from "./services/http/axiosHttpService";
import { Network } from "./definitions";
import { ContractImpl } from "./services/contract/contractImpl";
import { ContractService } from "./services/contract/contractService";
import NodeCache from "node-cache";

const router: Express = express();

/**
 * TODO: Set Testnet configs. Currently, it's only ready to run mainnet. In order to run Testnet we need to change ContractService to receive
 * Testnet configurations as parameters. This can be achieved by having two distinct configurations which we would load based on the env variable NODE_ENV
 */
const network =
  process.env.NODE_ENV == "production" ? Network.Mainnet : Network.Mainnet;

// Dependencies
const httpService: HttpService = new AxiosHttpService(network);
const contractService: ContractService = new ContractImpl(network);
const cache: NodeCache = new NodeCache({ stdTTL: 15 });

// Parse the request
router.use(express.urlencoded({ extended: false }));
// Takes care of JSON data */
router.use(express.json());

router.use((req, res, next) => {
  // set the CORS policy
  res.header("Access-Control-Allow-Origin", "*");
  // set the CORS headers
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // set the CORS method headers
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
    return res.status(200).json({});
  }
  next();
});

// Routes
router.use("/", createRoutes(httpService, contractService, cache));

// Error handling
router.use((req, res, next) => {
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message,
  });
});

const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
);
