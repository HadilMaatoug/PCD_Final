import React from "react";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";

const Logo = () => {
  return (
    <div style={{ display: "flex", marginRight: "auto", alignItems: "center", gap: "15px" }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <img
          src="chatbot_3.png"
          alt="HR AI Assistant"
          width="30px"
          height="30px"
          className="image-inverted"
        />

      </Link>
      <Typography
          sx={{
            display: { md: "block", sm: "block", xs: "block" }, // ensure it's not hidden on small screens
            ml: 1,
            fontWeight: 800,
            textShadow: "2px 2px 20px #000",
            color: "white", // make sure it's visible against background
          }}
        >
          <span style={{ fontSize: "20px" }}>HR</span>Assistant
        </Typography>
    </div>
  );
};

export default Logo;
