import axios from "axios";
import { BASE_URL } from "../constants";

const UserService = {
  async checkIfUserExists(username) {
    try {
      const response = await axios.get(`${BASE_URL}/users/exists/${username}`);
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async createProfile(body) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.post(
        `${BASE_URL}/userProfiles`,
        body,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async getProfileById(id) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(
        `${BASE_URL}/userProfiles/${id}`,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },
  async getProfiles() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${BASE_URL}/userProfiles`, config);
      return response.data;
    } catch (error) {
      throw new Error("An error occurred while checking if the user exists");
    }
  },

  async getProfile() {
    const uid = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  
    const response = await axios.get(`${BASE_URL}/users/${uid}`, config);
    const response2 = await axios.get(`${BASE_URL}/userProfiles/user/${uid}`, config);
    console.log("[getProfile] user:", response.data);
    console.log("[getProfile] profile:", response2.data);    
  
    const userProfile = response2.data && response2.data.length > 0 ? response2.data[0] : {};
  
    return {
      ...response.data,
      ...userProfile,
      uid: userProfile.id || uid, // fallback if no profile exists
    };
   
  }, 

  async updateUserPrifile(data) {
    const accessToken = localStorage.getItem("accessToken");
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      await axios.put(`${BASE_URL}/userProfiles/${data.uid}`, data, config);
    } catch (error) {
      throw new Error("An error occurred while updating user profile");
    }
  },
  async deleteUserProfileById(profileId) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      await axios.delete(`${BASE_URL}/userProfiles/${profileId}`, config);
    } catch (error) {
      throw new Error("An error occurred while deleting the user profile");
    }
  },
};

export default UserService;
