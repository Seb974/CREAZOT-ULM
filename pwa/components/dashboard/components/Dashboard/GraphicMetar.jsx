import React, { useEffect, useRef } from 'react';

export const GraphicMetar = () => {

    const code = 'KiVSEp48';
    const containerId = `metartaf-${ code }`;

    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
      
            // Création de l'ancre
            const anchor = document.createElement('a');
            anchor.href = 'https://metar-taf.com/fr/FMEP';
            anchor.id = containerId;
            anchor.textContent = 'METAR Aéroport de Pierrefonds';
            anchor.style.fontSize = '18px';
            anchor.style.fontWeight = '500';
            anchor.style.color = '#000';
            anchor.style.display = 'block';
            anchor.style.width = '100%';
            anchor.style.height = '100%';
            anchor.onclick = e => e.preventDefault();
      
            containerRef.current.appendChild(anchor);
      
            // Création du script
            const script = document.createElement('script');
            script.src = `https://metar-taf.com/fr/embed-js/FMEP?layout=landscape&qnh=hPa&rh=dp&target=${ code }`;
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
      
            containerRef.current.appendChild(script);
          }
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
};