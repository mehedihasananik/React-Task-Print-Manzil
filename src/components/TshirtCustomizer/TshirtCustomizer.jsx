import { useState, useRef, useEffect } from "react";

const TshirtCustomizer = () => {
  // State management
  const [logo, setLogo] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refs
  const tshirtRef = useRef(null);
  const logoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!logo) return;

      const STEP = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case "ArrowLeft":
          setPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - STEP) }));
          break;
        case "ArrowRight":
          setPosition((prev) => ({
            ...prev,
            x: Math.min(
              tshirtRef.current.clientWidth - size.width,
              prev.x + STEP
            ),
          }));
          break;
        case "ArrowUp":
          setPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - STEP) }));
          break;
        case "ArrowDown":
          setPosition((prev) => ({
            ...prev,
            y: Math.min(
              tshirtRef.current.clientHeight - size.height,
              prev.y + STEP
            ),
          }));
          break;
        case "r":
          setRotation((prev) => (prev + 5) % 360);
          break;
        case "R":
          setRotation((prev) => (prev - 5 + 360) % 360);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [logo, size]);

  // File validation
  const validateFile = (file) => {
    if (!file) {
      throw new Error("Please select a file");
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("Please upload a valid image file (JPEG, PNG, or GIF)");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size should be less than 5MB");
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    setError(null);
    setLoading(true);

    try {
      const file = event.target.files[0];
      validateFile(file);

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Calculate aspect ratio and initial size
          const aspectRatio = img.width / img.height;
          const maxDimension = 150; // Maximum initial dimension

          let newWidth, newHeight;
          if (img.width > img.height) {
            newWidth = maxDimension;
            newHeight = maxDimension / aspectRatio;
          } else {
            newHeight = maxDimension;
            newWidth = maxDimension * aspectRatio;
          }

          setSize({ width: newWidth, height: newHeight });

          // Center the logo on the t-shirt
          if (tshirtRef.current) {
            const tshirtRect = tshirtRef.current.getBoundingClientRect();
            setPosition({
              x: (tshirtRect.width - newWidth) / 2,
              y: (tshirtRect.height - newHeight) / 2,
            });
          }

          setLogo(e.target.result);
          setLoading(false);
        };

        img.onerror = () => {
          setError("Failed to load image");
          setLoading(false);
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        setError("Error reading file");
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle dragging
  const handleDragStart = (e) => {
    if (!logo || loading) return;
    e.preventDefault();
    setIsDragging(true);

    const clientX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === "mousedown" ? e.clientY : e.touches[0].clientY;

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging || loading) return;
    e.preventDefault();

    const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;

    const tshirtRect = tshirtRef.current.getBoundingClientRect();
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Keep logo within t-shirt boundaries
    const boundedX = Math.max(0, Math.min(newX, tshirtRect.width - size.width));
    const boundedY = Math.max(
      0,
      Math.min(newY, tshirtRect.height - size.height)
    );

    setPosition({ x: boundedX, y: boundedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle download
  const handleDownload = () => {
    if (!logo || loading) return;

    const link = document.createElement("a");
    link.download = `custom-tshirt-${Date.now()}.png`;
    link.href = logo; // Use the logo as the image source
    link.click();
  };

  // Reset all states
  const handleReset = () => {
    setLogo(null);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setError(null);
    setSize({ width: 100, height: 100 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-[100vh] bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-[5%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* T-shirt Preview Area */}
          <div
            className="relative border-2 border-red-600 rounded-lg aspect-square bg-gray-800"
            onDragOver={(e) => e.preventDefault()} // Allow drop
          >
            <img
              ref={tshirtRef}
              src="/src/assets/t-shirt.png" // Update with your t-shirt image path
              alt="T-shirt template"
              className="w-full h-full object-contain"
            />

            {logo && (
              <div
                ref={logoRef}
                style={{
                  position: "absolute",
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  transform: `rotate(${rotation}deg)`,
                  cursor: isDragging ? "grabbing" : "grab",
                  touchAction: "none",
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onMouseMove={handleDragMove}
                onTouchMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onTouchEnd={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <img
                  src={logo}
                  alt="Uploaded logo"
                  className="w-full h-full object-contain"
                  draggable="false"
                />
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="flex flex-col gap-6">
            {/* Upload Input */}
            <div className="border-2 border-red-600 rounded-lg p-4">
              <label className="block text-gray-300 mb-2">
                Upload or Drag Your Logo Here
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                         file:rounded-lg file:border-0 file:text-red-500 
                         file:bg-red-500/10 hover:file:bg-red-500/20"
              />
            </div>

            {/* Logo Controls */}
            {logo && (
              <div className="border-2 border-red-600 rounded-lg p-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-300">
                    Rotation ({rotation}°)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => {
                      setRotation(Number(e.target.value));
                    }}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-gray-300">Size</label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={size.width}
                    onChange={(e) => {
                      const newWidth = Number(e.target.value);
                      const aspectRatio = size.width / size.height;
                      setSize({
                        width: newWidth,
                        height: newWidth / aspectRatio,
                      });
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                disabled={!logo || loading}
                className="flex-1 border-2 border-red-600 rounded-lg p-4 text-red-500
                         hover:bg-red-500/10 disabled:opacity-50 
                         disabled:hover:bg-transparent"
              >
                Submit To Download Design
              </button>

              <button
                onClick={handleReset}
                disabled={!logo || loading}
                className="flex-1 border-2 border-gray-600 rounded-lg p-4 text-gray-500
                         hover:bg-gray-500/10 disabled:opacity-50 
                         disabled:hover:bg-transparent"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-4 text-gray-300">
              Processing image...
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 text-red-500 p-4 border border-red-500 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TshirtCustomizer;
