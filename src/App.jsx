import React, { useState, useEffect } from "react";
import devImage from "../src/dev.png"; // Ensure correct path
import hanniImage from "../src/hanni.png";
import noneImage from "../src/none.png";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "https://voting-kekx.onrender.com/api";

const candidates = [
  { id: "देवेश कांत सिंह(BJP)", name: "देवेश कांत सिंह (BJP)", image: devImage },
  { id: "हन्नी वर्मा(RJD)", name: "हन्नी वर्मा (RJD)", image: hanniImage },
  { id: "इसमें से कोई नहीं", name: "इसमें से कोई नहीं", image: noneImage },
];

function App() {
  const [formData, setFormData] = useState({
    candidate: "",
    villageName: "",
    mobileNumber: "",
  });
  const [message, setMessage] = useState(null);
  const [voteCount, setVoteCount] = useState([]);
  const [hasVoted, setHasVoted] = useState(false); // New state to track voting status

  // Check localStorage on component mount
  useEffect(() => {
    const voted = localStorage.getItem("hasVoted");
    if (voted) {
      setHasVoted(true);
      setMessage("आप पहले ही मतदान कर चुके हैं। इस ब्राउज़र से दोबारा वोट नहीं कर सकते।");
    }
    fetchVoteCount(); // Fetch vote count on mount
  }, []);

  const handleCandidateSelect = (id) => {
    if (!hasVoted) {
      setFormData((prev) => ({ ...prev, candidate: id }));
    }
  };

  const handleInputChange = (e) => {
    if (!hasVoted) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has already voted in this browser
    if (hasVoted) {
      setMessage("आप पहले ही मतदान कर चुके हैं। इस ब्राउज़र से दोबारा वोट नहीं कर सकते।");
      return;
    }

    // Validate form fields
    if (!formData.candidate || !formData.villageName || !formData.mobileNumber) {
      setMessage("सभी फ़ील्ड भरना अनिवार्य है!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/vote`, formData);
      setMessage(response.data.message);
      setFormData({ candidate: "", villageName: "", mobileNumber: "" });

      // Mark as voted in localStorage and state
      localStorage.setItem("hasVoted", "true");
      setHasVoted(true);

      fetchVoteCount(); // Refresh vote count after successful vote
    } catch (error) {
      setMessage(error.response?.data?.message || "मतदान में समस्या आई!");
    }
  };

  const fetchVoteCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/votecount`);
      setVoteCount(response.data.data);
    } catch (error) {
      console.error("Error fetching vote count", error);
    }
  };

  return (
    <div className="container">
      <h1>📊 वोटिंग एप्लिकेशन</h1>

      {message && (
        <p className={`message ${message.includes("सफल") ? "success" : ""}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>गाँव का नाम:</label>
        <input
          type="text"
          name="villageName"
          value={formData.villageName}
          onChange={handleInputChange}
          placeholder="अपने गाँव का नाम दर्ज करें"
          required
          disabled={hasVoted} // Disable input if voted
        />

        <label>मोबाइल नंबर:</label>
        <input
          type="text"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleInputChange}
          placeholder="10 अंकों का मोबाइल नंबर"
          required
          disabled={hasVoted} // Disable input if voted
        />

        <h3>उम्मीदवार चुनें:</h3>
        <div className="candidates">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className={`candidate ${formData.candidate === cand.id ? "selected" : ""} ${
                hasVoted ? "disabled" : ""
              }`}
              onClick={() => handleCandidateSelect(cand.id)}
            >
              <img src={cand.image} alt={cand.name} />
              <p>{cand.name}</p>
            </div>
          ))}
        </div>

        <button type="submit" disabled={hasVoted}>
          🗳 वोट दें
        </button>
      </form>

      <h2>📌 वोट गणना</h2>
      <ul>
        {voteCount.length > 0 ? (
          voteCount.map((vote) => (
            <li key={vote._id}>
              {vote._id}: {vote.count} वोट
            </li>
          ))
        ) : (
          <li>अभी तक कोई वोट दर्ज नहीं हुआ।</li>
        )}
      </ul>
    </div>
  );
}

export default App;