using CoreWCF;
using System.Collections.Generic;

namespace BillingService
{
    [ServiceContract]
    public interface IBillingService
    {
        // 1. Calculer le montant (Logique métier)
        [OperationContract]
        double CalculerFrais(string specialite, int niveau);

        // 2. Créer la facture (Sauvegarde)
        [OperationContract]
        string CreerFacture(string etudiantId, double montant);

        // 3. Payer une facture (Mise à jour)
        [OperationContract]
        string PayerFacture(string factureId);

        // 4. Voir si l'étudiant est en règle (Global)
        [OperationContract]
        string GetStatutEtudiant(string etudiantId);
    }
}