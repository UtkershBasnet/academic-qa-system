"use client"

function HistoryList({ history, onItemClick, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p>No questions have been asked yet.</p>
      </div>
    )
  }

  return (
    <div className="history-list">
      <h2>Question History</h2>
      <ul>
        {history.map((item) => (
          <li key={item.id} className="history-item">
            <div className="history-question" onClick={() => onItemClick(item)}>{item.question}</div>
            <div className="history-meta">
              <span className="history-date">{new Date(item.timestamp).toLocaleString()}</span>
              <button className="delete-btn" onClick={() => onDelete(item.id)}>
                <span className="delete-icon">🗑️</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistoryList
