# cloudwatch-alarm-to-slack

Slack bot that maps AWS CloudWatch Alarms into Slack messages.

![Screenshot of Slack message](./screenshot.png)

## Setup

- Clone the repository and run `npm install`
- Ensure your [AWS credentials are available](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
- Configure a Slack [Incoming Webhook](https://slack.com/apps/manage/custom-integrations)
- Deploy with `ENVIRONMENT=your-env DEPLOYMENT_BUCKET=your-bucket npm run deploy`
- Optionally set `SLACK_WEBHOOK_URL_NMI` to deliver each alarm to a second
  workspace as well. This exists for the NMI Slack migration: run both for long
  enough to confirm the new workspace is receiving, then promote it to
  `SLACK_WEBHOOK_URL` and drop the old one. If one workspace fails the other is
  still delivered, and the failure is logged.
- Once deployed, configure CloudWatch Alarm Actions to send notifications to the topic this stack creates

## Developing

- Run tests, `npm test`
- Invoke locally, `npm run invoke`
