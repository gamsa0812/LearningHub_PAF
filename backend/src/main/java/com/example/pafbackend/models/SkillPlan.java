package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "skillPlans")
@Getter
@Setter
public class SkillPlan {
    @Id
    private String id;

    private String userId; // Owner of the skill plan
    private String skillDetails;
    private String skillLevel;
    private String resources;
    private String date;
    private boolean isFinished;
}
