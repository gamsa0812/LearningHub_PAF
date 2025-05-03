package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "learning")
public class Learning {
    @Id
    private String id;
    private String userId;
    private String topic;
    private String description;
    private String resourceLink;
    private String status;
    private LocalDateTime timestamp;
    private String nextSteps;
    private String reflection;
    private String template;

    // Template-specific fields
    private String projectName;         // For "Completed Project/Task"
    private String projectLink;         // For "Completed Project/Task"

    private String certificationName;   // For "Certification/Qualification"
    private String provider;            // For "Certification/Qualification" and "Workshops/Bootcamps"
    private String dateObtained;        // For "Certification/Qualification"

    private String challengeName;       // For "Challenges/Competitions"
    private String result;              // For "Challenges/Competitions"

    private String workshopName;        // For "Workshops/Bootcamps"
    private String duration;            // For "Workshops/Bootcamps"
}