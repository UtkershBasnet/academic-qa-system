const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai")
// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
  
}
// Middleware
app.use(cors())
app.use(bodyParser.json())

// Initialize database
const db = new sqlite3.Database("./questions.db", (err) => {
  if (err) {
    console.error("Error opening database", err)
  } else {
    console.log("Connected to the SQLite database")
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      steps TEXT,
      hints TEXT,
      conclusion TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
  }
})

// Initialize Google Generative AI
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in the environment variables. Please check your .env file.');
}
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)

// Get Gemini model
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
}

// API Routes
app.post("/api/answer", async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: "Question is required" })
    }

    // Format the prompt for step-by-step answer
    const prompt = `Generate a detailed step-by-step answer to this academic question. 
    Format your answer with clear numbered steps and a conclusion.
    
    Question: ${question}
    
    Step-by-step answer:`

    // Call Gemini API for answer generation
    const model = getGeminiModel()
    const result = await model.generateContent(prompt)
    const generatedText = result.response.text()

    // Process the generated text into steps
    const steps = processIntoSteps(generatedText)
    const conclusion = extractConclusion(generatedText)

    // Store in database
    const stmt = db.prepare(
      'INSERT INTO questions (question, answer, steps, conclusion, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
    )

    stmt.run(question, generatedText, JSON.stringify(steps), conclusion, (err) => {
      if (err) {
        console.error("Error saving to database:", err)
      }
    })
    stmt.finalize()

    // Return the processed answer
    res.json({
      id: this ? this.lastID : null,
      question,
      answer: generatedText,
      steps,
      conclusion,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating answer:", error)
    res.status(500).json({ error: "Failed to generate answer" })
  }
})

app.post("/api/hints", async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: "Question is required" })
    }

    // Format the prompt for hints
    const prompt = `Generate 3 helpful hints for solving this academic question without giving away the full answer. 
    Format your response as a numbered list of hints.
    
    Question: ${question}
    
    Hints:`

    // Call Gemini API for hint generation
    const model = getGeminiModel()
    const result = await model.generateContent(prompt)
    const generatedText = result.response.text()

    // Process the generated text into hints
    const hints = processIntoHints(generatedText)

    // Update the database with hints
    db.get(
      "SELECT id FROM questions WHERE question = ? ORDER BY id DESC LIMIT 1",
      [question],
      (err, row) => {
        if (err) {
          console.error("Error finding question for update:", err)
          return
        }
        if (row) {
          db.run(
            "UPDATE questions SET hints = ? WHERE id = ?",
            [JSON.stringify(hints), row.id],
            (err) => {
              if (err) {
                console.error("Error updating hints in database:", err)
              }
            }
          )
        }
      }
    )

    // Return the hints
    res.json({ hints })
  } catch (error) {
    console.error("Error generating hints:", error)
    res.status(500).json({ error: "Failed to generate hints" })
  }
})

app.get("/api/history", (req, res) => {
  db.all("SELECT * FROM questions ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching history:", err)
      return res.status(500).json({ error: "Failed to fetch history" })
    }

    // Parse JSON strings in the results
    const formattedRows = rows.map((row) => ({
      ...row,
      steps: JSON.parse(row.steps || "[]"),
      hints: row.hints ? JSON.parse(row.hints) : [],
    }))

    res.json(formattedRows)
  })
})

app.delete("/api/history/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM questions WHERE id = ?", [id], function(err) {
    if (err) {
      console.error("Error deleting history item:", err);
      return res.status(500).json({ error: "Failed to delete history item" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "History item not found" });
    }
    res.status(200).json({ message: "History item deleted successfully" });
  });
});

// Helper functions
function processIntoSteps(text) {
  // Simple processing - split by numbers or line breaks
  const stepRegex = /(?:\d+\.\s*|\n\s*-\s*|\n\s*•\s*|\n\s*Step\s*\d+:\s*)/i
  let steps = text.split(stepRegex).filter((step) => step.trim().length > 0)

  // If no clear steps were found, try to split by sentences
  if (steps.length <= 1) {
    steps = text.split(/(?<=\.)\s+/).filter((step) => step.trim().length > 0)
  }

  // If still no clear steps, just return the whole text as one step
  if (steps.length === 0) {
    steps = [text]
  }

  return steps
}

function extractConclusion(text) {
  // Try to find a conclusion section
  const conclusionMatch = text.match(/(?:conclusion|in summary|therefore|thus|in conclusion).*$/i)
  return conclusionMatch ? conclusionMatch[0] : ""
}

function processIntoHints(text) {
  // Split by numbers, bullet points, or line breaks
  const hintRegex = /(?:\d+\.\s*|\n\s*-\s*|\n\s*•\s*)/
  let hints = text.split(hintRegex).filter((hint) => hint.trim().length > 0)

  // If no clear hints were found, try to split by sentences
  if (hints.length <= 1) {
    hints = text.split(/(?<=\.)\s+/).filter((hint) => hint.trim().length > 0)
  }

  // Limit to 3 hints
  return hints.slice(0, 3)
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
