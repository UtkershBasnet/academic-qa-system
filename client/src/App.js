"use client"

import { useState, useEffect } from "react"
import "./App.css"
import QuestionForm from "./components/QuestionForm"
import AnswerDisplay from "./components/AnswerDisplay"
import LoadingSpinner from "./components/LoadingSpinner"
import HistoryList from "./components/HistoryList"

function App() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState(null)
  const [hints, setHints] = useState([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("ask")
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    // Fetch question history on component mount
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/history")
      const data = await response.json()
      setHistory(data)
    } catch (err) {
      console.error("Failed to fetch history:", err)
    }
  }

  const deleteHistory = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/history/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete history item");
      }
    } catch (err) {
      console.error("Error deleting history item:", err);
    }
  };

  const handleSubmit = async (questionText) => {
    setQuestion(questionText)
    setLoading(true)
    setError(null)
    setAnswer(null)
    setHints([])
    setShowAnswer(false)

    try {
      // First get hints
      const hintsResponse = await fetch("http://localhost:5000/api/hints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionText }),
      })

      if (!hintsResponse.ok) {
        throw new Error("Failed to generate hints")
      }

      const hintsData = await hintsResponse.json()
      setHints(hintsData.hints)

      // Then get full answer
      const answerResponse = await fetch("http://localhost:5000/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionText }),
      })

      if (!answerResponse.ok) {
        throw new Error("Failed to generate answer")
      }

      const answerData = await answerResponse.json()
      setAnswer(answerData)

      // Refresh history after new answer
      fetchHistory()
    } catch (err) {
      setError(err.message)
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadFromHistory = (item) => {
    setQuestion(item.question)
    setAnswer(item)
    setHints(item.hints || [])
    setActiveTab("ask")
  }

  return (
    <div className="app-container">
      <header>
        <h1>Academic Question Answering System</h1>
        <div className="tabs">
          <button className={activeTab === "ask" ? "active" : ""} onClick={() => setActiveTab("ask")}>
            Ask Question
          </button>
          <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>
            History
          </button>
        </div>
      </header>

      <main>
        {activeTab === "ask" ? (
          <>
            <QuestionForm onSubmit={handleSubmit} initialValue={question} />

            {loading && <LoadingSpinner />}

            {error && <div className="error-message">Error: {error}</div>}

            {hints.length > 0 && !loading && (
              <div className="hints-container">
                <h2>Hints</h2>
                <ul>
                  {hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
                {answer && !showAnswer && (
                  <button className="reveal-answer-btn" onClick={() => setShowAnswer(true)}>
                    Show Answer
                  </button>
                )}
              </div>
            )}

            {answer && showAnswer && !loading && <AnswerDisplay answer={answer} />}
          </>
        ) : (
          <HistoryList history={history} onItemClick={loadFromHistory} onDelete={deleteHistory} />
        )}
      </main>
    </div>
  )
}

export default App
