import React from 'react';
// necessary inputs
// Provides linking to other app routes.
import { Link } from 'react-router-dom';
import { useEffect } from "react";
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import { Buffer } from "buffer";
//import { Buffer } from "buffer";

const FileItem = (props) => {

    useEffect(() => {
        // debug - log files to console whenever props mount
        // or update
        console.log("File:", props.myFile);
    }, [props.myFile]);

    // return file information for fileItem
    return (
        /* Bootstrap columns for browse page layout */
        <Col xs={12} sm={6} md={6} className="mb-4 px-4">
            <Card className={`h-100 p-3`}>
                <Card.Header style={
                    {
                        backgroundColor: "#f8f9fa",
                        textAlign: "center",
                        fontSize: "1.5em",
                    }
                }>{props.myFile.name}</Card.Header>
                <Card.Body>
                    Body
                </Card.Body>
                <Card.Footer>
                    <div className="d-flex justify-content-between">
                        <Link to={"/submit/" + props.myFile._id}>
                            <Button variant="primary">View</Button>
                        </Link>
                    </div>
                </Card.Footer>
            </Card>
        </Col>

    );
}

export default FileItem;