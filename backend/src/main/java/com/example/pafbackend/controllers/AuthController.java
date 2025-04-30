package com.example.pafbackend.controllers;

import com.example.pafbackend.config.TokenGenerator;
import com.example.pafbackend.dto.LoginDTO;
import com.example.pafbackend.dto.SignupDTO;
import com.example.pafbackend.dto.TokenDTO;
import com.example.pafbackend.dto.UserDTO;
import com.example.pafbackend.models.User;
import com.example.pafbackend.services.CustomOAuth2User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    UserDetailsManager userDetailsManager;

    @Autowired
    TokenGenerator tokenGenerator;

    @Autowired
    DaoAuthenticationProvider daoAuthenticationProvider;

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody SignupDTO signupDTO) {
        try {
            User user = new User();
            user.setUsername(signupDTO.getUsername());
            user.setPassword(signupDTO.getPassword());
            userDetailsManager.createUser(user);

            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                    user, signupDTO.getPassword(), Collections.EMPTY_LIST);
            return ResponseEntity.ok(tokenGenerator.createToken(authentication));
        } catch (UsernameNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Username not found!");
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Bad credentials!");
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Username may already exist!");
        } catch (Exception ex) {
            logger.error("Registration error", ex);
            return ResponseEntity.internalServerError().body("Error: An unexpected error occurred. Please try again later.");
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            logger.info("====== Login method called for " + loginDTO.getUsername());
            Authentication authentication = daoAuthenticationProvider.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(loginDTO.getUsername(), loginDTO.getPassword())
            );
            return ResponseEntity.ok(tokenGenerator.createToken(authentication));
        } catch (AuthenticationException ex) {
            logger.error("Authentication error", ex);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        } catch (Exception ex) {
            logger.error("Login error", ex);
            return ResponseEntity.internalServerError().body("Error: An unexpected error occurred. Please try again later.");
        }
    }
    
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Object principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
            }
            
            Map<String, Object> userInfo = new HashMap<>();
            
            // Handle different types of principals
            if (principal instanceof User) {
                User user = (User) principal;
                userInfo.put("id", user.getId());
                userInfo.put("username", user.getUsername());
                userInfo.put("authType", "manual");
            } else if (principal instanceof CustomOAuth2User) {
                CustomOAuth2User oAuth2User = (CustomOAuth2User) principal;
                userInfo.put("id", oAuth2User.getId());
                userInfo.put("username", oAuth2User.getName());
                userInfo.put("email", oAuth2User.getEmail());
                userInfo.put("authType", "oauth2");
            } else if (principal instanceof OAuth2User) {
                OAuth2User oAuth2User = (OAuth2User) principal;
                userInfo.put("name", oAuth2User.getAttribute("name"));
                userInfo.put("email", oAuth2User.getAttribute("email"));
                userInfo.put("authType", "oauth2");
            }
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception ex) {
            logger.error("Error getting current user", ex);
            return ResponseEntity.internalServerError().body("Error retrieving user information");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(Collections.singletonMap("message", "Logged out successfully"));
        } catch (Exception ex) {
            logger.error("Logout error", ex);
            return ResponseEntity.internalServerError().body("Error during logout process");
        }
    }
    
    @GetMapping("/auth/refresh")
    public ResponseEntity<?> refreshToken(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
        
        try {
            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                    user, "", Collections.EMPTY_LIST);
            TokenDTO tokenDTO = tokenGenerator.createToken(authentication);
            return ResponseEntity.ok(tokenDTO);
        } catch (Exception ex) {
            logger.error("Token refresh error", ex);
            return ResponseEntity.internalServerError().body("Error refreshing tokens");
        }
    }
}