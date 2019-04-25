import CloudWatchLogs from "aws-sdk/clients/cloudwatchlogs"
import { Alarm } from "../src"

jest.mock("aws-sdk/clients/cloudwatchlogs")
const cwl = (CloudWatchLogs as unknown) as jest.Mock
const startQuery = jest.fn()
const getQueryResults = jest.fn()
cwl.mockImplementationOnce(() => ({ startQuery, getQueryResults }))
import { fetch } from "../src/fetcher"

describe("fetch", () => {
  const queryId = "id"
  const qs =
    "fields @timestamp, @message | filter @message like /\\[error\\]|timed|exited/ | sort @timestamp"
  const fn = "webhooks-0-lambda-uat"
  const now = new Date()
  let alarm: Alarm
  const qr = {
    results: [
      [
        { field: "@timestamp", value: "ts" },
        { field: "@message", value: "Yo\n" }
      ]
    ],
    status: "Complete"
  }

  beforeEach(
    () =>
      (alarm = {
        NewStateReason: "nsr",
        StateChangeTime: now.toISOString(),
        Trigger: {
          Dimensions: [{ name: "FunctionName", value: fn }],
          MetricName: "Errors",
          Namespace: "AWS/Lambda"
        }
      } as Alarm)
  )

  it("NewStateReason if unknown namespace", async () => {
    alarm.Trigger.Namespace = "unknown"
    await expect(fetch(alarm)).resolves.toEqual(alarm.NewStateReason)
  })

  it("NewStateReason if unknown AWS/Lambda metricName", async () => {
    alarm.Trigger.MetricName = "unknown"
    await expect(fetch(alarm)).resolves.toEqual(alarm.NewStateReason)
  })

  it("NewStateReason if unknown LogMetrics metricName", async () => {
    alarm.Trigger.Namespace = "LogMetrics"
    alarm.Trigger.MetricName = "unknown"
    await expect(fetch(alarm)).resolves.toEqual(alarm.NewStateReason)
  })

  it("NewStateReason if unknown namespace", async () => {
    alarm.Trigger.Namespace = "unknown"
    await expect(fetch(alarm)).resolves.toEqual(alarm.NewStateReason)
  })

  it("appends query for AWS/Lambda Errors", async () => {
    startQuery.mockReturnValue({ promise: () => ({ queryId }) })
    getQueryResults.mockReturnValue({ promise: () => qr })

    await expect(fetch(alarm)).resolves.toEqual(`${alarm.NewStateReason}\nYo\n`)

    expect(startQuery).toHaveBeenCalledWith({
      endTime: now.getTime(),
      limit: 2,
      logGroupName: `/aws/lambda/${fn}`,
      queryString: qs,
      startTime: now.getTime() - 600000
    })
    expect(getQueryResults).toHaveBeenCalledWith({ queryId })
  })

  it("appends query for LogMetrics", async () => {
    alarm.Trigger.Namespace = "LogMetrics"
    alarm.Trigger.MetricName = "webhooks-0-log-errors-uat"
    startQuery.mockReturnValue({ promise: () => ({ queryId }) })
    getQueryResults.mockReturnValue({ promise: () => qr })

    await expect(fetch(alarm)).resolves.toEqual(`${alarm.NewStateReason}\nYo\n`)

    expect(startQuery).toHaveBeenCalledWith({
      endTime: now.getTime(),
      limit: 2,
      logGroupName: `/aws/lambda/${fn}`,
      queryString: qs,
      startTime: now.getTime() - 600000
    })
    expect(getQueryResults).toHaveBeenCalledWith({ queryId })
  })
})
