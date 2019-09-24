const { serverless } = require("skripts/config")

const fallbackRole = {
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: ["logs:GetQueryResults"],
      Resource: "*"
    },
    {
      Effect: "Allow",
      Action: ["logs:StartQuery"],
      Resource:
        "arn:aws:logs:${self:provider.region}:#{AWS::AccountId}:log-group:/aws/lambda/webhooks-*-lambda-${self:provider.stage}:*"
    }
  ]
}

role = process.env.ROLE_ARN ? { role: "${ env: ROLE_ARN }" } : fallbackRole

stackName = process.env.STACK_NAME
  ? { stackName: "${ env: STACK_NAME }-${ env: ENVIRONMENT }" }
  : null

module.exports = {
  ...serverless,
  custom: {
    ...serverless.custom,
    tags: {
      ...serverless.custom.tags,
      Team: "${env:TEAM_NAME, 'n/a'}",
      Project: "${env:PROJECT_NAME, 'n/a'}",
      DeployJobUrl: "${env:BUILD_URL, 'n/a'}",
      "org.label-schema.vcs-url": "${env:GIT_URL, 'n/a'}",
      "org.label-schema.vcs-ref": "${env:GIT_COMMIT, 'n/a'}"
    }
  },
  plugins: [...serverless.plugins, "serverless-pseudo-parameters"],
  provider: {
    ...serverless.provider,
    ...stackName,
    environment: {
      ...serverless.provider.environment,
      SLACK_WEBHOOK_URL: "${ env: SLACK_WEBHOOK_URL }"
    },
    ...role
  },
  functions: {
    func: {
      handler: "src/handler.handle",
      events: [{ sns: "${self:service.name}-topic-${self:provider.stage}" }]
    }
  }
}
