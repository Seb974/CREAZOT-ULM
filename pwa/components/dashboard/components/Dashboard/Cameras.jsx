"use client";

import React, { useEffect, useState } from "react";
import { isDefinedAndNotVoid } from "../../../../app/lib/utils";

export const Cameras = ({ client }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scriptId = "windy-webcam-script";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://webcams.windy.com/webcams/public/embed/v2/script/player.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    const timeout = setTimeout(() => setLoading(false), 2500);

    return () => {
      script.remove();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-red-600">Chargement des caméras...</span>
        </div>
      )}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 w-full transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        {isDefinedAndNotVoid(client.camIds) && client.camIds.map((camera, i) => (
          <div key={i} className="camera">
            <label>{camera.nom}</label>
            <a
              name="windy-webcam-timelapse-player"
              data-id={camera.id}
              data-play="day"
              data-loop="0"
              data-auto-play="0"
              data-force-full-screen-on-overlay-play="0"
              data-interactive="0"
              href={`https://windy.com/webcams/${camera.id}`}
              target="_blank"
              rel="noreferrer"
            ></a>
          </div>
        ))}
      </div>
    </div>
  );
};