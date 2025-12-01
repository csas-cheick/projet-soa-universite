package com.universite.course.model;

import jakarta.xml.bind.annotation.XmlRootElement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Génère les Getters/Setters automatiquement
@AllArgsConstructor // Génère le constructeur avec tous les arguments
@NoArgsConstructor // Génère le constructeur vide (obligatoire pour JAX-WS/SOAP)
@XmlRootElement // Indispensable pour que le service SOAP transforme l'objet en XML
public class Cours {

    private Long id;
    private String nom;
    private String description;
    private String salle;
    private String horaire;
}