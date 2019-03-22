import {
  ComparisonOperator,
  StandardUnit,
  Statistic
} from "aws-sdk/clients/cloudwatch"

export type State = "INSUFFICIENT_DATA" | "OK" | "ALARM"

type NameValue = Readonly<{
  Name: string
  Value: string
}>

type Trigger = Readonly<{
  MetricName: string
  Namespace: string
  StatisticType: string
  Statistic: Statistic
  Unit: StandardUnit
  Dimensions: NameValue[]
  Period: number
  EvaluationPeriods: number
  ComparisonOperator: ComparisonOperator
  Threshold: number
  TreatMissingData: string
  EvaluateLowSampleCountPercentile: string
}>

export type Alarm = Readonly<{
  AlarmName: string
  AlarmDescription?: string
  AWSAccountId: string
  NewStateValue: State
  NewStateReason: string
  StateChangeTime: string
  Region: string
  OldStateValue: State
  Trigger: Trigger
}>

export type SlackMsg = Readonly<{
  attachments: Array<{
    fallback: string
    color: string
    title: string
    title_link: string
    text: string
    footer: string
    ts: number
  }>
}>

export type Res = Readonly<{
  statusCode: number
  body: string
}>
