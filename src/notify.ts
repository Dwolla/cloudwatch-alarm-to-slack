import { SNSEvent } from "aws-lambda"
import axios, { AxiosResponse } from "axios"
import { Alarm, Destination, SlackMsg } from "."
import { fetch } from "./fetcher"
import { color, link } from "./mapper"

export const destinations = (): Destination[] =>
  [
    { name: "dwolla", url: process.env.SLACK_WEBHOOK_URL },
    { name: "nmi", url: process.env.SLACK_WEBHOOK_URL_NMI }
  ].filter((d): d is Destination => Boolean(d.url))

export const notify = async (evt: SNSEvent): Promise<AxiosResponse[]> => {
  const a: Alarm = JSON.parse(evt.Records[0].Sns.Message)
  if (!a.AlarmName || !a.Trigger) throw new Error("Invalid SNS message.")

  const msg: SlackMsg = {
    attachments: [
      {
        color: color(a.NewStateValue),
        fallback: a.AlarmName,
        footer: a.Region,
        text: await fetch(a),
        title: a.AlarmName,
        title_link: link(a.Trigger.Namespace, a.AlarmName),
        ts: new Date(a.StateChangeTime).getTime() / 1000
      }
    ]
  }

  const dests = destinations()
  if (!dests.length) throw new Error("No Slack webhook configured.")

  const body = JSON.stringify(msg)
  const results = await Promise.allSettled(
    dests.map(d => axios.post(d.url, body))
  )

  // Never log d.url; the webhook URL is the credential.
  const sent = results.reduce((acc: AxiosResponse[], r, i) => {
    if (r.status === "fulfilled") return [...acc, r.value]
    console.error(`Slack delivery to ${dests[i].name} failed: ${r.reason}`)
    return acc
  }, [])

  // One workspace being down must not suppress the alarm in the other, so a
  // partial failure is logged rather than thrown.
  if (!sent.length) throw new Error("Slack delivery failed for every webhook.")

  return sent
}
