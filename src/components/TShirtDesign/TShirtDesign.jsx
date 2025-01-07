import React, { useState, useRef } from "react";

const TShirtDesign = () => {
  const [logo, setLogo] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState(100);
  const canvasRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleResize = (e) => {
    setSize((prevSize) => prevSize + (e.deltaY > 0 ? -5 : 5));
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const tShirtImg = document.getElementById("tshirt");
    const logoImg = new Image();
    logoImg.src = logo;

    logoImg.onload = () => {
      ctx.drawImage(tShirtImg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(logoImg, position.x, position.y, size, size);
      const link = document.createElement("a");
      link.download = "tshirt-design.png";
      link.href = canvas.toDataURL();
      link.click();
    };
  };

  return (
    <div>
      {/* T-Shirt */}
      <img
        id="tshirt"
        src="tshirt.jpg"
        alt="T-Shirt"
        style={{ position: "relative", display: "block", margin: "20px auto" }}
      />

      {/* Logo */}
      {logo && (
        <img
          src={logo}
          alt="Logo"
          style={{
            position: "absolute",
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: `${size}px`,
            height: `${size}px`,
            cursor: "move",
          }}
          draggable
          onDrag={handleDrag}
          onWheel={handleResize}
        />
      )}

      {/* Upload Button */}
      <input
        type="file"
        onChange={handleUpload}
        style={{ marginTop: "20px" }}
      />

      {/* Save Button */}
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={{ display: "none" }}
      />
      <button onClick={saveImage} style={{ marginTop: "10px" }}>
        Save Design
      </button>
    </div>
  );
};

export default TShirtDesign;
