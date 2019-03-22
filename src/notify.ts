import { envVar } from "@therockstorm/utils"
import { SNSEvent } from "aws-lambda"
import axios, { AxiosResponse } from "axios"
import { Alarm, SlackMsg } from "."
import { color, link } from "./mapper"

const URL = envVar("SLACK_WEBHOOK_URL")

export const notify = async (evt: SNSEvent): Promise<AxiosResponse> => {
  const m: Alarm = JSON.parse(evt.Records[0].Sns.Message)
  if (!m.AlarmName || !m.Trigger) throw new Error("Invalid SNS message.")

  const msg: SlackMsg = {
    attachments: [
      {
        color: color(m.NewStateValue),
        fallback: m.AlarmName,
        footer: m.Region,
        text: m.NewStateReason,
        title: m.AlarmName,
        title_link: link(m.Trigger.Namespace, m.AlarmName),
        ts: new Date(m.StateChangeTime).getTime() / 1000
      }
    ]
  }

  return await axios.post(URL, JSON.stringify(msg))
}
