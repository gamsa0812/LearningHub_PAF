package com.example.pafbackend.services;

import com.example.pafbackend.models.User;
import com.example.pafbackend.models.UserProfile;
import com.example.pafbackend.repositories.UserRepository;
import com.example.pafbackend.repositories.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository; // Assuming you have a UserProfile repository

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Extract email from OAuth user info (assuming 'email' attribute is available)
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        // Use email as the username for OAuth users
        String username = (email != null) ? email : name + "_" + userRequest.getClientRegistration().getRegistrationId();

        // Check if user already exists in the database
        Optional<User> userOptional = userRepository.findByUsername(username);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            // Create a new user if not found
            user = new User();
            user.setUsername(username);

            // Set a random secure password for OAuth users (since we can't authenticate using a password here)
            user.setPassword(UUID.randomUUID().toString());
            userRepository.save(user);
        }

        // Automatically create the user profile if it doesn't exist
        List<UserProfile> userProfiles = userProfileRepository.findByUserId(user.getId());
        if (userProfiles.isEmpty()) {
            UserProfile userProfile = new UserProfile();
            userProfile.setUserId(user.getId());
            userProfile.setEmail(user.getUsername());  // Set email as username
            userProfile.setProfileVisibility(true);    // Set default visibility to true (or adjust based on your needs)

            // No need to set other fields like first name or last name here

            userProfileRepository.save(userProfile);
        }

        // Return a custom OAuth2User with the User entity wrapped
        return new CustomOAuth2User(oauth2User, user);
    }
}
