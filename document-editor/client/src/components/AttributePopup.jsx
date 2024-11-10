import React, { useState, useEffect, useRef } from 'react';
import './AttributePopup.css'; // We'll create this next

function AttributePopup({ selectedText, onClose, onSubmit, position }) {
  const [attributes, setAttributes] = useState({
    tone: '',
    style: '',
    pacing: '',
  });

  const popupRef = useRef(null);

  const handleChange = (event) => {
    setAttributes({
      ...attributes,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Here we'll add the API call to your LLM service
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          attributes: attributes,
        }),
      });
      
      const data = await response.json();
      onSubmit(data.rewrittenText);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div 
      className="attribute-popup"
      ref={popupRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="popup-header">
        <h3>Rewrite Text</h3>
        <button type="button" onClick={onClose} className="close-button">&times;</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tone">Tone:</label>
          <select id="tone" name="tone" value={attributes.tone} onChange={handleChange}>
            <option value="">Select Tone</option>
            <option value="humorous">Humorous</option>
            <option value="serious">Serious</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="style">Style:</label>
          <select id="style" name="style" value={attributes.style} onChange={handleChange}>
            <option value="">Select Style</option>
            <option value="descriptive">Descriptive</option>
            <option value="concise">Concise</option>
            <option value="technical">Technical</option>
            <option value="narrative">Narrative</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pacing">Pacing:</label>
          <select id="pacing" name="pacing" value={attributes.pacing} onChange={handleChange}>
            <option value="">Select Pacing</option>
            <option value="fast">Fast</option>
            <option value="moderate">Moderate</option>
            <option value="slow">Slow</option>
          </select>
        </div>

        <div className="selected-text">
          <strong>Selected Text:</strong>
          <p>{selectedText}</p>
        </div>

        <button type="submit" className="submit-button">Rewrite</button>
      </form>
    </div>
  );
}

export default AttributePopup;
