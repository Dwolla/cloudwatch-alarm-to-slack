import { color, link, State } from "../src/mapper"

describe("color", () => {
  it("returns danger", () => expect(color("ALARM")).toBe("danger"))

  it("returns good", () => expect(color("OK")).toBe("good"))

  it("returns default", () =>
    expect(color("INSUFFICIENT_DATA")).toBe("default"))

  it("returns default for unknown", () =>
    expect(color("UNKNOWN" as State)).toBe("default"))
})

describe("link", () => {
  const NAME = "name"
  const BASE_URL = "https://console.aws.amazon.com"
  const REGION = "us-west-2"

  const url = (service: string) =>
    `${BASE_URL}/${service}/home?region=${REGION}`

  it("returns ApiGateway", () =>
    expect(link("AWS/ApiGateway", NAME)).toBe(url("apigateway")))

  it("returns Billing", () =>
    expect(link("AWS/Billing", NAME)).toBe(url("billing")))

  it("returns CloudFront", () =>
    expect(link("AWS/CloudFront", NAME)).toBe(url("cloudfront")))

  it("returns Lambda", () =>
    expect(link("AWS/Lambda", NAME)).toBe(url("lambda")))

  it("returns DynamoDB", () =>
    expect(link("AWS/DynamoDB", NAME)).toBe(url("dynamodb")))

  it("returns EC2", () => expect(link("AWS/EC2", NAME)).toBe(url("ec2")))

  it("returns ElasticBeanstalk", () =>
    expect(link("AWS/ElasticBeanstalk", NAME)).toBe(url("elasticbeanstalk")))

  it("returns ECS", () => expect(link("AWS/ECS", NAME)).toBe(url("ecs")))

  it("returns SQS", () => expect(link("AWS/SQS", NAME)).toBe(url("sqs")))

  it("returns S3", () => expect(link("AWS/S3", NAME)).toBe(url("s3")))

  it("returns cloudwatch for unknown", () =>
    expect(link("other", NAME)).toBe(
      `${BASE_URL}/cloudwatch/home?region=${REGION}#s=Alarms&alarm=${NAME}`
    ))
})
