import React, { useState, useEffect } from "react";
import UserService from "../../Services/UserService";
import LikeService from "../../Services/LikeService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import CommentService from "../../Services/CommentService";
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined
} from "@ant-design/icons";
import {
  Button,
  Modal,
  List,
  Row,
  Input,
  Col,
  Avatar,
  Dropdown,
  Menu,
  message,
  Divider,
  Tooltip,
  Badge
} from "antd";
import PostService from "../../Services/PostService";
import CommentCard from "./CommentCard";
// import "./FriendsPost.css"; // Make sure to create this CSS file

const FriendsPost = ({ post }) => {
  const snap = useSnapshot(state);
  const [userData, setUserData] = useState();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentAdding, setCommentAdding] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [updatingCommentText, setUpdatingCommentText] = useState();
  const [updatingCommentId, setUpdatingCommentId] = useState();
  const [commentUploading, setCommentUploading] = useState(false);
  const [commentDeleting, setCommentDeleting] = useState(false);
  const [editFocues, setEditFocused] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const userLiked = likes.some((like) => like.userId === snap.currentUser?.uid);
    setIsLiked(userLiked);
  }, [likes, snap.currentUser]);

  // All your existing functions and useEffects...
  const updatePost = () => {
    state.selectedPost = post;
    state.updatePostModalOpened = true;
  };

  // Add this check near the top of the component
