package com.universite.course.service;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.universite.course.model.Cours;
import jakarta.jws.WebService;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

@WebService(endpointInterface = "com.universite.course.service.CourseService")
public class CourseServiceImpl implements CourseService {

    private final MongoCollection<Document> collection;

    public CourseServiceImpl() {

        // Récupération de la chaîne de connexion depuis les variables d'environnement
        String connectionString = System.getenv("MONGO_URI");
        if (connectionString == null || connectionString.isEmpty()) {
            // Valeur par défaut
            connectionString = "mongodb+srv://dbUser:root@university.un0krqn.mongodb.net/?appName=university";
            System.out.println("MONGO_URI non défini, utilisation de localhost.");
        }

        try {
            MongoClient client = MongoClients.create(connectionString);
            // La base de données sera créée automatiquement si elle n'existe pas
            MongoDatabase db = client.getDatabase("univ_db_course");
            this.collection = db.getCollection("cours");

            System.out.println("Service Cours connecté à MongoDB !");
        } catch (Exception e) {
            System.err.println("Erreur critique : Impossible de se connecter à MongoDB.");
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Cours> getAllCourses() {
        List<Cours> list = new ArrayList<>();
        for (Document doc : collection.find()) {
            list.add(mapToCours(doc));
        }
        return list;
    }

    @Override
    public boolean updateCourse(Long id, Cours cours) {
        Document updatedValues = new Document()
                .append("nom", cours.getNom())
                .append("description", cours.getDescription())
                .append("salle", cours.getSalle())
                .append("horaire", cours.getHoraire());

        var result = collection.updateOne(
                Filters.eq("_id", id), 
                new Document("$set", updatedValues)
        );
        
        System.out.println("Mise à jour cours " + id + " : " + (result.getModifiedCount() > 0));
        return result.getModifiedCount() > 0; // Renvoie vrai si modifié
    }

    @Override
    public Cours getCourseById(Long id) {
        Document doc = collection.find(Filters.eq("_id", id)).first();
        if (doc != null) {
            return mapToCours(doc);
        }
        return null;
    }

    @Override
    public Cours addCourse(Cours cours) {

        if (cours.getId() == null) {
            cours.setId(System.currentTimeMillis());
        }
        Document doc = new Document("_id", cours.getId())
                .append("nom", cours.getNom())
                .append("description", cours.getDescription())
                .append("salle", cours.getSalle())
                .append("horaire", cours.getHoraire());
        collection.insertOne(doc);
        System.out.println("Cours ajouté : " + cours.getNom() + " (ID: " + cours.getId() + ")");
        return cours;
    }

    @Override
    public boolean deleteCourse(Long id) {
        var result = collection.deleteOne(Filters.eq("_id", id));
        return result.getDeletedCount() > 0;
    }

    private Cours mapToCours(Document doc) {
        return new Cours(
                doc.getLong("_id"),
                doc.getString("nom"),
                doc.getString("description"),
                doc.getString("salle"),
                doc.getString("horaire")
        );
    }
}