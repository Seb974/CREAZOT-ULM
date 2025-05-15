import React, { useEffect, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';

export const GraphicMetar = ({ code }) => {

    const containerCode = 'KiVSEp48';
    const containerId = `metartaf-${ containerCode }`;
    const containerRef = useRef(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (code && containerRef.current) {
            setLoading(true);
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
            script.src = `https://metar-taf.com/fr/embed-js/${ code }?layout=landscape&qnh=hPa&rh=dp&target=${ containerCode }`;
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
      
            containerRef.current.appendChild(script);
        }
        const timeout = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timeout);
    }, [code]);

    return (
        <>
            { loading && 
                <div className="mt-6 flex justify-center items-center w-full h-full">
                    <CircularProgress color="error" size={50} />
                </div>
            }
            <div ref={containerRef} className={loading ? 'invisible' : 'visible mx-auto max-w-xl h-full'}/>
        </>
    );
};