import React, { useState, useEffect } from "react";
import devImage from "../src/dev.png"; // Ensure correct path
import hanniImage from "../src/hanni.png";
import noneImage from "../src/none.png";
import axios from "axios";
import './App.css';

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

  const handleCandidateSelect = (id) => {
    setFormData((prev) => ({ ...prev, candidate: id }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.candidate || !formData.villageName || !formData.mobileNumber) {
      setMessage("सभी फ़ील्ड भरना अनिवार्य है!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/vote`, formData);
      setMessage(response.data.message);
      setFormData({ candidate: "", villageName: "", mobileNumber: "" });
      fetchVoteCount();
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

  useEffect(() => {
    fetchVoteCount();
  }, []);

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
        />

        <label>मोबाइल नंबर:</label>
        <input
          type="text"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleInputChange}
          placeholder="10 अंकों का मोबाइल नंबर"
          required
        />

        <h3>उम्मीदवार चुनें:</h3>
        <div className="candidates">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className={`candidate ${formData.candidate === cand.id ? "selected" : ""}`}
              onClick={() => handleCandidateSelect(cand.id)}
            >
              <img src={cand.image} alt={cand.name} />
              <p>{cand.name}</p>
            </div>
          ))}
        </div>

        <button type="submit">🗳 वोट दें</button>
      </form>

      <h2>📌 वोट गणना</h2>
      <ul>
        {voteCount.length > 0 ? (
          voteCount.map((vote) => (
            <li key={vote._id}>{vote._id}: {vote.count} वोट</li>
          ))
        ) : (
          <li>अभी तक कोई वोट दर्ज नहीं हुआ।</li>
        )}
      </ul>
    </div>
  );
}

export default App;