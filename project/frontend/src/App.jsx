// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import Header from "./components/Header"
import {Routes, Route} from 'react-router-dom'
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Chat from "./pages/chat"
import { useAuth } from "./context/AuthContext"


function App() {

console.log(useAuth()?.isLoggedIn);
  return (
   <main>
    <Header />
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/chat" element={<Chat />} />


    
   



      
    </Routes>
   </main>
  )
}

export default App
