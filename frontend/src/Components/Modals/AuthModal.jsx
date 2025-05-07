import React, { useState } from "react";
import { Modal, Form, Input, Button, Upload, message } from "antd";
import { InboxOutlined, GoogleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import UploadFileService from "../../Services/UploadFileService";
import AuthService from "../../Services/AuthService";
import UserService from "../../Services/UserService";

const uploader = new UploadFileService();

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [signinFocused, setSigninFocused] = useState(true);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const toggleFocus = () => {
    setSigninFocused(!signinFocused);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true);
      if (signinFocused) {
        const response = await AuthService.login(
          values.username,
          values.password
        );
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("accessToken", response.accessToken);
        message.success("Welcome back");
        if (onSuccess) onSuccess();
        onClose();
        form.resetFields();
      } else {
        const exists = await UserService.checkIfUserExists(values.username);
        if (exists) {
          message.error("User already exists with this username");
          return;
        } else {
          const response = await AuthService.register(
            values.username,
            values.password
          );
          localStorage.setItem("userId", response.userId);
          localStorage.setItem("accessToken", response.accessToken);
        }

        let imageUrl = "";
        if (values.file) {
          imageUrl = await uploader.uploadFile(
            values.file[0].originFileObj,
            "userImages"
          );
        }

        const body = {
          userId: localStorage.getItem("userId"),
          image: imageUrl,
          email: values.email,
        };
        await UserService.createProfile(body);
        message.success("Welcome " + values.username);
        if (onSuccess) onSuccess();
        onClose();
        form.resetFields();
      }
    } catch (err) {
      message.error("Error: " + (err.message || "Unknown error occurred"));
    } finally {
      setIsLoading(false);
      form.resetFields();
      window.location.reload();
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = `http://localhost:8080/oauth2/authorization/google`;
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      footer={null}
      onCancel={onClose}
      className="rounded-2xl shadow-2xl"
      bodyStyle={{ padding: 0 }}
      width={500}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-br from-purple-900 to-purple-700 p-10 rounded-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-bold text-center text-white mb-8 font-sans">
            {signinFocused ? "Sign In" : "Create Account"}
          </h2>
        </motion.div>

        <Form
          name="authForm"
          form={form}
          initialValues={{ remember: true }}
          onFinish={handleFormSubmit}
          autoComplete="off"
          className="space-y-6"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                placeholder="Username"
                className="rounded-xl h-12 text-base bg-purple-800 text-white border-none focus:ring-2 focus:ring-purple-400 transition-all"
                prefix={<span className="text-purple-300"></span>}
              />
            </motion.div>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Input.Password
                placeholder="Password"
                className="rounded-xl h-12 text-base bg-purple-800 text-white border-none focus:ring-2 focus:ring-purple-400 transition-all"
              />
            </motion.div>
          </Form.Item>

          <AnimatePresence>
            {!signinFocused && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Form.Item
                  shouldUpdate={(prev, curr) => prev.password !== curr.password}
                >
                  {({ getFieldValue }) => {
                    const password = getFieldValue("password") || "";
                    const rules = [
                      { label: "At least 8 characters", valid: password.length >= 8 },
                      { label: "At least 1 uppercase letter", valid: /[A-Z]/.test(password) },
                      { label: "At least 1 lowercase letter", valid: /[a-z]/.test(password) },
                      { label: "At least 1 number", valid: /\d/.test(password) },
                      { label: "At least 1 special character", valid: /[!@#$%^&*]/.test(password) },
                    ];

                    return (
                      <ul className="space-y-2 mb-6 text-sm text-purple-200">
                        {rules.map((rule, idx) => (
                          <motion.li
                            key={idx}
                            className={rule.valid ? "text-purple-400" : "text-purple-300"}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            {rule.valid ? "✓" : "•"} {rule.label}
                          </motion.li>
                        ))}
                      </ul>
                    );
                  }}
                </Form.Item>

                <Form.Item
                  name="confirm"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Please confirm your password!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("The two passwords that you entered do not match!")
                        );
                      },
                    }),
                  ]}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Input.Password
                      placeholder="Confirm Password"
                      className="rounded-xl h-12 text-base bg-purple-800 text-white border-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </motion.div>
                </Form.Item>

                <Form.Item
                  name="file"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Upload.Dragger
                      beforeUpload={() => false}
                      multiple={false}
                      className="bg-purple-800 rounded-xl border border-purple-600"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined className="text-purple-400 text-4xl" />
                      </p>
                      <p className="ant-upload-text text-purple-200 text-base">
                        Click or drag to upload profile image
                      </p>
                    </Upload.Dragger>
                  </motion.div>
                </Form.Item>
              </motion.div>
            )}
          </AnimatePresence>

          <Form.Item>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                loading={isLoading}
                type="primary"
                htmlType="submit"
                block
                className="h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-lg font-semibold shadow-md shadow-purple-500/50 transition-all"
              >
                {signinFocused ? "Sign In" : "Sign Up"}
              </Button>
            </motion.div>
          </Form.Item>

          <Form.Item>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                icon={<GoogleOutlined />}
                onClick={handleOAuthLogin}
                block
                className="h-12 bg-purple-800 text-white border border-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold transition-all"
              >
                Continue with Google
              </Button>
            </motion.div>
          </Form.Item>

          <Form.Item>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                type="link"
                onClick={toggleFocus}
                block
                className="text-purple-300 hover:text-purple-200 text-base font-medium"
              >
                {signinFocused
                  ? "Need an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </motion.div>
    </Modal>
  );
};

export default AuthModal;