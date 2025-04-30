package com.example.pafbackend.config;

import com.example.pafbackend.dto.TokenDTO;
import com.example.pafbackend.models.User;
import com.example.pafbackend.services.CustomOAuth2User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Lazy;

import java.io.IOException;
import java.util.Collections;

@Component
public class OAuth2LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final TokenGenerator tokenGenerator;

    public OAuth2LoginSuccessHandler(@Lazy TokenGenerator tokenGenerator) {
        this.tokenGenerator = tokenGenerator;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws ServletException, IOException {

        TokenDTO tokenDTO = null;

        // Check if this is an OAuth2 authentication
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            CustomOAuth2User oAuth2User = (CustomOAuth2User) oauthToken.getPrincipal();
            User user = oAuth2User.getUser();

            // Create a token for this user
            Authentication userAuthentication = UsernamePasswordAuthenticationToken.authenticated(
                    user, "", Collections.emptyList()
            );
            tokenDTO = tokenGenerator.createToken(userAuthentication);

            // Set tokens and user info in cookies
            addCookie(response, "access_token", tokenDTO.getAccessToken(), 86400);      // 1 day
            addCookie(response, "refresh_token", tokenDTO.getRefreshToken(), 2592000); // 30 days
            addCookie(response, "user_id", tokenDTO.getUserId(), 2592000);             // 30 days
            addCookie(response, "username", user.getUsername(), 2592000);              // 30 days
        }

        // Redirect to frontend with tokens and user info
        if (tokenDTO != null) {
            this.setAlwaysUseDefaultTargetUrl(true);
            this.setDefaultTargetUrl(
                    "http://localhost:3000/oauth2/callback"
                    + "?accessToken=" + tokenDTO.getAccessToken()
                    + "&refreshToken=" + tokenDTO.getRefreshToken()
                    + "&userId=" + tokenDTO.getUserId()
                    + "&username=" + ((OAuth2AuthenticationToken) authentication).getPrincipal().getName()
            );
        }

        super.onAuthenticationSuccess(request, response, authentication);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }
}
