import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, DatePicker, Descriptions, message, Popconfirm } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningService from "../../Services/LearningService";
import moment from "moment";
import { 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  CloseOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { motion } from "framer-motion";

const { Option } = Select;
const { TextArea } = Input;

const LearningDetailsModal = ({ onRefresh }) => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const learning = snap.selectedLearning;

  useEffect(() => {
    if (snap.learningDetailsModalOpened) {
      setIsEditing(false);
    }
  }, [snap.learningDetailsModalOpened]);

  const handleEdit = () => {
    setIsEditing(true);
    const formValues = {
      ...learning,
    };
    if (learning.dateObtained) {
      formValues.dateObtained = moment(learning.dateObtained);
    }
    form.setFieldsValue(formValues);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await LearningService.deleteLearning(learning.id, snap.currentUser.uid);
      state.learningEntries = state.learningEntries.filter(entry => entry.id !== learning.id);
      message.success("Learning entry deleted successfully");
      state.learningDetailsModalOpened = false;
      state.selectedLearning = null;
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to delete learning entry:", error);
      message.error("Failed to delete learning entry");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      if (values.dateObtained) {
        values.dateObtained = values.dateObtained.format("YYYY-MM-DD");
      }
      const updatedLearning = {
        ...learning,
        ...values,
        userId: snap.currentUser.uid,
      };
      const response = await LearningService.updateLearning(learning.id, updatedLearning);
      state.learningEntries = state.learningEntries.map(entry => 
        entry.id === learning.id ? response : entry
      );
      state.selectedLearning = response;
      message.success("Learning entry updated successfully");
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to update learning entry:", error);
      message.error("Failed to update learning entry");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateTitle = () => {
    switch (learning?.template) {
      case "project": return "Project Details";
      case "certification": return "Certification Details";
      case "challenge": return "Challenge Details";
      case "workshop": return "Workshop Details";
      default: return "Learning Details";
    }
  };

  const renderTemplateFields = () => {
    if (!learning) return null;
    switch (learning.template) {
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

  const renderTemplateDetails = () => {
    if (!learning) return null;
    switch (learning.template) {
      case "project":
        return (
          <>
            <Descriptions.Item label="Project Name">{learning.projectName}</Descriptions.Item>
            {learning.projectLink && (
              <Descriptions.Item label="Project Link">
                <a href={learning.projectLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                  {learning.projectLink} <LinkOutlined />
                </a>
              </Descriptions.Item>
            )}
          </>
        );
      case "certification":
        return (
          <>
            <Descriptions.Item label="Certification">{learning.certificationName}</Descriptions.Item>
            <Descriptions.Item label="Provider">{learning.provider}</Descriptions.Item>
            <Descriptions.Item label="Date Obtained">{learning.dateObtained}</Descriptions.Item>
          </>
        );
      case "challenge":
        return (
          <>
            <Descriptions.Item label="Challenge">{learning.challengeName}</Descriptions.Item>
            <Descriptions.Item label="Result">{learning.result}</Descriptions.Item>
          </>
        );
      case "workshop":
        return (
          <>
            <Descriptions.Item label="Workshop">{learning.workshopName}</Descriptions.Item>
            <Descriptions.Item label="Provider">{learning.provider}</Descriptions.Item>
            <Descriptions.Item label="Duration">{learning.duration}</Descriptions.Item>
          </>
        );
      default:
        return null;
    }
  };

  const renderDetailsView = () => {
    if (!learning) return null;
    return (
      <div className="learning-details">
        <Descriptions title={learning.topic} bordered column={1} className="bg-purple-50 rounded-lg shadow-sm">
          <Descriptions.Item label="Description">{learning.description}</Descriptions.Item>
          <Descriptions.Item label="Status">{learning.status}</Descriptions.Item>
          {learning.resourceLink && (
            <Descriptions.Item label="Resource Link">
              <a href={learning.resourceLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                {learning.resourceLink} <LinkOutlined />
              </a>
            </Descriptions.Item>
          )}
          {renderTemplateDetails()}
          {learning.nextSteps && (
            <Descriptions.Item label="Next Steps">{learning.nextSteps}</Descriptions.Item>
          )}
          {learning.reflection && (
            <Descriptions.Item label="Reflection">{learning.reflection}</Descriptions.Item>
          )}
          <Descriptions.Item label="Created At">
            {moment(learning.timestamp).format("MMMM D, YYYY [at] h:mm A")}
          </Descriptions.Item>
        </Descriptions>
        
        <div className="action-buttons flex gap-2 mt-4">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Edit
            </Button>
          </motion.div>
          <Popconfirm
            title="Are you sure you want to delete this entry?"
            onConfirm={handleDelete}
            okText="Yes"
            cancelText="No"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                loading={loading}
                className="border-red-500 text-red-500 hover:bg-red-100 rounded-lg"
              >
                Delete
              </Button>
            </motion.div>
          </Popconfirm>
        </div>
      </div>
    );
  };

  const renderEditForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={learning}
        className="space-y-4"
      >
        <Form.Item
          name="topic"
          label="Topic"
          rules={[{ required: true, message: "Please enter topic" }]}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Input placeholder="Enter topic" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
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
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <TextArea rows={4} placeholder="Enter description" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
          </motion.div>
        </Form.Item>
        
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Select placeholder="Select status" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400">
              <Option value="In Progress">In Progress</Option>
              <Option value="Completed">Completed</Option>
              <Option value="On Hold">On Hold</Option>
              <Option value="Planned">Planned</Option>
            </Select>
          </motion.div>
        </Form.Item>
        
        <Form.Item
          name="resourceLink"
          label="Resource Link"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Input placeholder="Enter resource link (optional)" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
          </motion.div>
        </Form.Item>
        
        {renderTemplateFields()}
        
        <Form.Item
          name="nextSteps"
          label="Next Steps"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <TextArea rows={3} placeholder="Enter next steps (optional)" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
          </motion.div>
        </Form.Item>
        
        <Form.Item
          name="reflection"
          label="Reflection"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <TextArea rows={3} placeholder="Enter reflection (optional)" className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400" />
          </motion.div>
        </Form.Item>
        
        <div className="form-actions flex gap-2">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              type="primary" 
              onClick={handleUpdate} 
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Save
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={handleCancel} 
              icon={<CloseOutlined />}
              className="rounded-lg border-purple-600 text-purple-600 hover:bg-purple-100"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      </Form>
    );
  };

  const closeModal = () => {
    state.learningDetailsModalOpened = false;
    state.selectedLearning = null;
    setIsEditing(false);
    form.resetFields();
  };

  return (
    <Modal
      title={null}
      open={snap.learningDetailsModalOpened}
      onCancel={closeModal}
      footer={null}
      width={700}
      className="rounded-2xl shadow-2xl"
      bodyStyle={{ padding: "20px", background: "linear-gradient(to bottom right, #f5f3ff, #ede9fe)" }}
      destroyOnClose
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-purple-900 mb-6">{getTemplateTitle()}</h2>
        {isEditing ? renderEditForm() : renderDetailsView()}
      </motion.div>
    </Modal>
  );
};

export default LearningDetailsModal;