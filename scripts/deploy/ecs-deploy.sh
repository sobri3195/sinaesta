#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ENV=${DEPLOY_ENV:-staging}
IMAGE_TAG=${IMAGE_TAG:-latest}

if [[ "$DEPLOY_ENV" == "staging" ]]; then
  SSH_HOST=${STAGING_SSH_HOST:-}
  SSH_USER=${STAGING_SSH_USER:-}
  SSH_KEY=${STAGING_SSH_KEY:-}
else
  SSH_HOST=${PROD_SSH_HOST:-}
  SSH_USER=${PROD_SSH_USER:-}
  SSH_KEY=${PROD_SSH_KEY:-}
fi

if [[ -z "$SSH_HOST" || -z "$SSH_USER" || -z "$SSH_KEY" ]]; then
  echo "Missing SSH deployment secrets. Skipping deploy for $DEPLOY_ENV."
  exit 0
fi

echo "$SSH_KEY" > /tmp/deploy_key
chmod 600 /tmp/deploy_key

ssh -o StrictHostKeyChecking=no -i /tmp/deploy_key "$SSH_USER@$SSH_HOST" <<EOF_REMOTE
set -euo pipefail
export IMAGE_TAG="$IMAGE_TAG"
export DEPLOY_ENV="$DEPLOY_ENV"

if [[ -f /opt/sinaesta/deploy.sh ]]; then
  bash /opt/sinaesta/deploy.sh
else
  echo "Remote deploy script not found at /opt/sinaesta/deploy.sh"
  exit 1
fi
EOF_REMOTE
