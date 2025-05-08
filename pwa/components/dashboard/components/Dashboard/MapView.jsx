'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import CloudIcon from '@mui/icons-material/Cloud';
import { SelectBalise } from './Map/SelectBalise';
import { LeafletControl } from './Map/LeafletControl';
import { useBalisePositions } from './Map/useBalisePositions';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';
import { CircularProgress, Box } from '@mui/material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ForceResize = ({ hidden }) => {
  const map = useMap();

  useEffect(() => {
    if (!hidden)
      setTimeout(() => map.invalidateSize(), 300);
  }, [map, hidden]);

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

const MapView = ({ isSmall, switchToMetar, hidden }) => {

  const pollingInterval = 20000;
  const duration = pollingInterval - 1000;
  const steps = 90; 
  const interval = duration / steps;
  const defaultView = {center: [-21.1351, 55.5114], zoom: isSmall ? 9 : 10};
  const defaultCenter = { lat: defaultView.center[0], lng: defaultView.center[1]};

  const [isChange, setIsChange] = useState(false);
  const [aeronefs, setAeronefs] = useState([]);
  const [selectedBalise, setSelectedBalise] = useState('none');
  const [animatedPositions, setAnimatedPositions] = useState({});
  const { positions, error} = useBalisePositions(selectedBalise, aeronefs, pollingInterval, isChange, setIsChange, hidden);

  const onBaliseChange = baliseId => {
    setSelectedBalise(baliseId);
    setIsChange(true);
  };
  
  const getRotatedPlaneIcon = (cap) => {
    const angle = parseFloat(cap) || 0;
    return L.divIcon({
      className: '',
      html: `
        <img 
          src="/images/FlightIcon.png" 
          style="
            width: 40px;
            height: 40px;
            transform: rotate(${ angle }deg);
            transform-origin: center center;
          "
        />
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  useEffect(() => {
      if (!Array.isArray(positions)) return;

      const animIds = [];
    
      positions.forEach((newPos) => {
        const id = newPos.nombalise || `idx_${newPos.lat}_${newPos.lng}`;
        const prev = animatedPositions[id] || { lat: newPos.lat, lng: newPos.lng };
    
        let step = 0;
        const latDiff = newPos.lat - prev.lat;
        const lngDiff = newPos.lng - prev.lng;
    
        const anim = setInterval(() => {
          step++;
          const progress = step / steps;
    
          setAnimatedPositions((prevPositions) => ({
            ...prevPositions,
            [id]: {
              lat: prev.lat + latDiff * progress,
              lng: prev.lng + lngDiff * progress,
              cap: newPos.cap
            }
          }));
    
          if (step >= steps) clearInterval(anim);  
        }, interval);

        animIds.push(anim);
      });

      return () => animIds.forEach(clearInterval);

    }, [positions]);
  
    return (
        <div className={`block w-full mt-6 ${ hidden ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full flex flex-col">
              <div className="flex-grow min-h-[420px]">
                <MapContainer center={ defaultView.center } zoom={ defaultView.zoom } style={{ height: '100%', width: '100%'}}>      {/*  minHeight: '420px'  */}
                    <ForceResize hidden={ hidden }/>
                    { selectedBalise === 'all' || selectedBalise === 'none' ?
                          <AutoCenter position={defaultCenter} zoom={ defaultView.zoom }/>
                      : positions.length === 1 && <AutoCenter position={positions[0]} /> 
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

                    { !isChange && !error && isDefinedAndNotVoid(positions) && positions.map((pos, idx) => {
                      const id = pos.nombalise || `idx_${pos.lat}_${pos.lng}`;
                      const animated = animatedPositions[id] || pos;

                      return (
                       // <Marker key={idx} position={[pos.lat, pos.lng]} icon={getRotatedPlaneIcon(pos.cap)}>
                        <Marker key={ id } position={ [animated.lat, animated.lng] } icon={ getRotatedPlaneIcon(animated.cap) }>

                          <Popup>
                            { pos.nombalise || 'Balise' }<br />
                            {/* ({pos.lat}, {pos.lng}) */}
                            [ { animated.lat.toFixed(5) }, { animated.lng.toFixed(5) } ]
                          </Popup>
                        </Marker>
                      )}
                    )}
                </MapContainer>
              </div>
                <div className="mt-4 text-left md:hidden">
                    <a href="#" onClick={ switchToMetar } className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                        <><CloudIcon className="mr-2" />{ "METAR & TAF" }</>
                    </a>
              </div>
            </div>
        </div>
    );
};

export default MapView;