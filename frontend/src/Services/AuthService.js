import axios from "axios";
import { BASE_URL } from "../constants";

class AuthService {
  // Add this function to your AuthService class
  setAuthData(userId, accessToken, refreshToken = null) {
    console.log('[AuthService] Setting auth data:', {
      userId: userId,
      accessToken: accessToken ? 'EXISTS (not shown for security)' : 'NOT FOUND',
      hasRefreshToken: !!refreshToken
    });
    
    localStorage.setItem('userId', userId);
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    // Dispatch a custom event that all components can listen for
    const authEvent = new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: true }
    });
    console.log('[AuthService] Dispatching custom authStateChanged event');
    window.dispatchEvent(authEvent);
    
    // Also dispatch storage event for backward compatibility
    console.log('[AuthService] Dispatching storage event');
    window.dispatchEvent(new Event('storage'));
  }

  async login(username, password) {
    console.log('[AuthService] Manual login attempt:', { username });
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });

      console.log('[AuthService] Login response status:', response.status);
      
      if (response.status !== 200) {
        throw new Error("Invalid username or password");
      }

      console.log('[AuthService] Login successful, data:', {
        userId: response.data.userId,
        accessToken: response.data.accessToken ? 'EXISTS (not shown for security)' : 'NOT FOUND'
      });
      
      // Use the central auth method instead of direct localStorage setting
      this.setAuthData(response.data.userId, response.data.accessToken);
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw new Error(error.response?.data || "An error occurred during login");
    }
  }

  async register(username, password) {
    console.log('[AuthService] Registration attempt:', { username });
    try {
      // Changed endpoint from /auth/login to /auth/register
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        username,
        password,
      });
  
      console.log('[AuthService] Registration response status:', response.status);
      
      if (response.status !== 200) {
        throw new Error("Registration failed");
      }
  
      console.log('[AuthService] Registration successful, data:', {
        userId: response.data.userId,
        accessToken: response.data.accessToken ? 'EXISTS (not shown for security)' : 'NOT FOUND'
      });
      
      // Use the central auth method instead of direct localStorage setting
      this.setAuthData(response.data.userId, response.data.accessToken);
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      throw new Error(error.response?.data || "An error occurred during registration");
    }
  }

  async getCurrentUser() {
    console.log('[AuthService] Getting current user');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');  // UserID from OAuth or manual login

      // Check if the user is authenticated
      if (!userId) {
        console.error('[AuthService] No userId found in localStorage');
        return null;
      }

      // Determine if the login was manual or OAuth (depending on whether we have a username or userId)
      const isOAuthLogin = accessToken && userId;

      if (isOAuthLogin) {
        // If OAuth login, fetch user info using userId (from OAuth response)
        console.log('[AuthService] OAuth login detected, fetching user info with userId');
        const response = await axios.get(`${BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      } else {
        // Manual login - get user info using the username
        const username = localStorage.getItem('username');  // Assuming you saved the username in localStorage
        console.log('[AuthService] Manual login detected, fetching user info with username');
        const response = await axios.get(`${BASE_URL}/users/username/${username}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      }

    } catch (error) {
      console.error('[AuthService] Error fetching current user:', error);
      return null;
    }
  }

  async refreshToken() {
    console.log('[AuthService] Refreshing token');
    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('[AuthService] Current access token:', accessToken ? 'EXISTS (not shown for security)' : 'NOT FOUND');
      
      const response = await axios.get(`${BASE_URL}/auth/refresh`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.data) {
        console.log('[AuthService] Token refresh successful');
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        
        // Trigger a storage event manually
        console.log('[AuthService] Dispatching storage event');
        window.dispatchEvent(new Event('storage'));
      }
      
      return response.data;
    } catch (error) {
      console.error('[AuthService] Error refreshing token:', error);
      this.logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  logout() {
    console.log('[AuthService] Logging out user');
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    console.log('[AuthService] Local storage after logout:', {
      userId: localStorage.getItem('userId'),
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    });
    
    // Trigger a storage event manually
    console.log('[AuthService] Dispatching storage event');
    window.dispatchEvent(new Event('storage'));
    
    // Call the logout endpoint
    return axios.post(`${BASE_URL}/logout`, {}, {
      withCredentials: true
    }).catch(error => {
      console.error('[AuthService] Error during logout:', error);
    });
  }

  // Check if user is authenticated
  isAuthenticated() {
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');
    
    console.log('[AuthService] Checking isAuthenticated:', {
      userId: userId,
      accessToken: accessToken ? 'EXISTS (not shown for security)' : 'NOT FOUND',
      result: !!(userId && accessToken)
    });
    
    return !!(userId && accessToken);
  }
}

export default new AuthService();