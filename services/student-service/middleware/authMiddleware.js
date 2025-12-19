const jwt = require('jsonwebtoken');

// 1. On met la MÊME chaîne que dans Java (avec la fin ...MAISENBASE64)
const JWT_SECRET_STR = "MaSuperCleSecretePourLeProjetSOAUniversiteQuiDoitEtreTresLongue2024MAISENBASE64";

// 2. IMPORTANT : On la transforme en Buffer (binaire), exactement comme fait Java avec Base64.decode()
const JWT_SECRET = Buffer.from(JWT_SECRET_STR, 'base64');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: "Accès refusé : Token manquant" });
    }

    const token = authHeader.split(' ')[1];

    // 3. On vérifie avec le Buffer
    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
            console.error("Erreur vérification JWT Node:", err.message);
            return res.status(401).json({ message: "Accès refusé : Token invalide" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;