import { SNSEventRecord } from "aws-lambda";
import axios from "axios";
import * as mapper from "../src/mapper";

jest.mock("axios");
jest.mock("../src/mapper");
const color = mapper.color as jest.Mock;
const link = mapper.link as jest.Mock;
const post = axios.post as jest.Mock;
import { notify } from "../src/notify";

describe("notify", () => {
  const COLOR = "c";
  const LINK = "l";
  const RES = { x: 0 };
  const ERR = new Error("Invalid SNS message.");
  color.mockReturnValue(COLOR);
  link.mockReturnValue(LINK);
  post.mockResolvedValue(RES);
  type Trigger = {
    Namespace: string;
  };
  type MsgType = {
    AWSAccountId: string;
    AlarmDescription: null;
    AlarmName?: string;
    NewStateReason: string;
    NewStateValue: string;
    OldStateValue: string;
    Region: string;
    StateChangeTime: string;
    Trigger?: Trigger;
  };
  const MSG: MsgType = {
    AWSAccountId: "111111111111",
    AlarmDescription: null,
    AlarmName: "log-error",
    NewStateReason: "Threshold Crossed.",
    NewStateValue: "ALARM",
    OldStateValue: "INSUFFICIENT_DATA",
    Region: "US West (Oregon)",
    StateChangeTime: "2019-02-19T18:34:04.271+0000",
    Trigger: { Namespace: "AWS/Lambda" },
  };
  const evt = (message = MSG) => ({
    Records: [{ Sns: { Message: JSON.stringify(message) } } as SNSEventRecord],
  });

  it("resolves to response", async () => {
    await expect(notify(evt())).resolves.toBe(RES);

    expect(color).toHaveBeenCalledWith(MSG.NewStateValue);
    expect(link).toHaveBeenCalledWith(MSG?.Trigger?.Namespace, MSG.AlarmName);
    expect(post).toHaveBeenCalledWith(
      "slack.com",
      JSON.stringify({
        attachments: [
          {
            color: COLOR,
            fallback: MSG.AlarmName,
            footer: MSG.Region,
            text: MSG.NewStateReason,
            title: MSG.AlarmName,
            title_link: LINK,
            ts: new Date(MSG.StateChangeTime).getTime() / 1000,
          },
        ],
      })
    );
  });

  it("rejects if no AlarmName", async () => {
    delete MSG.AlarmName;
    await expect(notify(evt())).rejects.toEqual(ERR);
  });

  it("rejects if no Trigger", async () => {
    delete MSG.Trigger;
    await expect(notify(evt())).rejects.toEqual(ERR);
  });
});
