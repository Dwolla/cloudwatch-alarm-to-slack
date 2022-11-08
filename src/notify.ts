import { SNSEvent } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import { Alarm, SlackMsg } from ".";
import { fetch } from "./fetcher";
import { color, link } from "./mapper";

const URL = () => {
  if (process.env.SLACK_WEBHOOK_URL) {
    return process.env.SLACK_WEBHOOK_URL;
  } else {
    throw new Error("must prove slack webhook url as env var");
  }
};

export const notify = async (evt: SNSEvent): Promise<AxiosResponse> => {
  const a: Alarm = JSON.parse(evt.Records[0].Sns.Message);
  if (!a.AlarmName || !a.Trigger) throw new Error("Invalid SNS message.");

  const msg: SlackMsg = {
    attachments: [
      {
        color: color(a.NewStateValue),
        fallback: a.AlarmName,
        footer: a.Region,
        text: await fetch(a),
        title: a.AlarmName,
        title_link: link(a.Trigger.Namespace, a.AlarmName),
        ts: new Date(a.StateChangeTime).getTime() / 1000,
      },
    ],
  };

  return await axios.post(URL(), JSON.stringify(msg));
};
