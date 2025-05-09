import React, { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import TypingAnim from "../components/typer/TypingAnim";
import { uploadCV } from "../helpers/api-communicator";
import { toast } from "react-hot-toast";

const Home = () => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes('pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      toast.loading("Processing your CV...", { id: "cv-upload" });

      const response = await uploadCV(file);
      
      toast.success("CV processed successfully!", { id: "cv-upload" });
      console.log("Extracted data:", response.extractedData);
      
      // Here you can redirect or show the results
      // navigate('/dashboard', { state: { cvData: response.extractedData } });

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to process CV", { id: "cv-upload" });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={4}
      p={4}
    >
      {/* Typing Title */}
      <Box>
        <TypingAnim />
      </Box>

      {/* Upload Button + Hidden File Input */}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleButtonClick}
        sx={{
          fontSize: "1.5rem",
          padding: "1rem 2rem",
          borderRadius: "50px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
          textTransform: "none",
        }}
      >
        Upload Your CV
      </Button>

      {/* Description Box */}
      <Box
        width="50%"
        borderRadius="20px"
        boxShadow="0 8px 40px rgba(0, 0, 0, 0.2)"
        bgcolor="#f9f9f9"
        p={4}
        mt={2}
        textAlign="center"
      >
       <Typography variant="h6" color="darkblue">
  Searching for a job? Been unemployed for a while? Or simply looking to switch to something better? You're in the right place.  
  <br /><br />
  Just upload your CV and let us do the rest. Our system analyzes your profile using conversational AI, matches it with job descriptions provided by our HR partners, and ranks you using an intelligent recommendation system.  
  <br /><br />
  The result? HR teams receive the top 3 most suitable candidates — and you might just be one of them.
</Typography>

<Typography variant="h6" color="#4c739c" mt={4}>
  And for our fellow HR professionals — we’re here to make your job easier.  
  <br /><br />
  No more reading through piles of CVs or struggling to decide who to call.  
  Our smart assistant helps you generate clear, tailored job descriptions and matches them with the most relevant candidates.  
  <br /><br />
  In just a few clicks, you’ll get the top 3 best-fit profiles for each role — saving time, reducing guesswork, and finding the perfect match faster.
</Typography>

      </Box>
    </Box>
  );
};

export default Home;
