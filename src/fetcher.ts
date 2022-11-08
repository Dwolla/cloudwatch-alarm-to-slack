import asyncRetry from "async-retry"
import CloudWatchLogs, {
  GetQueryResultsResponse
} from "aws-sdk/clients/cloudwatchlogs"
import { Alarm, ITrigger } from "."

const TEN_MINS = 600000
const cwl = new CloudWatchLogs()

export const fetch = async (a: Alarm): Promise<string> => {
  const lgn = logGroupName(a.Trigger)
  if (!lgn) return a.NewStateReason

  const ts = new Date(a.StateChangeTime).getTime()
  const id = (await cwl
    .startQuery({
      endTime: ts,
      limit: 2,
      logGroupName: lgn,
      queryString: `fields @timestamp, @message | filter @message like /\\[error\\]|timed|exited/ | sort @timestamp`,
      startTime: ts - TEN_MINS
    })
    .promise()).queryId

  const r = await asyncRetry<GetQueryResultsResponse>(
    async () => {
      const res = await cwl.getQueryResults({ queryId: id as string }).promise()
      return res.status === "Running"
        ? console.error(new Error(res.status))
        : res
    },
    { maxTimeout: 5000, minTimeout: 1000, retries: 5 }
  )

  console.log(JSON.stringify(r, null, 2))
  return r.results && r.results.length
    ? `${a.NewStateReason}${
        r.results.map(
          x =>
            `\n${(x.find(y => y.field === "@message") || { value: "" }).value}`
        )[0]
      }`
    : a.NewStateReason
}

const groups = [
  {
    functionName: (t: ITrigger): string | undefined =>
      t.Dimensions.filter(d => d.name === "FunctionName").map(d => d.value)[0],
    match: (t: ITrigger) =>
      t.Namespace === "AWS/Lambda" && t.MetricName === "Errors"
  },
  {
    functionName: (t: ITrigger) => {
      const ps = t.MetricName.split("-")
      return ps.length === 5 ? `${ps[0]}-${ps[1]}-lambda-${ps[4]}` : undefined
    },
    match: (t: ITrigger) =>
      t.Namespace === "LogMetrics" && t.MetricName.includes("webhooks")
  }
]

const logGroupName = (t: ITrigger): string | undefined => {
  const group = groups.find(g => g.match(t))
  const fn = group ? group.functionName(t) : undefined
  return fn ? `/aws/lambda/${fn}` : undefined
}
