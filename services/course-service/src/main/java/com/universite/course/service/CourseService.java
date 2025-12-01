package com.universite.course.service;

import com.universite.course.model.Cours;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;
import java.util.List;

@WebService // Indique que c'est un service Web SOAP
public interface CourseService {

    @WebMethod
    List<Cours> getAllCourses();

    @WebMethod
    Cours getCourseById(@WebParam(name = "id") Long id);

    @WebMethod
    Cours addCourse(@WebParam(name = "cours") Cours cours);

    @WebMethod
    boolean deleteCourse(@WebParam(name = "id") Long id);
}