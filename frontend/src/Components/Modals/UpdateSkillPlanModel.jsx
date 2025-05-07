import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, DatePicker, Checkbox, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import SkillPlanService from "../../Services/SkillPlanService";
import dayjs from 'dayjs';

const { Option } = Select;

const UpdateSkillPlanModal = () => {
  const snap = useSnapshot(state);
  const selectedSkillPlan = snap.selectedSkillPlanToUpdate;
  const [updateSkillPlanLoading, setUpdateSkillPlanLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedSkillPlan) {
      // Check both isFinished and finished properties to handle any backend inconsistency
      const isCompleted = 
        selectedSkillPlan.isFinished === true || 
        selectedSkillPlan.isFinished === "true" ||
        selectedSkillPlan.finished === true || 
        selectedSkillPlan.finished === "true";
      
      form.setFieldsValue({
        skillDetails: selectedSkillPlan.skillDetails,
        skillLevel: selectedSkillPlan.skillLevel,
        resources: selectedSkillPlan.resources,
        date: selectedSkillPlan.date ? dayjs(selectedSkillPlan.date) : null,
        isFinished: isCompleted,
      });
    }
  }, [form, selectedSkillPlan]);

  const updatePlan = async (values) => {
    try {
      setUpdateSkillPlanLoading(true);
      
      // Ensure userId is available
      if (!snap.currentUser?.uid) {
        message.error("User not authenticated");
        return;
      }
      
      // Create the updated plan - explicitly set both fields to match backend expectations
      const updatedPlan = {
        ...values,
        userId: snap.currentUser.uid, // Include user ID for ownership verification
        date: values.date.format("YYYY-MM-DD"),
        isFinished: Boolean(values.isFinished),
        finished: Boolean(values.isFinished) // Add this field to ensure backend compatibility
      };
      
      await SkillPlanService.updateSkillPlan(selectedSkillPlan.id, updatedPlan);
      
      // Update the local state immediately for better UX
      const updatedPlans = snap.skillPlans.map(plan => 
        plan.id === selectedSkillPlan.id 
          ? { 
              ...plan, 
              ...updatedPlan, 
              id: selectedSkillPlan.id,
              // Ensure both fields are set in the local state
              isFinished: Boolean(values.isFinished),
              finished: Boolean(values.isFinished)
            } 
          : plan
      );
      state.skillPlans = updatedPlans;
      
      // Refresh from server to ensure consistency
      const refreshedPlans = await SkillPlanService.getUserSkillPlans(snap.currentUser.uid);
      state.skillPlans = refreshedPlans;
      
      message.success("Skill plan updated successfully");
      state.updateSkillPlanOpened = false;
    } catch (error) {
      console.error("Error updating skill plan:", error);
      message.error("Failed to update skill plan");
    } finally {
      setUpdateSkillPlanLoading(false);
    }
  };

  return (
    <Modal
      title="Update Skill Plan"
      open={snap.updateSkillPlanOpened}
      footer={null}
      onCancel={() => {
        state.updateSkillPlanOpened = false;
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={updatePlan}
      >
        <Form.Item
          name="skillDetails"
          label="Skill Details"
          rules={[{ required: true, message: "Please enter skill details" }]}
        >
          <Input.TextArea />
        </Form.Item>
        
        <Form.Item
          name="skillLevel"
          label="Skill Level"
          rules={[{ required: true, message: "Please select skill level" }]}
        >
          <Select>
            <Option value="beginner">Beginner</Option>
            <Option value="intermediate">Intermediate</Option>
            <Option value="advanced">Advanced</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="resources"
          label="Resources"
          rules={[{ required: true, message: "Please provide resources" }]}
        >
          <Input.TextArea />
        </Form.Item>
        
        <Form.Item
          name="date"
          label="Scheduled Date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        
        <Form.Item
          name="isFinished"
          valuePropName="checked"
          label="Is Finished?"
        >
          <Checkbox />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateSkillPlanLoading}
            block
          >
            Update Skill Plan
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateSkillPlanModal;