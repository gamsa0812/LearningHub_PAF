import React, { useState } from "react";
import { Modal, Form, Input, Button, Upload, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import { UploadOutlined } from "@ant-design/icons";
import PostService from "../../Services/PostService";
import { motion, AnimatePresence } from "framer-motion";

const uploader = new UploadFileService();

const CreatePostModal = () => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileType, setFileType] = useState("image");
  const [image, setImage] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const body = {
        ...values,
        mediaLink: image,
        userId: snap.currentUser?.uid,
        mediaType: fileType,
      };

      const tempId = `temp-${Date.now()}`;
      const tempPost = {
        ...body,
        id: tempId,
        createdAt: new Date().toISOString(),
      };

      state.posts = [tempPost, ...state.posts];

      const newPost = await PostService.createPost(body);

      state.posts = state.posts.map((post) =>
        post.id === tempId ? newPost : post
      );

      message.success("Post created successfully");
      form.resetFields();
      setImage("");
      setFileType("image");
      state.createPostModalOpened = false;
    } catch (error) {
      state.posts = state.posts.filter((post) => !post.id.startsWith("temp-"));
      console.error("Failed to create post:", error);
      message.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      setImageUploading(true);
      const fileType = info.file.type.split("/")[0];
      setFileType(fileType);
      const url = await uploader.uploadFile(
        info.fileList[0].originFileObj,
        "posts"
      );
      setImage(url);
      setImageUploading(false);
    }
  };

  return (
    <Modal
      open={snap.createPostModalOpened}
      onCancel={() => {
        form.resetFields();
        setImage("");
        setFileType("image");
        state.createPostModalOpened = false;
      }}
      footer={null}
      className="rounded-2xl shadow-2xl"
      bodyStyle={{ padding: "20px", background: "linear-gradient(to bottom right, #f5f3ff, #ede9fe)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Create Post</h2>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-4">
          <Form.Item
            name="contentDescription"
            label="Content Description"
            rules={[
              { required: true, message: "Please enter content description" },
            ]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Input.TextArea
                className="rounded-lg bg-purple-50 border-purple-200 focus:ring-purple-400"
                rows={4}
                placeholder="What's on your mind?"
              />
            </motion.div>
          </Form.Item>

          {imageUploading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-purple-600"
            >
              Media is uploading, please wait...
            </motion.p>
          )}

          {!imageUploading && (
            <Form.Item
              name="mediaLink"
              label="Media Link"
              rules={[{ required: true, message: "Please enter media link" }]}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Upload
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  showUploadList={false}
                  beforeUpload={() => false}
                  className="mb-4"
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Upload Media
                  </Button>
                </Upload>
              </motion.div>
            </Form.Item>
          )}

          <AnimatePresence>
            {fileType === "image" && image && (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                src={image}
                alt="preview"
                className="w-full max-h-[400px] object-contain mb-4 rounded-lg shadow-md"
              />
            )}

            {fileType === "video" && image && (
              <motion.video
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                controls
                src={image}
                className="w-full max-h-[400px] rounded-lg shadow-md"
              />
            )}
          </AnimatePresence>

          {!imageUploading && (
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
                  Create Post
                </Button>
              </motion.div>
            </Form.Item>
          )}
        </Form>
      </motion.div>
    </Modal>
  );
};

export default CreatePostModal;