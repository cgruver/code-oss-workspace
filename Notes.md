```bash
wget https://raw.githubusercontent.com/cgruver/code-oss-workspace/refs/heads/main/che-code-editor-nexus.yaml
oc create configmap che-code-copilot --from-file=che-code-editor-nexus.yaml -n devspaces
oc label configmap che-code-copilot app.kubernetes.io/part-of=che.eclipse.org app.kubernetes.io/component=editor-definition -n devspaces
```

```bash
git remote add upstream-code https://github.com/microsoft/vscode
git fetch upstream-code release/1.108
git subtree pull --prefix code upstream-code release/1.108
```

```bash
podman build -f build/dockerfiles/clg-rebase-linux-libc-ubi9.Containerfile -t linux-libc-ubi9 .
export DOCKER_BUILDKIT=1
podman build -f build/dockerfiles/clg-rebase-assembly.Containerfile -t nexus.clg.lab:5002/dev-spaces/che-code:latest .
podman push nexus.clg.lab:5002/dev-spaces/che-code:latest
```

```bash
cat << EOF | oc apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: vscode-editor-configurations
  namespace: devspaces
  labels:
    app.kubernetes.io/part-of: che.eclipse.org
    app.kubernetes.io/component: workspaces-config
data:
  settings.json: |
    {
      "chat.disableAIFeatures": false,
      "chat.commandCenter.enabled": true
    }
EOF
```

## Build github-chat
```bash
git clone https://github.com/microsoft/vscode-copilot-chat

git checkout release/0.36

mv package.json tmpfile.json
jq 'del(.extensionPack)' tmpfile.json > package.json
rm tmpfile.json

npm install

npm run build

vsce package

npx @vscode/dts dev && mv vscode.proposed.*.ts src/extension
```

```bash
mv package.json tmpfile.json
jq 'del(.extensionPack)' tmpfile.json > package.json
rm tmpfile.json
```

## Get proposed API list
```bash
for i in $(ls /projects/vscode-copilot-chat/src/extension/vscode.proposed.*)
do
  API=$(echo ${i} | cut -d"." -f3)
  echo "\"${API}\","
done
```

## Create PAT
```
git clone https://github.com/cgruver/vscode-copilot-chat.git

cd vscode-copilot-chat
 
npm install

npm run get_token
```

```bash
curl -s -H "Authorization: Bearer ${GITHUB_OAUTH_TOKEN}" https://api.github.com/copilot_internal/user
```

## NOTES

```bash
export ELECTRON_SKIP_BINARY_DOWNLOAD=1
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
cp -r code checode-compilation
cd checode-compilation
rm -rf node_modules
git init .
npm config set fetch-retry-mintimeout 100000 && npm config set fetch-retry-maxtimeout 600000
npm install --force
NODE_ARCH=$(echo "console.log(process.arch)" | node)
NODE_VERSION=$(cat remote/.npmrc | grep target | cut -d '=' -f 2 | tr -d '"')
mkdir -p .build/node/v${NODE_VERSION}/linux-${NODE_ARCH}
cp /usr/local/node/bin/node .build/node/v${NODE_VERSION}/linux-${NODE_ARCH}/node
NODE_OPTIONS="--max-old-space-size=8192 --experimental-transform-types" ./node_modules/.bin/gulp vscode-reh-web-linux-${NODE_ARCH}-min
cp -r ../vscode-reh-web-linux-${NODE_ARCH} /projects/checode
mkdir -p /projects/checode/ld_libs
find /usr/lib64 -name 'libbrotli*' 2>/dev/null | xargs -I {} cp -t /projects/checode/ld_libs {}
find /usr/lib64 -name 'libnode.so*' -exec cp -P -t /projects/checode/ld_libs/ {} +
find /usr/lib64 -name 'libz.so*' -exec cp -P -t /projects/checode/ld_libs/
chmod a+x /projects/checode/out/server-main.js
chgrp -R 0 /projects/checode && chmod -R g+rwX /projects/checode
```