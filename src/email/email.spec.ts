import { afterEach, describe, expect, it } from "@jest/globals";
import { enableFetchMocks } from "jest-fetch-mock";
import { ErrorResponse } from "../interface";
import { Kankei } from "../kankei";
import { CreateEmailResponseSuccess, CreateEmailValues } from "./email";

const appSecret =
  "kankei_YFNZCVZmEMETBmuxkKNkrZLhMUtGiqAHIdRikhWSMHaagcfsghKZoLRMlXjCnRUz";

const kankei = new Kankei(appSecret);

enableFetchMocks();

describe("Email", () => {
  afterEach(() => fetchMock.resetMocks());

  describe("create", () => {
    it("create email successfully", async () => {
      const response: CreateEmailResponseSuccess = {
        id: "6d9b91c0-ee79-4cdb-9652-1ad5b760fdb7",
      };

      fetchMock.mockOnce(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${appSecret}`,
        },
      });

      const values: CreateEmailValues = {
        to: "hello@world.com",
        subject: "Hello World!",
        html: "<span>Hello world!</span>",
      };

      const data = await kankei.email.create(values);
      expect(data).toMatchObject({
        data: response,
        error: null,
      });
    });

    it("not create email without HTML", async () => {
      const response: ErrorResponse = {
        name: "validation-error",
        message: "Missing 'html' field",
      };

      fetchMock.mockOnce(JSON.stringify(response), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${appSecret}`,
        },
      });

      const values = {} as CreateEmailValues;

      const data = await kankei.email.create(values);
      expect(data).toMatchObject({
        data: null,
        error: response,
      });
    });

    it("return an error when fetch fail", async () => {
      const oldEnv = process.env;

      process.env = {
        ...oldEnv,
        KANKEI_BASE_URL: "http://invalid.com",
      };

      const values: CreateEmailValues = {
        to: "hello@world.com",
        subject: "Hello World!",
        html: "<span>Hello world!</span>",
      };

      const data = await kankei.email.create(values);
      expect(data).toMatchObject({
        data: null,
        error: {
          message: "Unable to fetch data. The request could not be resolved",
          name: "server-error",
        },
      });

      process.env = oldEnv;
    });

    it("return an error when api response is text", async () => {
      const response: ErrorResponse = {
        message: "Internal server error. Unable to process your request",
        name: "server-error",
      };

      fetchMock.mockOnce(JSON.stringify(response), {
        status: 422,
        headers: {
          Authorization: `Bearer ${appSecret}`,
        },
      });

      const result = await kankei.email.create({
        to: "hello@world.com",
        subject: "Hello World!",
        html: "<span>Hello world!</span>",
      });

      expect(result).toMatchObject({
        data: null,
        error: response,
      });
    });
  });
});
