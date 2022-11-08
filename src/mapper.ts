const REGION = process.env.AWS_REGION || "us-west-2";
const BASE_URL = "https://console.aws.amazon.com";

export type State = "INSUFFICIENT_DATA" | "OK" | "ALARM";

export const color = (state?: State) =>
  state === "ALARM" ? "danger" : state === "OK" ? "good" : "default";

export const link = (namespace: string, name: string): string =>
  AWS_CONSOLE_URLS[namespace] || `${url("cloudwatch")}#s=Alarms&alarm=${name}`;

const url = (service: string) => `${BASE_URL}/${service}/home?region=${REGION}`;

// See https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/aws-services-cloudwatch-metrics.html
const AWS_CONSOLE_URLS: { [k: string]: string } = {
  "AWS/ApiGateway": url("apigateway"),
  "AWS/Billing": url("billing"),
  "AWS/CloudFront": url("cloudfront"),
  "AWS/DynamoDB": url("dynamodb"),
  "AWS/EC2": url("ec2"),
  "AWS/ECS": url("ecs"),
  "AWS/ElasticBeanstalk": url("elasticbeanstalk"),
  "AWS/Lambda": url("lambda"),
  "AWS/S3": url("s3"),
  "AWS/SQS": url("sqs"),
};
