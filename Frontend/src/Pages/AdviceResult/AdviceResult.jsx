import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AdviceResult.css";

export default function AdviceResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const advice = state?.advice || "⚠ No advice found.";

  const handleDownloadPdf = () => window.print();

  if (!advice) {
    return (
      <div className="no-data">
        <p>No result found. Please fill the planner first.</p>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="result-container">
      <header className="result-header">
        <h1>📊 Personalized Financial Report</h1>
        <p>Based on your financial profile</p>
        <p>Note: Empower your mind. Let AI guide, not decide.</p>
      </header>

      {/* Render Markdown beautifully instead of plain HTML */}
      <div className="advice-section markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {advice}
        </ReactMarkdown>
      </div>

      <div className="button-group">
        <button className="btn success" onClick={handleDownloadPdf}>
          📥 Download PDF Report
        </button>
        <button className="btn back" onClick={() => navigate("/")}>
          🔁 Plan Again
        </button>
      </div>
    </div>
  );
}
