import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Logo from "./shared/Logo";
import { useAuth } from "../context/AuthContext";
import NavigationLink from "./shared/NavigationLink"; 

const Header = () => {
  const auth = useAuth();

  return (
    <AppBar sx={{ bgcolor: "transparent", position: "static", boxShadow: "none" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Logo />
        <div>
          {auth?.isLoggedIn ? (
            <>
              <NavigationLink 
                to="/chat" 
                bg="#00fffc" 
                text="Go to chat" 
                textColor="black"
              />
              <NavigationLink 
                to="/" 
                bg="#51538f"  // Fixed color code (was missing the last character)
                text="Logout" 
                textColor="white"
                onClick={auth.logout}
              />
            </>
          ) : (
            <>
              <NavigationLink 
                to="/login" 
                bg="#00fffc" 
                text="Login"  // Fixed capitalization
                textColor="black"
              />
              <NavigationLink 
                to="/signup" 
                bg="#51538f"  // Fixed color code
                text="Signup"  // Fixed capitalization
                textColor="white"
              />
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;