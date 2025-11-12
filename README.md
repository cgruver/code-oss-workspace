# code-oss-workspace

```bash
wget https://raw.githubusercontent.com/eclipse-che/che-operator/refs/heads/main/editors-definitions/che-code-insiders.yaml
oc login <cluster uri>
oc project <namespace where you deployed the CheCluster>
oc create configmap che-code-insiders --from-file=che-code-insiders.yaml
oc label configmap che-code-insiders app.kubernetes.io/part-of=che.eclipse.org app.kubernetes.io/component=editor-definition
```