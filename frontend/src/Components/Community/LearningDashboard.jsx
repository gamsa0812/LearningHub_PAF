// LearningDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Tag,
  Empty,
  Spin,
  Statistic,
  Row,
  Col,
  Button,
  Modal
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningService from "../../Services/LearningService";
import MyLearning from "./MyLearning";
import CreateLearningModal from "../Modals/CreateLearningModal";
import LearningDetailsModal from "../Modals/LearningDetailsModal";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BookOutlined,
  ExperimentOutlined,
  TeamOutlined,
  PlusOutlined
} from "@ant-design/icons";

const { TabPane } = Tabs;

const LearningDashboard = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    onHold: 0,
    planned: 0,
    recent: 0,
    byTemplate: {}
  });

  const loadUserLearning = async () => {
    if (!snap.currentUser?.uid) return;
    try {
      setLoading(true);
      const userLearning = await LearningService.getLearningByUserId(
        snap.currentUser.uid
      );
      userLearning.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      state.learningEntries = userLearning;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const templateCounts = {};
      const completed = userLearning.filter(e => e.status === "Completed").length;
      const inProgress = userLearning.filter(e => e.status === "In Progress").length;
      const onHold = userLearning.filter(e => e.status === "On Hold").length;
      const planned = userLearning.filter(e => e.status === "Planned").length;
      const recent = userLearning.filter(e => new Date(e.timestamp) > oneWeekAgo).length;
      userLearning.forEach(e => {
        const template = e.template || "general";
        templateCounts[template] = (templateCounts[template] || 0) + 1;
      });
      setStats({
        total: userLearning.length,
        completed,
        inProgress,
        onHold,
        planned,
        recent,
        byTemplate: templateCounts
      });
    } catch (err) {
      console.error("Failed to fetch learning entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserLearning();
  }, [snap.currentUser?.uid]);

  const handleViewDetails = (learning) => {
    state.selectedLearning = learning;
    state.learningDetailsModalOpened = true;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Completed":
        return <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>;
      case "In Progress":
        return <Tag color="processing" icon={<ClockCircleOutlined />}>In Progress</Tag>;
      case "On Hold":
        return <Tag color="warning" icon={<PauseCircleOutlined />}>On Hold</Tag>;
      case "Planned":
        return <Tag color="default" icon={<CalendarOutlined />}>Planned</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getTemplateIcon = (template) => {
    switch (template) {
      case "project":
        return <ExperimentOutlined />;
      case "certification":
        return <TrophyOutlined />;
      case "challenge":
        return <ExperimentOutlined />;
      case "workshop":
        return <TeamOutlined />;
      default:
        return <BookOutlined />;
    }
  };

  const getTemplateLabel = (template) => {
    switch (template) {
      case "project":
        return "Project";
      case "certification":
        return "Certification";
      case "challenge":
        return "Challenge";
      case "workshop":
        return "Workshop";
      default:
        return "General";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const renderLearningCard = (learning) => (
    <Card
      key={learning.id}
      className="learning-card"
      title={
        <div className="learning-card-title">
          <span className="template-icon">{getTemplateIcon(learning.template)}</span>
          <span>{learning.topic}</span>
        </div>
      }
      extra={getStatusTag(learning.status)}
      onClick={() => handleViewDetails(learning)}
    >
      <div className="card-content">
        <p className="template-tag">{getTemplateLabel(learning.template)}</p>
        <p className="description">{learning.description}</p>
        <div className="card-footer">
          <span className="timestamp">{formatDate(learning.timestamp)}</span>
          <Button type="link" onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(learning);
          }}>
            Details
          </Button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="learning-dashboard">
      <div className="dashboard-header">
        <h2>Learning Dashboard</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            state.createLearningModalOpened = true;
          }}
        >
          Add Learning
        </Button>
      </div>

      <div className="stats-section">
        <Row gutter={16}>
          <Col span={4}>
            <Card>
              <Statistic title="Total Entries" value={stats.total} prefix={<BookOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="Completed" value={stats.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#3f8600" }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="In Progress" value={stats.inProgress} prefix={<ClockCircleOutlined />} valueStyle={{ color: "#1890ff" }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="On Hold" value={stats.onHold} prefix={<PauseCircleOutlined />} valueStyle={{ color: "#faad14" }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="Planned" value={stats.planned} prefix={<CalendarOutlined />} valueStyle={{ color: "#8c8c8c" }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="This Week" value={stats.recent} prefix={<CalendarOutlined />} valueStyle={{ color: "#722ed1" }} />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="learning-content">
        <Tabs defaultActiveKey="all" className="learning-tabs">
          <TabPane tab="All Learning" key="all">
            <div className="learning-grid">
              {snap.learningEntries?.length > 0 ? snap.learningEntries.map(renderLearningCard) : <Empty description="No learning entries found" />}
            </div>
          </TabPane>
          <TabPane tab="Recent" key="recent">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => new Date(entry.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length > 0 ? (
                snap.learningEntries.filter(entry => new Date(entry.timestamp) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).map(renderLearningCard)
              ) : (
                <Empty description="No recent learning entries" />
              )}
            </div>
          </TabPane>
          <TabPane tab="In Progress" key="inProgress">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.status === "In Progress").length > 0 ? (
                snap.learningEntries.filter(entry => entry.status === "In Progress").map(renderLearningCard)
              ) : (
                <Empty description="No in-progress entries found" />
              )}
            </div>
          </TabPane>
          <TabPane tab="On Hold" key="onHold">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.status === "On Hold").length > 0 ? (
                snap.learningEntries.filter(entry => entry.status === "On Hold").map(renderLearningCard)
              ) : (
                <Empty description="No on-hold entries found" />
              )}
            </div>
          </TabPane>
          <TabPane tab="Planned" key="planned">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.status === "Planned").length > 0 ? (
                snap.learningEntries.filter(entry => entry.status === "Planned").map(renderLearningCard)
              ) : (
                <Empty description="No planned entries found" />
              )}
            </div>
          </TabPane>
          <TabPane tab="Projects" key="projects">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.template === "project").length > 0 ? (
                snap.learningEntries.filter(entry => entry.template === "project").map(renderLearningCard)
              ) : (
                <Empty description="No project entries found" />
              )}
            </div>
          </TabPane>
          <TabPane tab="Certifications" key="certifications">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.template === "certification").length > 0 ? (
                snap.learningEntries.filter(entry => entry.template === "certification").map(renderLearningCard)
              ) : (
                <Empty description="No certification entries found" />
              )}
            </div>
          </TabPane>
          <TabPane tab="Challenges" key="challenges">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.template === "challenge").length > 0 ? (
                snap.learningEntries.filter(entry => entry.template === "challenge").map(renderLearningCard)
              ) : (
                <Empty description="No challenge entries found" />
              )}
            </div>
          </TabPane>
          <TabPane tab="Workshops" key="workshops">
            <div className="learning-grid">
              {snap.learningEntries?.filter(entry => entry.template === "workshop").length > 0 ? (
                snap.learningEntries.filter(entry => entry.template === "workshop").map(renderLearningCard)
              ) : (
                <Empty description="No workshop entries found" />
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      {/* Adding the modals and passing the refresh function */}
      <CreateLearningModal onRefresh={loadUserLearning} />
      <LearningDetailsModal onRefresh={loadUserLearning} />
    </div>
  );
};

export default LearningDashboard;