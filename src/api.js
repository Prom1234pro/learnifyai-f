const makeRequest = async (url, options = {}) => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    try {
      const response = await fetch(url, { ...options, signal });
  
      if (!response.ok) throw new Error("Network response was not ok");
  
      const data = await response.json();
      return { data, abort: () => controller.abort() };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request aborted");
      } else {
        throw new Error("Unknown error occured");
      }
    }
  };


  const upload = async (formData, updateProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // setXhrInstance(xhr); // Save instance to allow cancellation
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          updateProgress(percentComplete); // Update the progress for this file
        }
      };
  
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };
  
      xhr.onerror = () => reject(new Error("Upload failed due to network error"));
  
      xhr.open("POST", "http://localhost:5000/upload", true);
      xhr.send(formData);
    });
  };


export { makeRequest, upload }