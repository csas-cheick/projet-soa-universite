using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BillingService
{
    public class Facture
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string EtudiantId { get; set; } = string.Empty;
        public double Montant { get; set; }
        public string Statut { get; set; } = "EN_ATTENTE";
        public DateTime DateCreation { get; set; } = DateTime.Now;
    }
}