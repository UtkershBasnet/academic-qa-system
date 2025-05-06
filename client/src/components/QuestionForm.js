"use client"

import { useState, useEffect } from "react"

function QuestionForm({ onSubmit, initialValue = "" }) {
  const [question, setQuestion] = useState(initialValue)

  useEffect(() => {
    setQuestion(initialValue)
  }, [initialValue])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim()) {
      onSubmit(question)
    }
  }

  return (
    <div className="question-form">
      <h2>Ask an Academic Question</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Your Question:</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your academic question here..."
            rows={4}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Get Answer
        </button>
      </form>
    </div>
  )
}

export default QuestionForm
