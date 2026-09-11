import { SNSEvent } from "aws-lambda"
import "source-map-support/register"
import { Res } from "."
import { notify } from "./notify"
import dotenv from "dotenv"
dotenv.config()

export const handle = async (evt: SNSEvent): Promise<Res> => {
  console.log(JSON.stringify(evt))
  try {
    const res = await notify(evt)
    const bad = res.filter(r => r.status !== 200)
    const success = bad.length === 0
    console.log(success)
    return toRes({
      error: success
        ? undefined
        : `Expected 200, got ${bad.map(r => r.status).join(", ")}`,
      success
    })
  } catch (err) {
    console.error(err)
    return toRes({ error: err.message, success: false }, 500)
  }
}

const toRes = (body: object, statusCode = 200): Res => ({
  body: JSON.stringify(body),
  statusCode
})
