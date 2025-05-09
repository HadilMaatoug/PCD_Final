const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const mysql = require('mysql2/promise');

// Database configuration remains the same
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database: 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Multer setup remains the same
const multer = require("multer");
const uploadDir = path.join(__dirname, '..', 'dataCV');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

exports.uploadMiddleware = upload.single("cv");

// Modified upload handler
exports.upload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);
  const condaPython = "C:\\Users\\MSI\\Desktop\\Langchain\\venv_conda\\python.exe";
  const scriptPath = path.join(__dirname, 'extraction.py');

  // Debug: Verify all paths exist
  try {
    [condaPython, scriptPath, filePath].forEach(p => {
      if (!fs.existsSync(p)) {
        console.error(`Path not found: ${p}`);
        throw new Error(`File not found: ${p}`);
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // Execute Python exactly as in your working manual command
  const python = spawn(condaPython, [scriptPath, filePath], {
    windowsHide: true,
    cwd: path.dirname(scriptPath), // Set working directory to script location
    env: {
      ...process.env, // Preserve existing environment variables
      PYTHONIOENCODING: 'utf-8' // Set encoding to UTF-8
    }
  });

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    console.log('Python stdout:', data.toString());
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error('Python stderr:', data.toString());
    errorOutput += data.toString();
  });

  python.on('close', async (code) => {
    console.log(`Python process exited with code ${code}`);
    
    if (code !== 0) {
      return res.status(500).json({ 
        error: "Python script failed",
        details: errorOutput || `Exit code ${code}`,
        output: output
      });
    }

    try {
      if (!output.trim()) {
        throw new Error("Python script returned empty output");
      }
      
      const result = JSON.parse(output);
      
      // Verify minimum required fields
      if (!result.name || !result.email) {
        throw new Error("Missing required fields in Python output");
      }

      // Database insertion
      const [dbRes] = await pool.query(`
        INSERT INTO candidates 
        (name, phone, email, address, education, experience, projects, awards, skills, filepath)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        result.name,
        result.phone ? result.phone[0] : null,
        result.email ? result.email[0] : null,
        result.address || null,
        result.EDUCATION || null,
        result.EXPERIENCE || null,
        result.PROJECTS || null,
        result.AWARDS || null,
        result.SKILLS || null,
        filePath,
      ]);

      return res.status(200).json({
        message: "CV uploaded and extracted successfully",
        candidateId: dbRes.insertId,
        extractedData: result,
      });

    } catch (parseErr) {
      console.error("Output processing failed:", {
        error: parseErr.message,
        rawOutput: output,
        pythonErrors: errorOutput
      });
      
      return res.status(500).json({
        error: "Failed to process extracted data",
        details: parseErr.message,
        pythonOutput: output,
        pythonErrors: errorOutput
      });
    }
  });
};

// getAll remains unchanged
exports.getAll = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM candidates");
    res.status(200).json({
      message: "Candidates fetched successfully",
      candidates: results,
    });
  } catch (err) {
    console.error("MySQL Error:", err);
    return res.status(500).json({ error: "Failed to fetch candidates" });
  }
};
