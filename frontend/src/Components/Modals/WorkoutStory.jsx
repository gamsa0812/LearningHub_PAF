import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Input, Upload, message, Spin, Avatar } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import WorkoutStoryService from "../../Services/WorkoutStoryService";

const uploadService = new UploadFileService();

const WorkoutStory = () => {
  const snap = useSnapshot(state);
  const userId = snap.currentUser?.id;
  const workoutStory = snap.selectedWorkoutStory;
  const [imageUploading, setImageUploading] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState();
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    form.setFieldsValue({
      title: workoutStory?.title,
      description: workoutStory?.description,
    });
    
    setUploadedImage(null);
    
    // Find the author of the workout story
    if (snap.users && workoutStory?.userId) {
      const storyAuthor = snap.users.find(user => user.id === workoutStory.userId);
      setAuthor(storyAuthor);
    }
  }, [workoutStory, snap.users, form]);

  const [updatedStory, setUpdatedStory] = useState({
    title: workoutStory?.title || "",
    image: workoutStory?.image || "",
    description: workoutStory?.description || "",
  });

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await WorkoutStoryService.updateWorkoutStory(
        snap.selectedWorkoutStory.id,
        updatedStory
      );
      state.storyCards = await WorkoutStoryService.getAllWorkoutStories();
      state.workoutStoryOpen = false;
      message.success("Story updated successfully");
      form.resetFields();
    } catch (error) {
      message.error("Error while updating story");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await WorkoutStoryService.deleteWorkoutStory(
        snap.selectedWorkoutStory.id
      );
      state.storyCards = await WorkoutStoryService.getAllWorkoutStories();
      state.workoutStoryOpen = false;
      message.success("Workout story deleted successfully");
    } catch (error) {
      message.error("Failed to delete story");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields(); // Reset form fields to initial values
    setUpdatedStory({
      title: workoutStory?.title || "",
      image: workoutStory?.image || "",
      description: workoutStory?.description || "",
    });
    state.workoutStoryOpen = false;
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      setImageUploading(true);
      try {
        const uploadedImageUrl = await uploadService.uploadFile(
          info.fileList[0].originFileObj, // The file object
          "workoutStories" // The path in Firebase Storage
        );

        // Update state with the uploaded image URL
        setUpdatedStory({ ...updatedStory, image: uploadedImageUrl });
        setUploadedImage(uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Failed to upload image");
      } finally {
        setImageUploading(false);
      }
    }
  };

  if (!workoutStory) {
    return null;
  }

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar 
            src={author?.image} 
            icon={<UserOutlined />} 
            size="small"
          />
          <span>{workoutStory.title}</span>
        </div>
      }
      open={snap.workoutStoryOpen}
      onCancel={handleCancel}
      footer={
        userId === workoutStory.userId
          ? [
              <Button key="cancel" onClick={handleCancel}>
                Cancel
              </Button>,
              <Button
                loading={loading}
                style={{ marginRight: 8, marginLeft: 8 }}
                key="submit"
                type="primary"
                onClick={handleUpdate}
              >
                Update
              </Button>,
              <Button
                loading={deleteLoading}
                danger
                key="delete"
                type="primary"
                onClick={handleDelete}
              >
                Delete
              </Button>,
            ]
          : [
              <Button key="close" onClick={handleCancel}>
                Close
              </Button>
            ]
      }
      bodyStyle={{ padding: "20px" }}
      width={600}
    >
      {userId !== workoutStory.userId ? (
        <div className="story-view-container">
          <div className="story-image-wrapper">
            <img 
              src={workoutStory?.image} 
              alt={workoutStory?.title} 
              className="story-full-image" 
            />
          </div>
          <div className="story-details">
            <h3>{workoutStory?.title}</h3>
            <p>{workoutStory?.description}</p>
            {workoutStory.timestamp && (
              <p className="story-timestamp">
                {new Date(workoutStory.timestamp).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <div className="story-image-editor">
            {imageUploading ? (
              <div className="image-uploading">
                <Spin tip="Uploading..." />
              </div>
            ) : (
              <img
                className="edit-story-image"
                src={uploadedImage || workoutStory?.image}
                alt="Workout Story"
              />
            )}
          </div>
          
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input
              value={updatedStory.title}
              onChange={(e) =>
                setUpdatedStory({ ...updatedStory, title: e.target.value })
              }
            />
          </Form.Item>
          
          <Form.Item label="Image" name="image">
            <Upload
              beforeUpload={() => false} // Prevent default upload behavior
              onChange={handleFileChange}
              showUploadList={false}
              disabled={imageUploading}
            >
              <Button icon={<UploadOutlined />} disabled={imageUploading}>
                {imageUploading ? "Uploading..." : "Change Image"}
              </Button>
            </Upload>
          </Form.Item>
          
          <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter a description' }]}>
            <Input.TextArea
              rows={4}
              value={updatedStory.description}
              onChange={(e) =>
                setUpdatedStory({
                  ...updatedStory,
                  description: e.target.value,
                })
              }
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default WorkoutStory;