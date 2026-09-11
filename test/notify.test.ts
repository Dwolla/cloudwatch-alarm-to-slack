import { SNSEventRecord } from "aws-lambda"
import axios from "axios"
import * as mapper from "../src/mapper"

jest.mock("axios")
jest.mock("../src/mapper")
const color = mapper.color as jest.Mock
const link = mapper.link as jest.Mock
const post = axios.post as jest.Mock

import { notify } from "../src/notify"

describe("notify", () => {
  const COLOR = "c"
  const LINK = "l"
  const RES = { x: 0 }
  const ERR = new Error("Invalid SNS message.")
  const NMI = "nmi.slack.com"
  color.mockReturnValue(COLOR)
  link.mockReturnValue(LINK)
  post.mockResolvedValue(RES)
  const MSG = {
    AWSAccountId: "111111111111",
    AlarmDescription: null,
    AlarmName: "log-error",
    NewStateReason: "Threshold Crossed.",
    NewStateValue: "ALARM",
    OldStateValue: "INSUFFICIENT_DATA",
    Region: "US West (Oregon)",
    StateChangeTime: "2019-02-19T18:34:04.271+0000",
    Trigger: { Namespace: "AWS/Lambda" }
  }
  const evt = () => ({
    Records: [{ Sns: { Message: JSON.stringify(MSG) } } as SNSEventRecord]
  })
  const body = () =>
    JSON.stringify({
      attachments: [
        {
          color: COLOR,
          fallback: MSG.AlarmName,
          footer: MSG.Region,
          text: MSG.NewStateReason,
          title: MSG.AlarmName,
          title_link: LINK,
          ts: new Date(MSG.StateChangeTime).getTime() / 1000
        }
      ]
    })

  afterEach(() => {
    delete process.env.SLACK_WEBHOOK_URL_NMI
    post.mockClear()
    post.mockResolvedValue(RES)
  })

  it("resolves to response", async () => {
    await expect(notify(evt())).resolves.toEqual([RES])

    expect(color).toHaveBeenCalledWith(MSG.NewStateValue)
    expect(link).toHaveBeenCalledWith(MSG.Trigger.Namespace, MSG.AlarmName)
    expect(post).toHaveBeenCalledWith("slack.com", body())
  })

  it("posts to both workspaces when the NMI webhook is set", async () => {
    process.env.SLACK_WEBHOOK_URL_NMI = NMI

    await expect(notify(evt())).resolves.toEqual([RES, RES])

    expect(post).toHaveBeenCalledWith("slack.com", body())
    expect(post).toHaveBeenCalledWith(NMI, body())
  })

  it("still resolves when only one workspace fails", async () => {
    process.env.SLACK_WEBHOOK_URL_NMI = NMI
    post.mockResolvedValueOnce(RES).mockRejectedValueOnce(new Error("nope"))

    await expect(notify(evt())).resolves.toEqual([RES])
  })

  it("rejects when every workspace fails", async () => {
    process.env.SLACK_WEBHOOK_URL_NMI = NMI
    post.mockRejectedValue(new Error("nope"))

    await expect(notify(evt())).rejects.toEqual(
      new Error("Slack delivery failed for every webhook.")
    )
  })

  it("rejects if no AlarmName", async () => {
    delete MSG.AlarmName
    await expect(notify(evt())).rejects.toEqual(ERR)
  })

  it("rejects if no Trigger", async () => {
    delete MSG.Trigger
    await expect(notify(evt())).rejects.toEqual(ERR)
  })
})
