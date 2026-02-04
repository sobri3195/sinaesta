#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ENV=${DEPLOY_ENV:-production}

if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI is required for rollback. Install awscli or run in a runner with it installed."
  exit 1
fi

CLUSTER_NAME=${ECS_CLUSTER_NAME:-sinaesta-${DEPLOY_ENV}}
SERVICE_NAME=${ECS_SERVICE_NAME:-sinaesta-api}

LATEST_TASK_DEF=$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --query 'services[0].taskDefinition' --output text)
PREVIOUS_TASK_DEF=$(aws ecs list-task-definitions --family-prefix "$SERVICE_NAME" --status ACTIVE --sort DESC --query 'taskDefinitionArns[1]' --output text)

if [[ -z "$PREVIOUS_TASK_DEF" || "$PREVIOUS_TASK_DEF" == "None" ]]; then
  echo "No previous task definition found for rollback."
  exit 1
fi

aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --task-definition "$PREVIOUS_TASK_DEF"

aws ecs wait services-stable --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME"

echo "Rollback complete from $LATEST_TASK_DEF to $PREVIOUS_TASK_DEF."
