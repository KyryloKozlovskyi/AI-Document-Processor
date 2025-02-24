// necessary imports
import Files from "./Files";
import { useEffect, useState } from "react";
import axios from "axios";

const FilesMenu = () => {

  // store books as JSON
  const [files, setFiles] = useState([]); // initialise books to null array

  // useEffect to load books from database
  useEffect(() => {
    Reload();
  }, []);

  // axios get request to get books from database
  function Reload() {
    console.log("Reloading files");
    axios.get('http://localhost:5000/files')
      .then((response) => {
        // log response
        console.log(response.data.files);
        setFiles(response.data.files);
      })
      .catch((error) => {
        console.log("Error loading files: ", error);
      });
  };

  return (
    // return event list
    <div>
      {/* display files */}
      <Files myFiles={files} ReloadData={Reload} />
    </div>
  );
}

export default FilesMenu;