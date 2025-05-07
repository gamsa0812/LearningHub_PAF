import axios from "axios";
import { BASE_URL } from "../constants";

class LearningService {
  async createLearning(learningData) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.post(`${BASE_URL}/learning`, learningData, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create learning entry");
    }
  }

  async getLearningByUserId(userId) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${BASE_URL}/learning/${userId}`, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to get learning entries");
    }
  }

  async getLearningById(learningId) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${BASE_URL}/learning/entry/${learningId}`, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to get learning entry");
    }
  }

  async updateLearning(learningId, learningData) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.put(
        `${BASE_URL}/learning/${learningId}`,
        learningData,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update learning entry");
    }
  }

  async deleteLearning(learningId, userId) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization:` Bearer ${accessToken}`,
        },
        params: {
          userId: userId
        }
      };
      await axios.delete(`${BASE_URL}/learning/${learningId}`, config);
    } catch (error) {
      throw new Error("Failed to delete learning entry");
    }
  }
}

export default new LearningService();