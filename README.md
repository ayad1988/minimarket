# minimarket



* Objectif du projet : 





un e-commerce avec:



catalogue produits + stock



panier + commande + paiement (mock)



comptes utilisateurs



livraison (mock)



notifications



assistant IA (chatbot) + RAG (FAQ + docs produits + politique retour)



observabilité + sécurité + CI/CD





* Stack :





A) Backend



Java 21 + Spring Boot 3



Testcontainers (tests intégration DB/Kafka) ✅ énorme plus



MapStruct (mapping DTO) ✅



OpenAPI Generator (clients auto)



B) Data / Event



Debezium (CDC) (bonus avancé)



Kafka Streams (agrégations, projections)



C) DevOps



Terraform (infra as code) ✅ très demandé



Argo CD (GitOps) ✅



Vault (secrets) ✅



D) IA



Reranking (améliorer la qualité du RAG)



Evaluation RAG (tests qualité réponses)



Prompt versioning (simple mais pro)





* Comment lancer (à compléter après) : 


Backend

cd services/catalog-service

mvn spring-boot:run

Frontend

cd frontend/minimarket-front

npm start