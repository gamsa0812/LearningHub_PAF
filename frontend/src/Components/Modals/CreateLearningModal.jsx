import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Select, DatePicker, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningService from "../../Services/LearningService";
import { motion, AnimatePresence } from "framer-motion";

const { Option } = Select;
const { TextArea } = Input;

const CreateLearningModal = ({ onRefresh }) => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("general");

  useEffect(() => {
    if (snap.createLearningModalOpened) {
      form.resetFields();
      setTemplate("general");
    }
  }, [snap.createLearningModalOpened, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (values.dateObtained) {
        values.dateObtained = values.dateObtained.format("YYYY-MM-DD");
      }

      const body = {
        ...values,
        userId: snap.currentUser?.uid,
        template: template,
        timestamp: new Date().toISOString(),
      };

      const tempId = `temp-${Date.now()}`;
      const tempLearning = {
        ...body,
        id: tempId,
      };

      if (!state.learningEntries) {
        state.learningEntries = [];
      }
      state.learningEntries = [tempLearning, ...state.learningEntries];

      const newLearning = await LearningService.createLearning(body);

      state.learningEntries = state.learningEntries.map((entry) =>
        entry.id === tempId ? newLearning : entry
      );

      message.success("Learning entry created successfully");
      form.resetFields();
      state.createLearningModalOpened = false;
      
      if (onRefresh) onRefresh();
    } catch (error) {
      if (state.learningEntries) {
        state.learningEntries = state.learningEntries.filter(
          (entry) => !entry.id.startsWith("temp-")
        );
      }
      console.error("Failed to create learning entry:", error);
      message.error("Failed to create learning entry");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (value) => {
    setTemplate(value);
    form.resetFields(['projectName', 'projectLink', 'certificationName', 'provider', 'dateObtained', 
                     'challengeName', 'result', 'workshopName', 'duration']);
  };

  const renderTemplateFields = () => {
    switch (template) {
      case "project":
        return (
          <>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[{ required: true, message: "Please enter project name" }]}
            >
              <Input placeholder="Enter project name" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
            <Form.Item
              name="projectLink"
              label="Project Link"
              rules={[{ required: false }]}
            >
              <Input placeholder="Enter project link (optional)" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
          </>
        );
      case "certification":
        return (
          <>
            <Form.Item
              name="certificationName"
              label="Certification Name"
              rules={[{ required: true, message: "Please enter certification name" }]}
            >
              <Input placeholder="Enter certification name" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
            <Form.Item
              name="provider"
              label="Provider"
              rules={[{ required: true, message: "Please enter provider" }]}
            >
              <Input placeholder="Enter certification provider" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
            <Form.Item
              name="dateObtained"
              label="Date Obtained"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker style={{ width: "100%" }} className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
          </>
        );
      case "challenge":
        return (
          <>
            <Form.Item
              name="challengeName"
              label="Challenge Name"
              rules={[{ required: true, message: "Please enter challenge name" }]}
            >
              <Input placeholder="Enter challenge name" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
            <Form.Item
              name="result"
              label="Result"
              rules={[{ required: true, message: "Please enter result" }]}
            >
              <Input placeholder="Enter challenge result" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
          </>
        );
      case "workshop":
        return (
          <>
            <Form.Item
              name="workshopName"
              label="Workshop Name"
              rules={[{ required: true, message: "Please enter workshop name" }]}
            >
              <Input placeholder="Enter workshop name" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
            <Form.Item
              name="provider"
              label="Provider"
              rules={[{ required: true, message: "Please enter provider" }]}
            >
              <Input placeholder="Enter workshop provider" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: "Please enter duration" }]}
            >
              <Input placeholder="Enter workshop duration" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  const closeModal = () => {
    form.resetFields();
    state.createLearningModalOpened = false;
  };

  return (
    <Modal
      title={null}
      open={snap.createLearningModalOpened}
      onCancel={closeModal}
      footer={null}
      className="rounded-2xl shadow-2xl"
      bodyStyle={{ padding: "20px", background: "linear-gradient(to bottom right, #f5f3ff, #ede9fe)" }}
      destroyOnClose={true}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Track Learning Progress</h2>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            name="template"
            label="Learning Type"
            rules={[{ required: true, message: "Please select a learning type" }]}
            initialValue="general"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Select onChange={handleTemplateChange} value={template} className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400">
                <Option value="general">General Learning</Option>
                <Option value="project">Completed Project/Task</Option>
                <Option value="certification">Certification/Qualification</Option>
                <Option value="challenge">Challenges/Competitions</Option>
                <Option value="workshop">Workshops/Bootcamps</Option>
              </Select>
            </motion.div>
          </Form.Item>

          <Form.Item
            name="topic"
            label="Topic"
            rules={[{ required: true, message: "Please enter topic" }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Input placeholder="What did you learn?" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </motion.div>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TextArea rows={4} placeholder="Describe what you learned..." className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </motion.div>
          </Form.Item>

          <Form.Item
            name="resourceLink"
            label="Resource Link"
            rules={[{ required: false }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Input placeholder="Link to resource (optional)" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </motion.div>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
            initialValue="In Progress"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Select className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400">
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
                <Option value="On Hold">On Hold</Option>
                <Option value="Planned">Planned</Option>
              </Select>
            </motion.div>
          </Form.Item>

          <AnimatePresence>
            {renderTemplateFields()}
          </AnimatePresence>

          <Form.Item
            name="nextSteps"
            label="Next Steps"
            rules={[{ required: false }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <TextArea rows={3} placeholder="What are your next steps?" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </motion.div>
          </Form.Item>

          <Form.Item
            name="reflection"
            label="Reflection"
            rules={[{ required: false }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <TextArea rows={3} placeholder="Reflect on what you've learned..." className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
            </motion.div>
          </Form.Item>

          <Form.Item>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-12 text-lg font-semibold shadow-md shadow-purple-600/50"
              >
                Save Learning Entry
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default CreateLearningModal;