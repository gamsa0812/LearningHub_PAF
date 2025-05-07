import React, { useEffect } from "react";
import "../Styles/Header.css";
import "../Styles/navbar.css";
import Header from "../Components/Home/Header";
import UserService from "../Services/UserService";
import state from "../Utils/Store";
import Navbar from "../Components/Home/Navbar";

const Home = () => {
  useEffect(() => {
    console.log('[Home] Component mounted');
    console.log('[Home] Checking for userId in localStorage:', localStorage.getItem('userId'));
    
    if (localStorage.getItem("userId")) {
      console.log('[Home] userId found, fetching user profile');
      UserService.getProfile()
        .then((userDataMain) => {
          console.log('[Home] User profile fetched successfully:', userDataMain);
          state.currentUser = userDataMain;
        })
        .catch((err) => {
          console.error('[Home] Error fetching user profile:', err);
        });
    } else {
      console.log('[Home] No userId found in localStorage, user not logged in');
    }
    
    // Check all localStorage items
    console.log('[Home] All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = key.includes('token') 
        ? 'EXISTS (not shown for security)' 
        : localStorage.getItem(key);
      console.log(`[Home] ${key}: ${value}`);
    }
    
    return () => {
      console.log('[Home] Component unmounting');
    };
  }, []);
  
  console.log('[Home] Rendering component');
  
  return (
    <div>
      <Navbar />
      <Header />
    </div>
  );
};

export default Home;