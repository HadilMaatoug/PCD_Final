

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Add this import

const Login = () => {
    const auth = useAuth();
    const navigate = useNavigate(); // Initialize the navigate function
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const matricule = formData.get("matricule");
        const password = formData.get("password");
        
        try {
            toast.loading("Signing In...", { id: "login" });
            await auth?.login(matricule, password);
            toast.success("Logged In Successfully!", { id: "login" });
            navigate("/"); // Redirect to home page after successful login
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.message || "Signing In Failed!", { id: "login" });
        }
    };
    return (
        <Box width={"100%"} height={"100%"} display={"flex"} flex={1}>
            <Box padding={8} mt={8} display={{ md: "flex", sm: "none", xs: "none" }}>
                <img src="aii-removebg-preview.png" alt="Robot" style={{ width: "600px" }} />
            </Box>
            <Box 
                display={"flex"} 
                flex={{ xs: 1, md: 0.5 }} 
                justifyContent={'center'} 
                alignItems={'center'} 
                padding={2} 
                ml={'auto'}
                mt={16}
            >
                <form 
                    onSubmit={handleSubmit}  // Connect form to handler
                    style={{
                        margin: "auto",
                        padding: "30px",
                        boxShadow: "10px 10px 20px #000",
                        borderRadius: "10px",
                        border: "none"
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: "column",
                        justifyContent: "center"
                    }}>
                        <Typography
                            variant="h4"
                            textAlign="center"
                            padding={2}
                            fontWeight={600}
                        >
                            Login
                        </Typography>
                        <CustomizedInput type="text" name="matricule" label="Matricule" />
                        <CustomizedInput type="password" name="password" label="Password" />
                        <Button 
                            type="submit" 
                            sx={{
                                px: 2,
                                py: 1,
                                mt: 2,
                                width: "400px",
                                borderRadius: 2,
                                bgcolor: "#00fffc",
                                ":hover": {
                                    bgcolor: "white", 
                                    color: "black"
                                }
                            }}
                        >
                            Login
                        </Button>
                    </Box>
                </form>  
            </Box>
        </Box>
    );
};

export default Login;