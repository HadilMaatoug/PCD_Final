import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:4000/api/v1"
});

// Add request interceptor for auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (matricule, password) => {
  try {
    const res = await api.post("/user/login", { matricule, password });
    
    if (res.status !== 200) {
      throw new Error(res.data.message || "Unable to login");
    }
    
    return {
      token: res.data.token,
      user: res.data.user
    };
    
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || "Login failed");
    } else if (error.request) {
      // Request was made but no response
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Request setup error
      throw new Error("Login request failed: " + error.message);
    }
  }
};
////////////////////////////////////////sigup
export const signupUser = async (matricule, raisonS, email, password) => {
    try {
        const res = await api.post("/user/signup", { matricule, raisonS, email, password });
        
        // Change from 200 to 201 for signup
        if (res.status !== 201) {
            throw new Error(res.data.message || "Signup failed");
        }
        
        return {
            token: res.data.token,
            user: res.data.user
        };
        
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "Signup failed");
        } else if (error.request) {
            throw new Error("No response from server. Please check your connection.");
        } else {
            throw new Error("Signup request failed: " + error.message);
        }
    }
};




// Add other API calls here (signup, logout, etc.)
export const verifyToken = async () => {
  try {
    const res = await api.get("/user");
    return res.data;
  } catch (error) {
    throw error;
  }
};


//--------------------------HOME PART----------------
// Add to your existing api_communicator.jsx

// CV Upload Function
export const uploadCV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('cv', file);

    const res = await api.post('/cand/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.status !== 200) {
      throw new Error(res.data.message || "CV upload failed");
    }

    return res.data;

  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 
                     error.response.data.message || 
                     "CV upload failed");
    } else if (error.request) {
      throw new Error("No response from server. Please check your connection.");
    } else {
      throw new Error("CV upload request failed: " + error.message);
    }
  }
};

// Get All Candidates (for HR view)
export const getAllCandidates = async () => {
  try {
    const res = await api.get('/cand/getAll');
    return res.data.candidates;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || "Failed to fetch candidates");
    }
    throw error;
  }
};