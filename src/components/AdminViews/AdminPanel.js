import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// AdminPanel component is a dashboard for the admin user. It contains three cards that link to different admin views.
const AdminPanel = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Manage Events",
      description: "Create, update, and delete course events",
      link: "/events",
      icon: "📅",
    },
    {
      title: "View Submissions",
      description: "View and manage user submissions",
      link: "/records",
      icon: "📝",
    },
    {
      title: "Create Event",
      description: "Create a new course event",
      link: "/events/create",
      icon: "➕",
    },
  ];

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">Admin Dashboard</h1>
      <Row>
        {cards.map((card, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="display-4 mb-3">{card.icon}</div>
                <Card.Title>{card.title}</Card.Title>
                <Card.Text>{card.description}</Card.Text>
                <Button variant="primary" onClick={() => navigate(card.link)}>
                  Access
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminPanel;
