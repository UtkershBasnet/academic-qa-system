import React from "react"

function AnswerDisplay({ answer }) {
  // Parse steps if they're stored as a string
  const steps = Array.isArray(answer.steps)
    ? answer.steps
    : typeof answer.steps === "string"
      ? JSON.parse(answer.steps)
      : [answer.answer]

  // Helper to render markdown-style bold (**text**) as <strong>text</strong>
  const renderWithBold = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={i}>{part.replace(/\*\*/g, "")}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="answer-display">
      <h2>Answer</h2>

      <div className="answer-meta">
        <span className="answer-date">{new Date(answer.timestamp || Date.now()).toLocaleString()}</span>
      </div>

      <div className="question-display">
        <h3>Question:</h3>
        <p>{answer.question}</p>
      </div>

      <div className="steps-container">
        <h3>Step-by-Step Solution:</h3>
        <ol>
          {steps.map((step, index) => (
            <li key={index} className="step-item">
              {renderWithBold(step)}
            </li>
          ))}
        </ol>
      </div>

      {answer.conclusion && (
        <div className="conclusion">
          <h3>Conclusion:</h3>
          <p>{answer.conclusion}</p>
        </div>
      )}
    </div>
  )
}

export default AnswerDisplay
