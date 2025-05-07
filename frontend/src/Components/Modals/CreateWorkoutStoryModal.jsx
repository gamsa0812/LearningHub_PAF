import React, { useState } from "react";
import { Modal, Upload, Input, Button, DatePicker, message, Form, Spin } from "antd";
import { UploadOutlined, PictureOutlined } from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import WorkoutStoryService from "../../Services/WorkoutStoryService";
import { motion, AnimatePresence } from "framer-motion";

const uploader = new UploadFileService();

const CreateWorkoutStoryModal = () => {
  const snap = useSnapshot(state);
  const [imageUploading, setImageUploading] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCreateWorkoutStory = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (!image) {
        message.error("Please upload an image");
        return;
      }
      
      setLoading(true);
      const body = {
        title: values.title,
        description: values.description,
        timestamp: values.timestamp ? values.timestamp.toISOString() : new Date().toISOString(),
        image,
        userId: snap.currentUser?.id,
      };
      
      await WorkoutStoryService.createWorkoutStory(body);
      state.storyCards = await WorkoutStoryService.getAllWorkoutStories();
      message.success("Workout story created successfully");
      form.resetFields();
      setImage(null);
      state.createWorkoutStatusModalOpened = false;
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error("Error creating workout story");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      setImageUploading(true);
      try {
        const url = await uploader.uploadFile(
          info.fileList[0].originFileObj,
          "workoutStories"
        );
        setImage(url);
        message.success("Image uploaded successfully");
      } catch (error) {
        message.error("Failed to upload image");
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImage(null);
    state.createWorkoutStatusModalOpened = false;
  };

  return (
    <Modal
      title={null}
      open={snap.createWorkoutStatusModalOpened}
      onCancel={handleCancel}
      footer={null}
      className="rounded-2xl shadow-2xl"
      bodyStyle={{ padding: "20px", background: "linear-gradient(to bottom right, #f5f3ff, #ede9fe)" }}
      width={500}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Create Workout Story</h2>
        <Form form={form} layout="vertical" className="space-y-4">
          <Form.Item 
            name="title" 
            label="Title" 
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                placeholder="Enter story title"
                className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400"
              />
            </motion.div>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Input.TextArea 
                placeholder="Describe your workout story" 
                rows={4}
                className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400"
              />
            </motion.div>
          </Form.Item>
          
          <Form.Item name="timestamp" label="Date">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400"
              />
            </motion.div>
          </Form.Item>
          
          <Form.Item label="Image" required>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="image-upload-area">
                {imageUploading ? (
                  <div className="uploading-indicator flex flex-col items-center justify-center h-[200px] bg-purple-50 rounded-lg">
                    <Spin tip="Uploading..." />
                  </div>
                ) : image ? (
                  <div className="preview-container flex flex-col items-center">
                    <img src={image} alt="Preview" className="image-preview w-full max-h-[200px] object-contain rounded-lg border border-purple-200" />
                    <Upload
                      accept="image/*"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                      >
                        Change Image
                      </Button>
                    </Upload>
                  </div>
                ) : (
                  <Upload
                    accept="image/*"
                    onChange={handleFileChange}
                    showUploadList={false}
                    beforeUpload={() => false}
                  >
                    <div className="upload-placeholder flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-purple-400 rounded-lg hover:border-purple-600 transition-all cursor-pointer">
                      <PictureOutlined className="text-3xl text-purple-400 opacity-50" />
                      <p className="mt-2 text-purple-600">Click to upload an image</p>
                    </div>
                  </Upload>
                )}
              </div>
            </motion.div>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={handleCancel}
                className="rounded-lg border-purple-600 text-purple-600 hover:bg-purple-100"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                loading={loading}
                type="primary"
                onClick={handleCreateWorkoutStory}
                disabled={imageUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Create
              </Button>
            </motion.div>
          </div>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default CreateWorkoutStoryModal;