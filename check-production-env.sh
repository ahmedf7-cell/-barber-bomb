#!/bin/sh
set -eu
: "${JWT_SECRET:?JWT_SECRET is missing}"
: "${ADMIN_PASSWORD_HASH:?ADMIN_PASSWORD_HASH is missing}"
: "${ADMIN_USER:?ADMIN_USER is missing}"
: "${DB_PATH:?DB_PATH is missing}"
if [ "${JWT_SECRET}" = "CHANGE_THIS_IN_PRODUCTION" ] || [ "${JWT_SECRET}" = "REPLACE_WITH_LONG_RANDOM_SECRET" ]; then
  echo "JWT_SECRET is still the placeholder"; exit 1
fi
if [ "${ADMIN_PASSWORD_HASH}" = "REPLACE_WITH_BCRYPT_HASH" ]; then
  echo "ADMIN_PASSWORD_HASH is still the placeholder"; exit 1
fi
echo "Production secrets and DB path are present."
