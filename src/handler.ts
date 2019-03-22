import { error, log } from "@therockstorm/utils"
import { SNSEvent } from "aws-lambda"
import "source-map-support/register"
import { Res } from "."
import { notify } from "./notify"

export const handle = async (evt: SNSEvent): Promise<Res> => {
  log(JSON.stringify(evt))
  try {
    const res = await notify(evt)
    const success = res.status === 200
    log(success)
    return toRes({
      error: success ? undefined : `Expected 200, got ${res.status}`,
      success
    })
  } catch (err) {
    error(err)
    return toRes({ error: err.message, success: false }, 500)
  }
}

const toRes = (body: object, statusCode: number = 200): Res => ({
  body: JSON.stringify(body),
  statusCode
})