useEffect(() => {
  if (!post.id) {
    console.warn("Post without ID detected:", post);
  }
}, [post]);

  const menu = (
    <Menu>
      <Menu.Item onClick={updatePost} key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          deletePost();
        }}
        key="delete"
        icon={<DeleteOutlined />}
        danger
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const deletePost = async () => {
    try {
      await PostService.deletePost(post.id);
      state.posts = await PostService.getPosts();
      message.success("Post deleted successfully");
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const updateComment = async (id) => {
    try {
      setCommentUploading(true);
      await CommentService.updateComment(id, {
        commentText: updatingCommentText,
      });
      await getCommentsRelatedToPost();
      setUpdatingCommentText("");
      setEditFocused(false);
    } catch (error) {
      message.error("Failed to update comment");
    } finally {
      setCommentUploading(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      setCommentDeleting(true);
      await CommentService.deleteComment(id);
      await getCommentsRelatedToPost();
      message.success("Comment deleted");
    } catch (error) {
      message.error("Failed to delete comment");
    } finally {
      setCommentDeleting(false);
    }
  };

  useEffect(() => {
    UserService.getProfileById(post.userId)
      .then((value) => {
        setUserData(value);
      })
      .catch((err) => {
        console.log(`error getting user data ${err}`);
      });
    getLikesRelatedToPost();
    getCommentsRelatedToPost();
  }, [post]);

  const getLikesRelatedToPost = async () => {
    try {
      const result = await LikeService.getLikesByPostId(post.id);
      setLikes(result);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const getCommentsRelatedToPost = async () => {
    try {
      const result = await CommentService.getCommentsByPostId(post.id);
      setComments(result);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    try {
      await LikeService.createLike(
        {
          postId: post.id,
          userId: snap.currentUser?.uid,
        },
        snap.currentUser?.username,
        post.userId
      );
      // Refresh likes after successful like
      getLikesRelatedToPost();
    } catch (error) {
      message.error("Error liking post");
    }
  };

  const handleUnlike = async () => {
    try {
      // Find the like associated with the current user and remove it
      const likeToRemove = likes.find(
        (like) => like.userId === snap.currentUser?.uid
      );
      if (likeToRemove) {
        await LikeService.deleteLike(likeToRemove.id);
        // Refresh likes after successful unlike
        getLikesRelatedToPost();
      }
    } catch (error) {
      message.error("Error unliking post");
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

  const createComment = async () => {
    if (comment) {
      try {
        setCommentAdding(true);
        const body = {
          postId: post.id,
          userId: snap.currentUser?.uid,
          commentText: comment,
        };
        await CommentService.createComment(
          body,
          snap.currentUser?.username,
          snap.currentUser?.uid
        );
        setComment("");
        await getCommentsRelatedToPost();
      } catch (error) {
        message.error("Failed to add comment");
      } finally {
        setCommentAdding(false);
      }
    }
  };

  return (
    <div className="">
      <div className="post-header">
        <div className="user-info">
          <Avatar
            src={userData?.image}
            size={48}
            className="user-avatar"
            onClick={() => {
              if (userData?.profileVisibility) {
                state.selectedUserProfile = userData;
                state.friendProfileModalOpened = true;
              } else {
                message.info("Profile is locked");
              }
            }}
          />
          <div className="user-details">
            <h3 className="username">{userData?.username}</h3>
            <span className="post-time">Posted recently</span>
          </div>
        </div>
        {post.userId === snap.currentUser?.uid && (
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} className="more-options" />
          </Dropdown>
        )}
      </div>

      {post.contentDescription && (
        <div className="post-content">
          <p>{post.contentDescription}</p>
        </div>
      )}

      {post.mediaType === "image" && (
        <div className="post-media">
          <img src={post?.mediaLink} alt="Post content" />
        </div>
      )}

      {post.mediaType === "video" && (
        <div className="post-media">
          <video controls src={post?.mediaLink} />
        </div>
      )}

      <div className="post-stats">
        <div className="likes-count">
          <Badge count={likes.length} showZero color="#1890ff" offset={[10, 0]}>
            <LikeOutlined style={{ fontSize: '16px' }} />
          </Badge>
        </div>
        <div 
          className="comments-count cursor-pointer" 
          onClick={() => setShowCommentModal(true)}
        >
          <Badge count={comments.length} showZero color="#52c41a" offset={[10, 0]}>
            <CommentOutlined style={{ fontSize: '16px' }} />
          </Badge>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div className="post-actions">
        <div className="action-buttons">
          <button 
            className={`interaction-button ${isLiked ? 'liked' : ''}`}
            onClick={toggleLike}
          >
            {isLiked ? <LikeFilled /> : <LikeOutlined />}
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button 
            className="interaction-button"
            onClick={() => setShowCommentModal(true)}
          >
            <CommentOutlined />
            <span>Comment</span>
          </button>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div className="comment-input">
        <Avatar src={snap.currentUser?.image} size={36} />
        <Input
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onPressEnter={createComment}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={createComment}
          disabled={!comment}
          loading={commentAdding}
        />
      </div>

      <Modal
        title="Comments"
        open={showCommentModal}
        footer={null}
        onCancel={() => {
          setShowCommentModal(false);
          setEditFocused(false);
        }}
        className="comments-modal"
      >
        <List
          className="comments-list"
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(comment) => {
            if (comment.userId !== snap.currentUser.uid) {
              return <CommentCard comment={comment} key={comment.id} />;
            }
            return (
              <Row className="comment-item" key={comment.id}>
                <Col span={19}>
                  {editFocues && selectedCommentId === comment.id ? (
                    <Input
                      defaultValue={comment.commentText}
                      onChange={(e) => {
                        setUpdatingCommentId(comment.id);
                        setUpdatingCommentText(e.target.value);
                      }}
                      autoFocus
                    />
                  ) : (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={snap.currentUser?.image} />}
                        title={snap.currentUser?.username}
                        description={comment.commentText}
                      />
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={() => {
                          setSelectedCommentId(comment.id);
                          setEditFocused(true);
                        }}
                      />
                    </List.Item>
                  )}
                </Col>
                {editFocues && selectedCommentId === comment.id && (
                  <Col span={5} style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <Tooltip title="Save">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => updateComment(comment.id)}
                        loading={commentUploading}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteComment(comment.id)}
                        loading={commentDeleting}
                      />
                    </Tooltip>
                  </Col>
                )}
              </Row>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default FriendsPost;