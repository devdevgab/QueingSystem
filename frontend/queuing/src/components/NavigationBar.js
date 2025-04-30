// src/components/NavigationBar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          My App
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate("/")}>Home</Button>
          {/* <Button color="inherit" onClick={() => navigate("/about")}>About</Button>
          <Button color="inherit" onClick={() => navigate("/contact")}>Contact</Button> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
