import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";

const Submit = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    type: "person",
    attempts: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === "company" && !formData.file) {
      alert("Please attach a PDF file.");
      return;
    }

    const fileData = new FormData();
    fileData.append("filename", formData.file.name);
    fileData.append("path", formData.file.path);
    fileData.append("size", formData.file.size);
    fileData.append("contentType", formData.file.type);

    try {
      const formResponse = await axios.post("/submit", {
        ...formData,
        fileId,
      });

      console.log("Form submitted:", formResponse.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formType">
          <Form.Label>Type</Form.Label>
          <Form.Control
            as="select"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="person">Person</option>
            <option value="company">Company</option>
          </Form.Control>
        </Form.Group>
        {formData.type === "person" && (
          <>
            <Form.Group controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formAttempts">
              <Form.Label>How many times did you attempt the exam?</Form.Label>
              <Form.Control
                type="number"
                name="attempts"
                value={formData.attempts}
                onChange={handleChange}
              />
            </Form.Group>
          </>
        )}
        {formData.type === "company" && (
          <>
            <Form.Group controlId="formCompanyName">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formCompanyEmail">
              <Form.Label>Company Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formFile">
              <Form.Label>Upload PDF</Form.Label>
              <Form.Control
                type="file"
                name="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </Form.Group>
            <a
              href="http://localhost:5000/file/sample.pdf"
              download="sample.pdf"
            >
              Download Sample PDF
            </a>
          </>
        )}
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default Submit;
