import React, { useEffect, useRef } from 'react';

export const GraphicMetar = ({ code }) => {

    const apiCode = 'KiVSEp48';
    const containerId = `metartaf-${ apiCode }`;

    const containerRef = useRef(null);

    useEffect(() => {
        if (code && containerRef.current) {
            containerRef.current.innerHTML = '';
      
            // Création de l'ancre
            const anchor = document.createElement('a');
            anchor.href = `https://metar-taf.com/fr/${ code }`;
            anchor.id = containerId;
            anchor.textContent = `METAR Aéroport ${ code }`;
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
            script.src = `https://metar-taf.com/fr/embed-js/${ code }?layout=landscape&qnh=hPa&rh=dp&target=${ apiCode }`;
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
      
            containerRef.current.appendChild(script);
          }
    }, [code]);

    return <div ref={containerRef} className="w-full h-full" />;
};