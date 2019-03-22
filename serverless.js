const { serverless } = require("skripts/config")

module.exports = {
  ...serverless,
  custom: {
    ...serverless.custom,
    tags: {
      ...serverless.custom.tags,
      Team: "growth",
      DeployJobUrl: "${env:BUILD_URL, 'n/a'}",
      "org.label-schema.vcs-url": "${env:GIT_URL, 'n/a'}",
      "org.label-schema.vcs-ref": "${env:GIT_COMMIT, 'n/a'}"
    }
  },
  provider: {
    ...serverless.provider,
    environment: {
      ...serverless.provider.environment,
      SLACK_WEBHOOK_URL: "${ env: SLACK_WEBHOOK_URL }"
    }
  },
  functions: {
    func: {
      handler: "src/handler.handle",
      events: [{ sns: "${self:service.name}-topic-${self:provider.stage}" }]
    }
  }
}
