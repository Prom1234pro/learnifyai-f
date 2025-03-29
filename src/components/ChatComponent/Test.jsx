// Inside ThoughtInput component
const handleSend = async () => {
    if (input.trim() || attachments.length > 0) {
      const formData = new FormData();
  
      // Append text input if it exists
      if (input.trim()) {
        formData.append("text", input);
      }
  
      // Append user ID if available
      if (userId) {
        formData.append("user_id", userId);
      }
  
      // Append attachments
      attachments.forEach((attachment, index) => {
        if (attachment.type === "image") {
          // Convert base64 image back to a file
          const byteString = atob(attachment.data.split(",")[1]);
          const mimeString = attachment.data.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          formData.append("file", blob, `image${index}.${mimeString.split("/")[1]}`);
          formData.append("file_type", "image");
        } else if (attachment.type === "doc") {
          formData.append("file", attachment.file, attachment.name);
          formData.append("file_type", "doc");
        }
      });
  
      try {
        // Send the data to the Flask backend
        const response = await fetch("http://your-flask-backend-url/upload", {
          method: "POST",
          body: formData,
        });
  
        const result = await response.json();
        if (response.ok) {
          console.log("Upload successful:", result);
          // Optionally pass the result to the parent via onSend
          onSend({ text: input, attachments, fileUri: result.file_uri });
        } else {
          console.error("Upload failed:", result.error);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
  
      // Clear the input and attachments
      setInput("");
      setAttachments([]);
    }
  };