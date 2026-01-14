# API Env Diagnostic - 2026-01-14

## Filtered sensitive-looking env vars (API/KEY/URL/MODEL related)
```
No matches found in env
```

## Full export -p (for complete context)
```
declare -x BUN_INSTALL="/home/engine/.bun"
declare -x DEBIAN_FRONTEND="noninteractive"
declare -x HOME="/home/engine"
declare -x HOSTNAME="engine-aa96ec9d-223f-449a-9426-f39cc6180697-68f746644f-m4s7q"
declare -x KUBERNETES_PORT="tcp://10.20.0.1:443"
declare -x KUBERNETES_PORT_443_TCP="tcp://10.20.0.1:443"
declare -x KUBERNETES_PORT_443_TCP_ADDR="10.20.0.1"
declare -x KUBERNETES_PORT_443_TCP_PORT="443"
declare -x KUBERNETES_PORT_443_TCP_PROTO="tcp"
declare -x KUBERNETES_SERVICE_HOST="10.20.0.1"
declare -x KUBERNETES_SERVICE_PORT="443"
declare -x KUBERNETES_SERVICE_PORT_HTTPS="443"
declare -x LC_CTYPE="C.UTF-8"
declare -x LD_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu:/usr/local/lib:"
declare -x NF_CPU_RESOURCES="2"
declare -x NF_DISCOVERY_SERVICE="engine-aa96ec9d-223f-449a-9426-f39cc6180697-headless"
declare -x NF_EPHEMERAL_STORAGE="10240"
declare -x NF_EXTERNAL_DOCKER_IMAGE="engine/container:new-agreement-223"
declare -x NF_EXTERNAL_DOCKER_PRIVATE="true"
declare -x NF_EXTERNAL_DOCKER_PROVIDER="custom"
declare -x NF_HOSTS="p01--engine-aa96ec9d-223f-449a-9426-f39cc6180697--4h4cpv6b2xy4.code.run,aa96ec9d-223f-449a-9426-f39cc6180697.enginelabs.link"
declare -x NF_HOSTS_CUSTOM="aa96ec9d-223f-449a-9426-f39cc6180697.enginelabs.link"
declare -x NF_NAMESPACE="ns-4h4cpv6b2xy4"
declare -x NF_OBJECT_ID="engine-aa96ec9d-223f-449a-9426-f39cc6180697"
declare -x NF_OBJECT_TYPE="service"
declare -x NF_PLAN_ID="nf-compute-200-4"
declare -x NF_POD_ID="2efc9cdc-f3b1-471b-8754-ae4dc92c1e43"
declare -x NF_POD_IP="10.16.58.188"
declare -x NF_POD_NAME="engine-aa96ec9d-223f-449a-9426-f39cc6180697-68f746644f-m4s7q"
declare -x NF_PROJECT_ID="iotserver24"
declare -x NF_RAM_RESOURCES="4096"
declare -x NF_REGION="us-central"
declare -x NF_RESOURCE_ID="engine-aa96ec9d-223f-449a-9426-f39cc6180697"
declare -x NVM_BIN="/home/engine/.nvm/versions/node/v20.19.6/bin"
declare -x NVM_CD_FLAGS=""
declare -x NVM_DIR="/home/engine/.nvm"
declare -x NVM_INC="/home/engine/.nvm/versions/node/v20.19.6/include/node"
declare -x OLDPWD="/home/engine/project"
declare -x OMP_NUM_THREADS="1"
declare -x PATH="/usr/local/share/bun/bin:/usr/local/share/bun/bin:/home/engine/.local/bin:/home/engine/.local/bin/:/home/engine/.nvm/versions/node/v20.19.6/bin:/home/engine/.npm-global/bin:/usr/local/share/bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
declare -x PKG_CONFIG_PATH="/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/local/lib/pkgconfig:"
declare -x PWD="/home/engine/project"
declare -x PYTHON="/usr/bin/python3"
declare -x SHELL="/bin/bash"
declare -x SHLVL="2"
declare -x SUPERVISOR_ENABLED="1"
declare -x SUPERVISOR_GROUP_NAME="terminal"
declare -x SUPERVISOR_PROCESS_NAME="terminal"
declare -x SUPERVISOR_SERVER_URL="unix:///home/engine/app/supervisor/supervisor.sock"
declare -x TERM="xterm-256color"
declare -x npm_config_python="/usr/bin/python3"
```

## Quick check of common config file locations (only if they exist)
```
>>> /home/engine/.bashrc exists
(no matching lines)

>>> /home/engine/.zshrc exists
(no matching lines)

>>> /home/engine/.profile exists
(no matching lines)

>>> /etc/environment exists
(no matching lines)
```

## Summary

- **Date & PWD**: $(date)   $(pwd)
- **API Keys**: No Anthropic/Claude/OpenAI API keys found in environment
- **Configuration Files**: No API-related configuration in checked config files
- **Environment**: Clean container environment with only standard system variables (Kubernetes, PATH, HOME, etc.)
- **Detection Status**: No auto-detected API configuration available
