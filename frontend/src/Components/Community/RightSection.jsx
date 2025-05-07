import React from "react";
import Contacts from "./Contacts";

const RightSection = () => {
  return (
    <div
      style={{
        width: "20%",
        height: "92vh",
        overflow: "hidden",
        overflowY: "auto",
        background: "#FFFFFF",
        padding: "20px 16px",
        color: "#333",
        position: "fixed",
        right: 0,
        borderLeft: "1px solid #e0e0e0",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.03)"
      }}
    >
      <div>
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}
        >
          <h2 
            style={{
              fontSize: "16px",
              color: "#555",
              fontWeight: "600",
              margin: "0"
            }}
          >
            Your Pages and profiles
          </h2>
          <div 
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s ease"
            }}
            className="menu-button"
          >
            <i 
              className="fa-solid fa-ellipsis"
              style={{ fontSize: "16px", color: "#666" }}
            ></i>
          </div>
        </div>

        <div 
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 0",
            marginBottom: "8px"
          }}
        >
          <img 
            alt="page-profile" 
            src="image/page.jpg"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "cover",
              borderRadius: "50%",
              marginRight: "12px",
              border: "2px solid #64B5F6"
            }}
          />
          <p style={{ margin: 0, fontWeight: "500" }}>Web Designer</p>
        </div>

        <div 
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 8px",
            borderRadius: "8px",
            marginBottom: "8px",
            transition: "background 0.2s ease"
          }}
          className="action-item"
        >
          <i 
            className="fa-regular fa-bell"
            style={{
              color: "#64B5F6",
              fontSize: "18px",
              marginRight: "12px",
              width: "18px"
            }}
          ></i>
          <p style={{ margin: 0 }}>20 Notifications</p>
        </div>

        <div 
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 8px",
            borderRadius: "8px",
            marginBottom: "8px",
            transition: "background 0.2s ease"
          }}
          className="action-item"
        >
          <i 
            className="fa-solid fa-bullhorn"
            style={{
              color: "#64B5F6",
              fontSize: "18px",
              marginRight: "12px",
              width: "18px"
            }}
          ></i>
          <p style={{ margin: 0 }}>Create promotion</p>
        </div>
      </div>

      <div 
        style={{
          width: "100%",
          height: "1px",
          background: "#e0e0e0",
          margin: "16px 0"
        }}
      ></div>

      {/* Contacts component would go here */}
      
      <style jsx>{`
        .menu-button:hover {
          background: #f0f2f5;
        }
        
        .action-item:hover {
          background: #f0f2f5;
          cursor: pointer;
        }
        
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background: #cfd8dc;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #b0bec5;
        }
      `}</style>
    </div>
  );
};

export default RightSection;