package com.example.pafbackend.repositories;

import com.example.pafbackend.models.Learning;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningRepository extends MongoRepository<Learning, String> {
    List<Learning> findByUserId(String userId);
}