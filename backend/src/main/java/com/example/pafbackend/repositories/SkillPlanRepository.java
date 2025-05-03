package com.example.pafbackend.repositories;

import com.example.pafbackend.models.SkillPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillPlanRepository extends MongoRepository<SkillPlan, String> {
    List<SkillPlan> findByUserId(String userId);
}
