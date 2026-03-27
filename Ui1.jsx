import React, { useState } from 'react';
import './Ui1.css';

const Ui1 = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
    }
  };

  const handleSubmit = () => {
    if (selectedVideo) {
      alert(`Video selected: ${selectedVideo.name}`);
      // Add your submit logic here
    }
  };

  return (
    <div className="ui1-page">
      <span className="orb orb-one" aria-hidden="true" />
      <span className="orb orb-two" aria-hidden="true" />
      <span className="orb orb-three" aria-hidden="true" />

      <div className="upload-card">
        <span className="sheen" aria-hidden="true" />
        <h1 className="title">Upload your video</h1>
        <p className="subtitle">
          Share a clip with the team. We will keep it secure and let you know when it is processed.
        </p>

        <div className="actions">
          <label className="choose-btn" htmlFor="video-input">
            Choose video
          </label>
          <input
            id="video-input"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
          />
        </div>

        {selectedVideo && (
          <div className="selection">
            <div className="file-pill">
              <span className="status-dot" aria-hidden="true" />
              <span className="file-name">{selectedVideo.name}</span>
            </div>
            <button className="submit-btn" onClick={handleSubmit}>
              Submit video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ui1;
