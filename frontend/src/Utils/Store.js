import { proxy } from "valtio";

const state = proxy({
  currentUser: null,
  profileModalOpend: false,
  storyCards: [],
  createPostModalOpened: false,
  posts: [],
  users: [],
  selectedPost: null,
  updatePostModalOpened: false,
  activeIndex: 1,
  selectedUserProfile: null,
  friendProfileModalOpened: false,
  
  // Skill Plan section
  skillPlans: [], // Array to store skill plans
  createSkillPlanOpened: false, // To track if the "create skill plan" modal is open
  updateSkillPlanOpened: false, // To track if the "update skill plan" modal is open
  selectedSkillPlanToUpdate: null, // Store selected skill plan to update
});

export default state;
