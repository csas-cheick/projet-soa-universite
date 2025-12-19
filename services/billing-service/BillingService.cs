using System;
using System.Collections.Generic; // Pour List<>
using MongoDB.Driver;
using CoreWCF;

namespace BillingService
{
    public class BillingService : IBillingService
    {
        private readonly IMongoCollection<Facture> _facturesCollection;

        public BillingService()
        {
            // Récupération de la chaîne de connexion depuis les variables d'environnement
            string connectionString = Environment.GetEnvironmentVariable("MONGO_URI");
            if (string.IsNullOrEmpty(connectionString))
            {
                // Valeur par défaut
                connectionString = "mongodb+srv://dbUser:root@university.un0krqn.mongodb.net/?appName=university";
                Console.WriteLine("MONGO_URI non défini, utilisation de localhost.");
            }
            
            var client = new MongoClient(connectionString);
            var database = client.GetDatabase("univ_db_billing");
            _facturesCollection = database.GetCollection<Facture>("factures");
            
            Console.WriteLine("Service Facturation (.NET) connecté à MongoDB !");
        }

        public double CalculerFrais(string specialite, int niveau)
        {
            double frais = 500.0;

            if (specialite.ToLower().Contains("informatique") || specialite.ToLower().Contains("génie"))
            {
                frais += 1000.0;
            }

            if (niveau >= 4)
            {
                frais += 500.0;
            }

            Console.WriteLine($"[SOAP] Calcul frais pour {specialite} Niv.{niveau} : {frais} TND");
            return frais;
        }

        public string CreerFacture(string etudiantId, double montant)
        {
            var nouvelleFacture = new Facture
            {
                EtudiantId = etudiantId,
                Montant = montant,
                Statut = "EN_ATTENTE", 
                DateCreation = DateTime.Now
            };

            _facturesCollection.InsertOne(nouvelleFacture);

            Console.WriteLine($"[SOAP] Facture créée : {nouvelleFacture.Id} pour {etudiantId}");
            return nouvelleFacture.Id;
        }

        public string PayerFacture(string factureId)
        {
            var filter = Builders<Facture>.Filter.Eq(x => x.Id, factureId);
            var update = Builders<Facture>.Update.Set(x => x.Statut, "PAYEE");

            var result = _facturesCollection.UpdateOne(filter, update);

            if (result.ModifiedCount > 0)
            {
                Console.WriteLine($"[SOAP] Facture {factureId} payée avec succès.");
                return "PAIEMENT_SUCCES";
            }
            return "ERREUR_FACTURE_INCONNUE";
        }

        public string GetStatutEtudiant(string etudiantId)
        {
            var filter = Builders<Facture>.Filter.And(
                Builders<Facture>.Filter.Eq(x => x.EtudiantId, etudiantId),
                Builders<Facture>.Filter.Eq(x => x.Statut, "EN_ATTENTE")
            );

            long impayes = _facturesCollection.CountDocuments(filter);

            if (impayes > 0)
            {
                return $"EN_RETARD ({impayes} factures impayées)";
            }
            return "EN_REGLE";
        }
    }
}