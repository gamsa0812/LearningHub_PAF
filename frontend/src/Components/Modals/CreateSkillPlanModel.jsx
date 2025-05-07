import React, { useState } from "react";
import { Modal, Form, Input, Button, Select, DatePicker, Checkbox, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import SkillPlanService from "../../Services/SkillPlanService";
import dayjs from 'dayjs';

const { Option } = Select;

const CreateSkillPlanModal = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Ensure userId is available
      if (!snap.currentUser?.uid) {
        message.error("User not authenticated");
        return;
      }

      // Create the skill plan with explicit boolean conversion for isFinished
      // Also include "finished" field to match backend expectations
      const newSkillPlan = {
        skillDetails: values.skillDetails,
        skillLevel: values.skillLevel,
        resources: values.resources,
        userId: snap.currentUser.uid,
        date: values.date.format("YYYY-MM-DD"),
        isFinished: Boolean(values.isFinished),
        finished: Boolean(values.isFinished) // Add this field to ensure backend compatibility
      };

      await SkillPlanService.createSkillPlan(newSkillPlan);
      
      // Refresh the skill plans list for the current user only
      const refreshedPlans = await SkillPlanService.getUserSkillPlans(snap.currentUser.uid);
      state.skillPlans = refreshedPlans;
      
      message.success("Skill plan created successfully");
      form.resetFields();
      state.createSkillPlanOpened = false;
    } catch (error) {
      console.error("Error creating skill plan:", error);
      message.error("Failed to create skill plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Skill Plan"
      open={snap.createSkillPlanOpened}
      footer={null}
      onCancel={() => {
        form.resetFields();
        state.createSkillPlanOpened = false;
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="skillDetails"
          label="Skill Details"
          rules={[{ required: true, message: "Please enter skill details" }]}
        >
          <Input.TextArea placeholder="What skill do you want to develop?" />
        </Form.Item>
        
        <Form.Item
          name="skillLevel"
          label="Skill Level"
          rules={[{ required: true, message: "Please select skill level" }]}
        >
          <Select placeholder="Select skill level">
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
          <Input.TextArea placeholder="Books, courses, websites, etc." />
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
          initialValue={false}
          label="Is Finished?"
        >
          <Checkbox />
        </Form.Item>
        Figure
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Skill Plan
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSkillPlanModal;