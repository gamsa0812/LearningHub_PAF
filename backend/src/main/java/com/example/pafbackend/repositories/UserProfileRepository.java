package com.example.pafbackend.repositories;



import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.example.pafbackend.models.UserProfile;

import java.util.List;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    List<UserProfile> findByUserId(String userId);
}
