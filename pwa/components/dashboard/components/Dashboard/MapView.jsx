'use client';

import { MapContainer, TileLayer, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import CloudIcon from '@mui/icons-material/Cloud';
import { SelectBalise } from './Map/SelectBalise';
import { LeafletControl } from './Map/LeafletControl';
import { useBalisePositions } from './Map/useBalisePositions';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';
import { CircularProgress, Box, Fab } from '@mui/material';
import { LeafletTrackingMarker } from 'react-leaflet-tracking-marker';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const ForceResize = ({ hidden, fullScreen }) => {
    const map = useMap();

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible'  && (!hidden || fullScreen))
          setTimeout(() => setTimeout(() => map.invalidateSize(), 300), 300);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);

    }, [map, hidden, fullScreen]);

  return null;
};

const AutoCenter = ({ position, zoom = null }) => {
    const map = useMap();

    useEffect(() => {
      if (position && position.lat && position.lng) {
        map.setView([position.lat, position.lng], (isDefined(zoom) ? zoom : map.getZoom()));
      }
    }, [position]);

    return null;
};

const MapEffect = ({ isSmall, hidden, fullScreen }) => {
  const map = useMap();

  useEffect(() => {
    if (!hidden || fullScreen) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [isSmall, hidden, fullScreen, map]);

  return null;
}

const MapView = ({ isSmall, switchToMetar, hidden, client, setShowFullMap, selectedBalise, setSelectedBalise, fullScreen = false }) => {

    const mapRef = useRef(null);
    const pollingInterval = 20000;
    const dateTimeOptions = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};

    const [isChange, setIsChange] = useState(false);
    const [aeronefs, setAeronefs] = useState([]);
    const [prevPos, setPrevPos] = useState({});
    const [hasInitializedBalise, setHasInitializedBalise] = useState(false);
    const { positions, error} = useBalisePositions((hasInitializedBalise ? selectedBalise : null), aeronefs, pollingInterval, isChange, setIsChange, hidden);

    useEffect(() => {
      if (!hidden || fullScreen) {
          const stored = localStorage.getItem('selectedBalise');
          if (stored)
              setSelectedBalise(stored);

          setHasInitializedBalise(true);  
      }
    }, [hidden, fullScreen]);
    
    useEffect(() => {
        const newPrev = {};
        positions.forEach(p => newPrev[p.nombalise] = [p.lat, p.lng]);
        setPrevPos(newPrev);
    }, [positions]);

    useEffect(() => {
      if (selectedBalise !== 'none')
        localStorage.setItem('selectedBalise', selectedBalise);
      else
        localStorage.removeItem('selectedBalise');
    }, [selectedBalise]);


    const onBaliseChange = baliseId => {
      setSelectedBalise(baliseId);
      setIsChange(true);
    };

    const convertToKmh = speedStr => {
      const speedMs = parseFloat(speedStr);
      if (isNaN(speedMs))
        return 0; 

      return (speedMs * 3.6).toFixed(2);
    };
    
    const parseDate = dateString => {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    };
  
    return (
        <div className={`block w-full mt-6 ${ hidden && !fullScreen ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full flex flex-col">
              <div className={`flex-grow ${fullScreen ? (isSmall ? 'min-h-[520px]' : 'min-h-[680px]') : 'min-h-[420px]'}`} style={{ height: '100%', minHeight: fullScreen ? (isSmall ? '520px' : '680px') : '420px' }}
              >
                <MapContainer center={ [client.lat, client.lng] } zoom={ client.zoom + (isSmall ? 0 : 1) } whenCreated={map => (mapRef.current = map)} style={{ height: '100%', width: '100%'}}>      {/*  minHeight: '420px'  */}
                    <ForceResize hidden={ hidden } fullScreen={ fullScreen }/>
                    <MapEffect isSmall={ isSmall } hidden={ hidden } fullScreen={ fullScreen } />
                    { selectedBalise === 'none' ? <AutoCenter position={{lat: client.lat, lng: client.lng}} zoom={ client.zoom + (isSmall ? 0 : 1) }/> :
                      selectedBalise !== 'all' && positions.length === 1 && <AutoCenter position={ positions[0] } /> 
                    }
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LeafletControl position="topright">
                        <SelectBalise value={ selectedBalise } onChange={ onBaliseChange } setAeronefs={ setAeronefs }/>
                    </LeafletControl>

                    { isChange && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        sx={{
                          transform: 'translate(-50%, -50%)',
                          zIndex: 1000,
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}
                      >
                        <CircularProgress size={40} />
                      </Box>
                    )}

                    { error && <div>Erreur : {error}</div> }

                    {!isChange && !error && isDefinedAndNotVoid(positions) && positions.map((pos) => {
                        const id = pos.nombalise || `idx_${pos.lat}_${pos.lng}`;

                        return (
                            <LeafletTrackingMarker
                              key={id}
                              position={[pos.lat, pos.lng]}
                              previousPosition={ prevPos[pos.nombalise] || [pos.lat, pos.lng] }
                              rotationAngle={parseFloat(pos.cap) || 0}
                              duration={20000}
                              icon={
                                L.divIcon({
                                  className: 'custom-icon',
                                  html: `<img src="${ isDefined(client.mapIcon) && client.mapIcon !== '' ? client.mapIcon : '/images/FlightIcon.png' }" style="width: 40px; height: 40px;"/>`,
                                  iconSize: [40, 40],
                                  iconAnchor: [20, 20],
                                  popupAnchor: [0, -20],
                              })
                              }
                            >
                              <Popup>
                                { pos.nombalise || 'Balise' } <span className={`text-[9px] italic ${ pos.mode === 'SLEEPING' ? 'text-zinc-500' : 'text-lime-500'}`}>{ pos.mode }</span><br />
                                [{ pos.lat.toFixed(5) }, { pos.lng.toFixed(5) }] - { parseDate(pos.time).toLocaleString('fr-FR', dateTimeOptions) }<br />
                                Altitude : { pos.altitude }m<br />
                                Cap : { pos.cap }°<br />
                                Vitesse : { convertToKmh(pos.vitesse) }km/h
                              </Popup>
                            </LeafletTrackingMarker>
                        );
                    })}
                    { !fullScreen && !isSmall &&
                      <Fab
                        color={ client.color || 'primary' }
                        size="medium"
                        onClick={() => setShowFullMap(true)}
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: 16,
                          zIndex: 1500,
                        }}
                        aria-label="Afficher plein écran"
                      >
                        <FullscreenIcon />
                      </Fab>
                    }
                </MapContainer>
              </div>
              { !fullScreen &&
                  <div className="mt-4 text-left md:hidden">
                      <a href="#" onClick={ switchToMetar } className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                          <><CloudIcon className="mr-2" />{ "METAR & TAF" }</>
                      </a>
                </div>
              }
            </div>
        </div>
    );
};

export default MapView;