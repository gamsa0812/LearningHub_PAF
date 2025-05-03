package com.example.pafbackend.repositories;

import com.example.pafbackend.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {

}
