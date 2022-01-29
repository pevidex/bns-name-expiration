import { expect } from "chai";
import express from "express";
import NodeCache from "node-cache";
import request from "supertest";
import { NameDetails } from "../../src/definitions";
import { createRoutes } from "../../src/routes/username";
import { ContractService } from "../../src/services/contract/contractService";
import { HttpService } from "../../src/services/http/httpService";
import { spy } from "sinon";
import {
  isValidDate,
  MockedContractService,
  MockedHttpService,
} from "../mockUtils";

describe("username", () => {
  before(() => {
    console.log = () => {};
  });
  describe("getExpiringDate - integration", () => {
    const app = express();
    app.use(createRoutes());
    it("should return 200 for a valid username (.id)", async () => {
      await request(app)
        .get("/expiring-date/muneeb.id")
        .expect(200)
        .then((response) => {
          const date = new Date(response.body["expiring_date"]);
          expect(isValidDate(date)).to.be.true;
        });
    });
    it("should return 200 for a valid username (.btc)", async () => {
      await request(app)
        .get("/expiring-date/springmaru.btc")
        .expect(200)
        .then((response) => {
          const date = new Date(response.body["expiring_date"]);
          expect(isValidDate(date)).to.be.true;
        });
    });
    it("should return 400 for an invalid username", async () => {
      await request(app)
        .get("/expiring-date/invalid-username.btc")
        .expect(400)
        .then((response) => {
          expect(response.body.message).to.be.eql("Invalid username");
        });
    });
    it("should return 400 for missing domain", async () => {
      await request(app)
        .get("/expiring-date/123")
        .expect(400)
        .then((response) => {
          expect(response.body.message).to.be.eql("Unexpected domain");
        });
    });
    it("should return 400 for an invalid domain", async () => {
      await request(app)
        .get("/expiring-date/muneeb.invalid")
        .expect(400)
        .then((response) => {
          expect(response.body.message).to.be.eql("Unexpected domain");
        });
    });
  });

  describe("getExpiringDate - unit", () => {
    it("should expire 10 min after current block (.id)", async () => {
      const httpService: HttpService = new MockedHttpService(
        600000,
        { burn_block_time: 1643475129000, height: 46832 },
        {
          expire_block: 46833,
        } as NameDetails
      );
      const cache: NodeCache = new NodeCache({ stdTTL: 15 });

      const app = express();
      app.use(createRoutes(httpService, {} as ContractService, cache));

      expect(cache.has("some-username.btc")).to.be.false;

      await request(app)
        .get("/expiring-date/some-username.id")
        .expect(200)
        .then((response) => {
          const currBlockDate = new Date(1643475129000);
          currBlockDate.setMinutes(currBlockDate.getMinutes() + 10);
          expect(currBlockDate.toUTCString()).to.be.eql(
            response.body["expiring_date"]
          );
          expect(cache.has("some-username.id")).to.be.true;
        });
    });
    it("should be already expired (.id)", async () => {
      const httpService: HttpService = new MockedHttpService(
        600000,
        { burn_block_time: 1643475129000, height: 46832 },
        {
          expire_block: 46830,
        } as NameDetails
      );
      const cache: NodeCache = new NodeCache({ stdTTL: 15 });

      const app = express();
      app.use(createRoutes(httpService, {} as ContractService, cache));

      expect(cache.has("some-username.btc")).to.be.false;

      await request(app)
        .get("/expiring-date/some-username.id")
        .expect(200)
        .then((response) => {
          const currBlockDate = new Date(1643475129000);
          expect(currBlockDate > new Date(response.body["expiring_date"])).to.be
            .true;
          expect(cache.has("some-username.id")).to.be.true;
        });
    });
    it("should expire 1 year after current block (.btc)", async () => {
      const contractService: ContractService = new MockedContractService(99392);
      const httpService: HttpService = new MockedHttpService(
        600000,
        { burn_block_time: 1643475129000, height: 46832 },
        {
          expire_block: -1, // not used
        } as NameDetails
      );
      const cache: NodeCache = new NodeCache({ stdTTL: 15 });

      const app = express();
      app.use(createRoutes(httpService, contractService, cache));

      expect(cache.has("some-username.btc")).to.be.false;

      await request(app)
        .get("/expiring-date/some-username.btc")
        .expect(200)
        .then((response) => {
          const currBlockDate = new Date(1643475129000);
          currBlockDate.setMinutes(currBlockDate.getMinutes() + 525600);
          expect(currBlockDate.toUTCString()).to.be.eql(
            response.body["expiring_date"]
          );
          expect(cache.has("some-username.btc")).to.be.true;
        });
    });
    it("should hit cache", async () => {
      const contractService: ContractService = new MockedContractService(99392);
      const httpService: HttpService = new MockedHttpService(
        600000,
        { burn_block_time: 1643475129000, height: 46832 },
        {
          expire_block: -1, // not used
        } as NameDetails
      );
      const cache: NodeCache = new NodeCache({ stdTTL: 15 });

      const app = express();
      app.use(createRoutes(httpService, contractService, cache));

      const spyCacheGet = spy(cache, "get");

      expect(cache.has("some-username.btc")).to.be.false;
      await request(app).get("/expiring-date/some-username.btc");
      expect(cache.has("some-username.btc")).to.be.true;
      await request(app).get("/expiring-date/some-username.btc");

      expect(spyCacheGet.calledOnce).to.be.true;
    });
  });
});
