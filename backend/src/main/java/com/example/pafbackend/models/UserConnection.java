package com.example.pafbackend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "userConnections")
public class UserConnection {
    @Id
    private String id;
    private String userId;
    private List<String> friendIds;

    public UserConnection() {
    }

    public UserConnection(String userId, List<String> friendIds) {
        this.userId = userId;
        this.friendIds = friendIds;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getFriendIds() {
        return friendIds;
    }

    public void setFriendIds(List<String> friendIds) {
        this.friendIds = friendIds;
    }
}