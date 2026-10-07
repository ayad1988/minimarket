# Déploiement Kubernetes (local)

Prérequis : un cluster local (Docker Desktop Kubernetes, minikube ou kind).

```bash
# 1. Construire les images (depuis la racine du dépôt)
for s in catalog-service order-service notification-service; do
  docker build -t minimarket/$s:latest services/$s
done
# minikube : minikube image load minimarket/<service>:latest   |   kind : kind load docker-image ...

# 2. Déployer
kubectl apply -k infra/k8s

# 3. Vérifier
kubectl -n minimarket get pods
```

Pas de gateway : chaque service est un `ClusterIP`. Pour y accéder depuis ta machine (et le proxy Angular) :

```bash
kubectl -n minimarket port-forward svc/catalog-service 8081:8081
kubectl -n minimarket port-forward svc/order-service 8082:8082
```

Test de bout en bout :

```bash
curl -X POST http://localhost:8082/orders -H "Content-Type: application/json" \
  -d '{"customerEmail":"a@b.com","items":[{"productId":1,"quantity":2,"unitPrice":9.99}]}'
kubectl -n minimarket logs deploy/notification-service | grep -E "MOCK EMAIL|DLT"
```
