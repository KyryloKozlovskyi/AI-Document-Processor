// necessary inputs
import React from "react";
import FileItem from "./FileItem";
import Row from "react-bootstrap/Row";


// File holds list of File objects
const File = (props) => {

    // Maps the tasks to TaskItem components
  return (
    <div className="container mt-5">
      <Row className="g-6">
        {props.myFile.map((files) => (
          <FileItem 
            myFile={files} 
            key={files._id}
            Reload={props.ReloadData}   
          />
        ))}
      </Row>
    </div>
  );
}

export default File;