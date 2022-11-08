import { SNSEvent } from "aws-lambda";
import "source-map-support/register";
import { Res } from ".";
import { notify } from "./notify";
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
require("dotenv").config();

export const handle = async (evt: SNSEvent): Promise<Res> => {
  console.log(JSON.stringify(evt));
  try {
    const res = await notify(evt);
    const success = res.status === 200;
    console.log(success);
    return toRes({
      error: success ? undefined : `Expected 200, got ${res.status}`,
      success,
    });
  } catch (err) {
    console.error(err);
    return toRes({ error: err.message, success: false }, 500);
  }
};
/* eslint-disable @typescript-eslint/ban-types */
const toRes = (body: object, statusCode = 200): Res => ({
  body: JSON.stringify(body),
  statusCode,
});
