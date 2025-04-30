package com.example.pafbackend.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.List;
import org.springframework.data.mongodb.core.index.Indexed;
@Document(collection = "users")
@Data
@Setter
@Getter
public class User implements UserDetails {

    @Id
    private String id;

    private String username;

    private String password;

    @Override
    public List getAuthorities() {
        return Collections.EMPTY_LIST;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
