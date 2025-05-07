import axios from "axios";
import { BASE_URL } from "../constants";

class PostService {
  async createPost(postData) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.post(`${BASE_URL}/posts`, postData, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create post");
    }
  }

  async getPosts() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${BASE_URL}/posts`, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to get posts");
    }
  }

  async getPostById(postId) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${BASE_URL}/posts/${postId}`, config);
      return response.data;
    } catch (error) {
      throw new Error("Failed to get post");
    }
  }

  async updatePost(postId, postData) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.put(
        `${BASE_URL}/posts/${postId}`,
        postData,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update post");
    }
  }

  async deletePost(postId) {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      await axios.delete(`${BASE_URL}/posts/${postId}`, config);
    } catch (error) {
      throw new Error("Failed to delete post");
    }
  }
}

export default new PostService();
