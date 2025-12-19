import base64
import os

class Config:
    # 1. Configuration MongoDB
    # Correction : on cherche la variable "MONGO_URI", sinon on prend le lien par défaut
    MONGO_URI = "mongodb+srv://dbUser:root@university.un0krqn.mongodb.net/grade_univ_db?appName=university"
    
    DB_NAME = "grade_univ_db"
    COLLECTION_NAME = "grades"
    
    # 2. La clé secrète brute
    SECRET_KEY_STR = "MaSuperCleSecretePourLeProjetSOAUniversiteQuiDoitEtreTresLongue2024MAISENBASE64"
    
    # 3. LE CORRECTIF ANTI-CRASH (Padding)
    # On ajoute les '=' manquants si la longueur n'est pas multiple de 4
    missing_padding = len(SECRET_KEY_STR) % 4
    if missing_padding:
        SECRET_KEY_STR += '=' * (4 - missing_padding)
    
    # 4. Décodage sécurisé
    try:
        SECRET_KEY = base64.b64decode(SECRET_KEY_STR)
    except Exception as e:
        print(f"⚠️ Erreur décodage Base64 : {e}")
        # Clé de secours pour ne pas faire crasher le conteneur
        SECRET_KEY = b"fallback_secret_key_pour_eviter_crash"

    ALGORITHM = "HS256"