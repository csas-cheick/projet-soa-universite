# projet-soa-universite
Ce projet s'inscrit dans le cadre du module "Architecture SOA et Services Web" de la 3ème année de Licence en Génie Logiciel et Système d'Information. Il vise à mettre en pratique les concepts fondamentaux de l'Architecture Orientée Services (SOA) à travers la conception et le développement d'un système d'information universitaire distribué.

Services Implémentés
1. API Gateway (Le Routeur)
Technologie : Java 21, Spring Boot 3, Spring Cloud Gateway.
Port : 8081 (Port exposé au client).
Rôle : Point d'entrée unique. Redirige les requêtes vers les services Java ou .NET en fonction de l'URL.

2. Service Cours (Gestion Pédagogique)
Technologie : Java 21, JAX-WS (SOAP), Maven.
Type : Service SOAP.
Base de Données : MongoDB Atlas (Collection cours).
Fonctionnalités : Ajouter un cours, lister les cours, gérer les salles/horaires.

3. Service Facturation (Gestion Financière)
Technologie : .NET 8.0, C#, CoreWCF.
Type : Service SOAP.
Base de Données : MongoDB Atlas (Collection factures).
Fonctionnalités : Créer une facture, calculer les frais (selon spécialité/niveau), vérifier le statut de paiement.
