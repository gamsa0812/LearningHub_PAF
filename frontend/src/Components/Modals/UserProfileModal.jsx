import React, { useState, useEffect } from "react";
import { Modal, Switch, Input, Button, Upload, message, Form } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import UserService from "../../Services/UserService";
import { useNavigate } from "react-router-dom";

const uploader = new UploadFileService();
const { Item } = Form;

const UserProfileModal = () => {
  const snap = useSnapshot(state);
  const [uploadUserLoading, setUploadUserLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Reset imageChanged state when modal opens
  useEffect(() => {
    if (snap.profileModalOpend) {
      setImageChanged(false);
    }
  }, [snap.profileModalOpend]);

  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);
      const formData = form.getFieldsValue();
      
      // Only handle image upload if it's a File object and has been changed
      if (formData.image instanceof File && imageChanged) {
        formData.image = await handleFileUpload(formData.image);
      }
      
      await UserService.updateUserPrifile({
        ...formData,
        uid: snap.currentUser?.id,
      });

      // After successful update, refresh current user data
      const updatedUserData = await UserService.getProfile();
      state.currentUser = updatedUserData; // Update the global state

      state.profileModalOpend = false;
      message.success("Profile updated successfully");
      setImageChanged(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      message.error("Profile updating failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const url = await uploader.uploadFile(file, "userImages");
      return url;
    } catch (error) {
      throw new Error("File upload failed");
    }
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      setUploadUserLoading(true);
      setImageChanged(true);
      
      try {
        const imageUrl = await handleFileUpload(info.fileList[0].originFileObj);
        form.setFieldsValue({ image: imageUrl });
        message.success("Image uploaded successfully");
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Failed to upload image");
        setImageChanged(false);
      } finally {
        setUploadUserLoading(false);
      }
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setDeleteLoading(true);
      await UserService.deleteUserProfileById(snap.currentUser?.uid);
      message.success("Profile deleted successfully");

      // After successful deletion, navigate to the login page or logout
      localStorage.clear();
      navigate("/"); // Redirect to home or login page after deletion
    } catch (error) {
      console.error("Error deleting user:", error.message);
      message.error("Profile deletion failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasFormChanged = () => {
    const currentValues = form.getFieldsValue();
    const initialValues = snap.currentUser;
  
    if (!initialValues) return false;
  
    return (
      currentValues.profileVisibility !== initialValues.profileVisibility ||
      imageChanged
    );
  };
  

  return (
    <Modal
      open={snap.profileModalOpend}
      onCancel={() => {
        state.profileModalOpend = false;
      }}
      footer={[
        <Button key="cancel" onClick={() => (state.profileModalOpend = false)}>
          Cancel
        </Button>,
        <Button
          loading={updateLoading}
          key="update"
          type="primary"
          onClick={handleUpdateProfile}
          disabled={uploadUserLoading || (!hasFormChanged() && !imageChanged)}
        >
          Update
        </Button>,
        <Button
          loading={deleteLoading}
          key="delete"
          danger
          type="dashed"
          onClick={handleDeleteProfile}
          disabled={uploadUserLoading || updateLoading}
        >
          Delete Profile
        </Button>,
        <Button
          key="logout"
          danger
          type="dashed"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          disabled={uploadUserLoading || updateLoading || deleteLoading}
        >
          Logout
        </Button>,
      ]}
    >
      <h2>User Profile</h2>
      <Form form={form} initialValues={snap.currentUser}>
        <Item name="username" label="Username">
          <Input disabled />
        </Item>

        {/* Removed Biography and Fitness Goals fields */}
        
        <Item name="image" label="Profile Picture">
          <Upload
            accept="image/*"
            onChange={handleFileChange}
            showUploadList={false}
            beforeUpload={() => false}
            disabled={uploadUserLoading}
          >
            <Button icon={uploadUserLoading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploadUserLoading}>
              {uploadUserLoading ? "Uploading..." : "Upload Image"}
            </Button>
          </Upload>
          {form.getFieldValue("image") && (
            <div style={{ marginTop: 10 }}>
              <img
                src={form.getFieldValue("image")}
                alt="Profile"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            </div>
          )}
        </Item>
        <Item
          name="profileVisibility"
          label="Profile Visibility"
          valuePropName="checked"
        >
          <Switch disabled={uploadUserLoading} />
        </Item>
      </Form>
    </Modal>
  );
};

export default UserProfileModal;
