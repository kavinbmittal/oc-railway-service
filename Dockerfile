FROM node:24.15.0-bookworm
ENV NODE_ENV=production

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    tini \
    python3 \
    python3-venv \
    wget \
    gnupg2 \
  && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -O /tmp/chrome.deb \
  && dpkg -i /tmp/chrome.deb || true \
  && apt-get install -y -f \
  && rm /tmp/chrome.deb \
  && rm -rf /var/lib/apt/lists/*

# `openclaw update` expects pnpm. Provide it in the runtime image.
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

# See DECISIONS.md — OpenClaw npm runtime entrypoint.
# Use the released package as the single runtime so newly published source-workspace
# dependencies cannot block a production image build on minimum-release-age policy.
ARG OPENCLAW_NPM_VERSION=2026.7.1
RUN npm install -g --prefix /opt/openclaw-npm openclaw@${OPENCLAW_NPM_VERSION} \
  && npm cache clean --force
ENV OPENCLAW_ENTRY=/opt/openclaw-npm/lib/node_modules/openclaw/dist/entry.js

# Persist user-installed tools by default by targeting the Railway volume.
# - npm global installs -> /data/npm
# - pnpm global installs -> /data/pnpm (binaries) + /data/pnpm-store (store)
ENV NPM_CONFIG_PREFIX=/data/npm
ENV NPM_CONFIG_CACHE=/data/npm-cache
ENV PNPM_HOME=/data/pnpm
ENV PNPM_STORE_DIR=/data/pnpm-store
ENV PATH="/opt/openclaw-npm/bin:/data/npm/bin:/data/pnpm:${PATH}"

WORKDIR /app

# Wrapper deps
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Provide an openclaw executable
RUN printf '%s\n' '#!/usr/bin/env bash' 'exec node "${OPENCLAW_ENTRY}" "$@"' > /usr/local/bin/openclaw \
  && chmod +x /usr/local/bin/openclaw

COPY src ./src
COPY dashboard/dist ./dashboard/dist

# Lia compaction provider plugin — Q&A-preserving compaction prompt
COPY plugins/lia-compaction/package.json /app/plugins/lia-compaction/package.json
COPY plugins/lia-compaction/openclaw.plugin.json /app/plugins/lia-compaction/openclaw.plugin.json
RUN cd /app/plugins/lia-compaction && npm install --omit=dev --ignore-scripts && npm cache clean --force
COPY plugins/lia-compaction/dist /app/plugins/lia-compaction/dist
# OpenClaw also looks for manifest at dist/openclaw.plugin.json
RUN cp /app/plugins/lia-compaction/openclaw.plugin.json /app/plugins/lia-compaction/dist/openclaw.plugin.json

# The wrapper listens on $PORT.
# IMPORTANT: Do not set a default PORT here.
# Railway injects PORT at runtime and routes traffic to that port.
# If we force a different port, deployments can come up but the domain will route elsewhere.
EXPOSE 8080

# Ensure PID 1 reaps zombies and forwards signals.
ENTRYPOINT ["tini", "--"]
CMD ["node", "src/server.js"]
