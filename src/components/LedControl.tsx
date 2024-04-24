import React, { useState } from "react";

export type Intensity = "off" | "low" | "medium" | "high";

interface LEDControlProps {
    setLEDIntensity: (led: string, intensity: Intensity) => void;
}

interface LEDIntensities {
    front: Intensity,
    left: Intensity,
    right: Intensity
  }

const LEDControl: React.FC<LEDControlProps> = ({ setLEDIntensity }) => {
  // Initialize state variables
  const [intensities, setIntensities] = useState<LEDIntensities>({
    front: "off",
    left: "off",
    right: "off",
  });

  const handleIntensityChange = (led: keyof LEDIntensities) => {
    // Get the current intensity for the specified LED
    const currentIntensity = intensities[led];

    // Calculate the new intensity based on the current intensity
    let newIntensity: Intensity;
    switch (currentIntensity) {
      case "off":
        newIntensity = "low";
        break;
      case "low":
        newIntensity = "medium";
        break;
      case "medium":
        newIntensity = "high";
        break;
      case "high":
        newIntensity = "off";
        break;
      default:
        newIntensity = "off";
        break;
    }

    // Update the state with the new intensity
    setIntensities((prevIntensities) => ({
      ...prevIntensities,
      [led]: newIntensity,
    }));

    // Call the setIntensity callback with the updated intensity
    setLEDIntensity(led, newIntensity);
  };

  // CSS styles
  const lightStyle: React.CSSProperties = {
    color: "white",
    backgroundColor: "offColor",
    width: "100%",
    height: "100%",
    borderRadius: "2px",
    display: "flex",
    justifyContent: "center",
  };

  const buttonStyle: React.CSSProperties = {
    width: "1.3rem",
    height: "100%",
    backgroundColor: "#3a3a3e",
    borderRadius: "7px",
    display: "flex",
    padding: "3px",
    gap: "1px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const onColor = "#cfa638";
  const offColor = "grey";

  return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "1.95rem", //chosen so that overall height (with transformation) is ~2.5rem
          marginInline: "0.5rem",
        }}
      >
        {/* Left LED button */}
        <button
          style={{
            ...buttonStyle,
            transform: "rotate(-30deg)",
            transformOrigin: "bottom right",
          }}
          onClick={() => handleIntensityChange("left")}
        >
          {/* Render the LED indicators */}
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                ...lightStyle,
                backgroundColor:
                  /^(high)$/.test(intensities.left) && index === 1
                    ? onColor
                    : /^(high|medium)$/.test(intensities.left) && index === 2
                    ? onColor
                    : /^(low|medium|high)$/.test(intensities.left) &&
                      index === 3
                    ? onColor
                    : offColor,
              }}
            ></div>
          ))}
        </button>

        {/* Front LED button */}
        <div>
          <button
            style={buttonStyle}
            onClick={() => handleIntensityChange("front")}
          >
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                style={{
                  ...lightStyle,
                  backgroundColor:
                    /^(high)$/.test(intensities.front) && index === 1
                      ? onColor
                      : /^(high|medium)$/.test(intensities.front) && index === 2
                      ? onColor
                      : /^(low|medium|high)$/.test(intensities.front) &&
                        index === 3
                      ? onColor
                      : offColor,
                }}
              ></div>
            ))}
          </button>
          <button
            style={{
              ...buttonStyle,
              height: "30%",
              width: "140%",
              transform: "translateX(-14%)",
            }}
            onClick={() => {
              handleIntensityChange("front");
              handleIntensityChange("left");
              handleIntensityChange("right");
            }}
          ></button>
        </div>

        {/* Right LED button */}
        <button
          style={{
            ...buttonStyle,
            transform: "rotate(30deg)",
            transformOrigin: "bottom left",
          }}
          onClick={() => handleIntensityChange("right")}
        >
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              style={{
                ...lightStyle,
                backgroundColor:
                  /^(high)$/.test(intensities.right) && index === 1
                    ? onColor
                    : /^(high|medium)$/.test(intensities.right) && index === 2
                    ? onColor
                    : /^(low|medium|high)$/.test(intensities.right) &&
                      index === 3
                    ? onColor
                    : offColor,
              }}
            ></div>
          ))}
        </button>
      </div>
  );
};

export default LEDControl;
