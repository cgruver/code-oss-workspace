# Rebase of che-code to enable GitHub Copilot in OpenShift Dev Spaces

## Install the custom editor -

1. Download the editor YAML -

   ```bash
   wget https://raw.githubusercontent.com/cgruver/code-oss-workspace/refs/heads/main/che-code-editor-quay.yaml
   ```

1. Create a configmap for the editor in the namespace where you installed the CheCluster CR -

   __Note:__ Replace `devspaces` with the namespace where the CheCluster is installed

   ```bash
   INSTALL_NAMESPACE=devspaces
   oc create configmap che-code-copilot --from-file=che-code-editor-quay.yaml -n ${INSTALL_NAMESPACE}
   ```

1. Label the ConfigMap so that Dev Spaces is aware of it as an editor -

   ```bash
   oc label configmap che-code-copilot app.kubernetes.io/part-of=che.eclipse.org app.kubernetes.io/component=editor-definition -n ${INSTALL_NAMESPACE}
   ```


## Build the GitHub.copilot-chat extension and publish it to your OpenVSX registry instance -

In my testing, I am self-hosting an OpenVSX instance following the pattern documented here - [https://github.com/cgruver/che-openvsx-registry](https://github.com/cgruver/che-openvsx-registry)

1. Release 0.35.X is supported by VS Code v1.107 which this rebase is built from

   ```bash
   export CHAT_REVISION="release/0.35"

1. Grab the code for the extension

   ```bash
   TEMP_DIR="$(mktemp -d)"
   git clone -b ${CHAT_REVISION} --single-branch https://github.com/microsoft/vscode-copilot-chat ${TEMP_DIR}
   pushd ${TEMP_DIR}
   ```

1. Remove the extensionPack reference from package.json to eliminate a deprecation warning and prevent the extension from attempting to install github.copilot

   ```bash
   mv package.json tmpfile.json
   jq 'del(.extensionPack)' tmpfile.json > package.json
   rm tmpfile.json
   ```

1. Build the extension

   ```bash
   npm install
   npx tsx .esbuild.ts
   vsce package
   ```

1. Publish the extension - Note, this process may be different if you are hosting OpenVSX in another way.

   ```bash
   export OVSX_REGISTRY_URL=https://$(oc get route open-vsx-server -n che-openvsx -o jsonpath={.spec.host})
   export OVSX_PAT=eclipse_che_token
   export NODE_TLS_REJECT_UNAUTHORIZED='0'
   ovsx create-namespace GitHub
   ovsx publish --skip-duplicate copilot-chat-*.vsix
   popd
   rm -rf ${TEMP_DIR}
   ```

## Create a GitHub PAT

```bash
TEMP_DIR="$(mktemp -d)"
git clone https://github.com/microsoft/vscode-copilot-chat ${TEMP_DIR}
pushd ${TEMP_DIR}
npm install
npm run get_token
```

Follow the instructions to generate the token
Copy the token from the generated .env file and add it to your Dev Spaces user profile as a GitHub token

Clean up

```bash
pushd
rm -rf ${TEMP_DIR}
```
