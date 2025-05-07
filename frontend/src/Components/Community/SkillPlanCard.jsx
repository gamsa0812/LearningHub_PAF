import React, { useState, useEffect } from "react";
import { Card, Button, Checkbox, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import SkillPlanService from "../../Services/SkillPlanService";
import dayjs from 'dayjs';

const SkillPlanCard = ({ plan }) => {
  const snap = useSnapshot(state);
  const [deleteLoading, setIsDeleteLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(Boolean(plan.isFinished));
  const [updateLoading, setUpdateLoading] = useState(false);

  // Update local state when plan prop changes
  useEffect(() => {
    setIsFinished(Boolean(plan.isFinished));
  }, [plan.isFinished]);

  const deletePlan = async () => {
    try {
      setIsDeleteLoading(true);
      
      // Ensure user ID is passed for ownership verification
      await SkillPlanService.deleteSkillPlan(plan.id, snap.currentUser.uid);
      
      // Refresh the skill plans list specifically for the current user
      state.skillPlans = await SkillPlanService.getUserSkillPlans(snap.currentUser.uid);
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleCheckboxChange = async (e) => {
    try {
      setUpdateLoading(true);
      const newStatus = e.target.checked;
      
      // Update local state immediately for better UX
      setIsFinished(newStatus);

      // Make a copy of the plan to avoid direct mutation
      const updatedPlan = {
        ...plan,
        isFinished: newStatus,
        finished: newStatus, // Include both fields for consistency
        userId: snap.currentUser.uid // Include user ID for ownership verification
      };

      // Update the plan in the backend
      await SkillPlanService.updateSkillPlan(plan.id, updatedPlan);

      // Update the plan in global state
      const updatedPlans = snap.skillPlans.map(p => 
        p.id === plan.id ? { ...p, isFinished: newStatus, finished: newStatus } : p
      );
      state.skillPlans = updatedPlans;
      
      // Optional: Refresh from server to ensure consistency
      state.skillPlans = await SkillPlanService.getUserSkillPlans(snap.currentUser.uid);
    } catch (error) {
      console.error("Error updating plan status:", error);
      // Revert local state on error
      setIsFinished(!e.target.checked);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Card
      className={`skill-plan-card ${isFinished ? 'skill-plan-completed' : 'skill-plan-active'}`}
      bordered={false}
    >
      <div className="skill-plan-header">
        <Checkbox
          checked={isFinished}
          onChange={handleCheckboxChange}
          disabled={updateLoading}
          className="skill-plan-checkbox"
        />
        <h3 className="skill-plan-title">{plan.skillDetails}</h3>
        
        <div className="skill-plan-action-buttons">
          <Tooltip title="Edit task">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                state.selectedSkillPlanToUpdate = plan;
                state.updateSkillPlanOpened = true;
              }}
              className="skill-plan-edit-btn"
              type="text"
            />
          </Tooltip>
          
          <Tooltip title="Delete task">
            <Button
              icon={<DeleteOutlined />}
              onClick={deletePlan}
              loading={deleteLoading}
              className="skill-plan-delete-btn"
              type="text"
              danger
            />
          </Tooltip>
        </div>
      </div>
      
      <div className="skill-plan-body">
        <div className="skill-plan-metadata">
          <div className="skill-plan-tag">Level: {plan.skillLevel}</div>
          <div className="skill-plan-date">
            <ClockCircleOutlined /> {dayjs(plan.date).format("MMM D, YYYY")}
          </div>
        </div>
        
        {plan.resources && (
          <div className="skill-plan-resources">
            <div className="skill-plan-resources-label">Resources:</div>
            <div className="skill-plan-resources-value">{plan.resources}</div>
          </div>
        )}
      </div>
      
      <div className="skill-plan-status">
        {isFinished ? (
          <div className="skill-plan-completed-tag">
            <CheckCircleOutlined /> Completed
          </div>
        ) : (
          <div className="skill-plan-pending-tag">
            <ClockCircleOutlined /> In Progress
          </div>
        )}
      </div>
    </Card>
  );
};

export default SkillPlanCard;