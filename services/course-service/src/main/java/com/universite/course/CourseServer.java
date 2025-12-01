package com.universite.course;

import com.universite.course.service.CourseServiceImpl;
import jakarta.xml.ws.Endpoint;

public class CourseServer {
    public static void main(String[] args) {
        // L'adresse 0.0.0.0 est CRUCIALE pour que Docker fonctionne plus tard.
        // En local sur votre PC, cela correspond à localhost.
        String url = "http://0.0.0.0:8082/ws/cours";

        System.out.println("--------------------------------------------------");
        System.out.println("Démarrage du Service COURS (SOAP JAX-WS)");
        System.out.println("WSDL disponible à : " + url + "?wsdl");
        System.out.println("--------------------------------------------------");

        // Publication du service
        try {
            Endpoint.publish(url, new CourseServiceImpl());
            System.out.println("Service démarré avec succès !");
        } catch (Exception e) {
            System.err.println("Erreur au démarrage : " + e.getMessage());
            e.printStackTrace();
        }
    }
}