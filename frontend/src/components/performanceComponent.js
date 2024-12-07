import React, { useState, useEffect } from "react";
import styled from "styled-components";

const PerformanceReport = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [userStatusData, setUserStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPerformanceData = async () => {
    try {
      const performanceResponse = await fetch("http://localhost:3000/performace/system");
      const userStatusResponse = await fetch("http://localhost:3000/performace/user-status-report");

      if (!performanceResponse.ok || !userStatusResponse.ok) {
        throw new Error(`HTTP error! Status: ${performanceResponse.status}`);
      }

      const performanceData = await performanceResponse.json();
      const userStatusData = await userStatusResponse.json();

      if (!performanceData.data || !userStatusData.report) {
        throw new Error("Invalid response format");
      }

      setPerformanceData(performanceData.data);
      setUserStatusData(userStatusData.report);
      setLoading(false);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handleCardClick = (status) => {
    setSelectedStatus(status);
  };

  const handleCloseModal = () => {
    setSelectedStatus(null);
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate a refresh delay
    setRefreshing(false);
    await fetchPerformanceData(); // Re-fetch data after refresh
  };

  if (loading) {
    return <LoadingMessage>Loading Performance Data...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <PerformanceReportContainer>
      <GradientOverlay />
      <PerformanceHeading>Performance Dashboard</PerformanceHeading>

      {/* System Performance Section */}
      <ReportSection>
        <ReportTitle>System Performance</ReportTitle>
        <PerformanceCards>
          {performanceData && Object.entries(performanceData).map(([key, value]) => (
            <Card key={key} $variant="performance">
              <CardHeader>{key.replace(/_/g, ' ')}</CardHeader>
              <CardBody>{value}</CardBody>
            </Card>
          ))}
        </PerformanceCards>
      </ReportSection>

      {/* User Status Section */}
      <ReportSection>
        <ReportTitle>User Status Overview</ReportTitle>
        <UserStatusCards>
          {userStatusData && Object.entries(userStatusData).map(([status, { total, usernames }]) => (
            <Card key={status} onClick={() => handleCardClick(status)} $variant="status">
              <CardHeader>{status}</CardHeader>
              <CardBody>
                <div><strong>Total Users:</strong> {total}</div>
              </CardBody>
            </Card>
          ))}
        </UserStatusCards>
      </ReportSection>

      {/* Reload Data Button */}
      <ActionButtonContainer>
        <ActionButton onClick={handleRefreshData}>
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </ActionButton>
      </ActionButtonContainer>

      {/* Modal to show detailed user list */}
      {selectedStatus && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>{selectedStatus} Users</h3>
              <CloseButton onClick={handleCloseModal}>
                <CloseIcon>✕</CloseIcon>
              </CloseButton>
            </ModalHeader>
            <UserList>
              {userStatusData[selectedStatus].usernames.map((username, index) => (
                <UserCard key={index}>
                  <UserAvatar>{username[0].toUpperCase()}</UserAvatar>
                  <UserName>{username}</UserName>
                </UserCard>
              ))}
            </UserList>
          </ModalContent>
        </ModalOverlay>
      )}
    </PerformanceReportContainer>
  );
};

export default PerformanceReport;

// Styled Components with Enhanced Aesthetics
const GradientOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(31, 38, 49, 0.9) 0%, rgba(26, 32, 44, 0.95) 100%);
  pointer-events: none;
  z-index: -1;
`;

const PerformanceReportContainer = styled.div`
  position: relative;
  background: #121721;
  color: #e2e8f0;
  min-height: 100vh;
  padding: 40px 20px;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-x: hidden;
`;

const PerformanceHeading = styled.h1`
  text-align: center;
  font-size: 48px;
  color: #ff4757;
  text-transform: uppercase;
  font-weight: 800;
  margin-bottom: 50px;
  letter-spacing: 2px;
  text-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
`;

const ReportTitle = styled.h2`
  text-align: center;
  font-size: 30px;
  color: #cbd5e0;
  margin-bottom: 30px;
  font-weight: 700;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, transparent, #ff4757, transparent);
  }
`;

const ReportSection = styled.div`
  margin-bottom: 60px;
`;

const PerformanceCards = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
`;

const UserStatusCards = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
`;

const Card = styled.div`
  background-color: ${props => props.$variant === 'performance' 
    ? 'rgba(44, 62, 80, 0.7)' 
    : 'rgba(52, 73, 94, 0.7)'};
  border-radius: 15px;
  padding: 30px;
  width: 280px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.4s ease;
  text-align: center;
  cursor: pointer; // Changed from conditional cursor
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: scale(1.05); // Apply scale to both performance and status cards
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background-color: ${props => props.$variant === 'performance' 
      ? 'rgba(44, 62, 80, 0.8)' 
      : 'rgba(52, 73, 94, 0.8)'};
  }
`;

const CardHeader = styled.div`
  font-size: 22px;
  color: #ff4757;
  margin-bottom: 15px;
  font-weight: 700;
  text-transform: uppercase;
`;

const CardBody = styled.div`
  font-size: 18px;
  color: #a0aec0;
  line-height: 1.5;
`;

const ActionButtonContainer = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const ActionButton = styled.button`
  background-color: #ff4757;
  color: white;
  padding: 15px 40px;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(255, 71, 87, 0.3);

  &:hover {
    background-color: #ff5f6d;
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(255, 71, 87, 0.4);
  }

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 5px 10px rgba(255, 71, 87, 0.2);
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #ff4757;
  font-size: 24px;
  background: #121721;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff4757;
  font-size: 24px;
  background: #121721;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: #2f3640;
  color: #e2e8f0;
  padding: 40px;
  border-radius: 15px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;

  &:hover {
    color: #ff4757;
  }
`;

const CloseIcon = styled.span`
  font-size: 24px;
`;

const UserList = styled.div`
  margin-top: 30px;
`;

const UserCard = styled.div`
  background: #34495e;
  border-radius: 10px;
  padding: 20px;
  margin: 10px;
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  background: #ff4757;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  margin-right: 20px;
`;

const UserName = styled.div`
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
`;
