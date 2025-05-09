'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
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

  const mapRef = useRef(null);
  const markersRef = useRef({});
  const pollingInterval = 20000;
  const defaultView = {center: [-21.1351, 55.5114], zoom: isSmall ? 9 : 10};
  const defaultCenter = { lat: defaultView.center[0], lng: defaultView.center[1]};
  const dateTimeOptions = { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};

  const [isChange, setIsChange] = useState(false);
  const [aeronefs, setAeronefs] = useState([]);
  const [selectedBalise, setSelectedBalise] = useState('none');
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

  const animateMarker = (marker, fromLatLng, toLatLng, fromCap = 0, toCap = 0, duration = 20000) => {
    const startTime = performance.now();

    let capDiff = ((toCap - fromCap + 540) % 360) - 180;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentLat = fromLatLng.lat + (toLatLng.lat - fromLatLng.lat) * progress;
      const currentLng = fromLatLng.lng + (toLatLng.lng - fromLatLng.lng) * progress;
      const currentCap = (fromCap + capDiff * progress + 360) % 360;

      marker.setLatLng([currentLat, currentLng]);
      marker.setIcon(getRotatedPlaneIcon(currentCap));
      marker.options.rotationCap = currentCap;

      if (progress < 1)
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!positions || !markersRef.current)
       return;

    positions.forEach((newPos) => {
        const id = newPos.nombalise || `idx_${newPos.lat}_${newPos.lng}`;
        const marker = markersRef.current[id];
        if (!marker) return;

        const fromLatLng = marker.getLatLng();
        const toLatLng = L.latLng(newPos.lat, newPos.lng);

        if (fromLatLng.lat === toLatLng.lat && fromLatLng.lng === toLatLng.lng) {
          const fromCap = marker.options.rotationCap || 0;
          const toCap = parseFloat(newPos.cap) || 0;
          
          if (Math.abs(toCap - fromCap) > 1) {
            marker.setIcon(getRotatedPlaneIcon(toCap));
            marker.options.rotationCap = toCap;
          }
          return;
        }

        animateMarker(marker, fromLatLng, toLatLng, fromCap, toCap, pollingInterval - 1000);
    });
  }, [positions]);

  const convertToKmh = (speedStr) => {
    const speedMs = parseFloat(speedStr);
    if (isNaN(speedMs)) {
      return 0; 
    }
    return (speedMs * 3.6).toFixed(2);
  }
  
  function parseDate(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
    return (
        <div className={`block w-full mt-6 ${ hidden ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full flex flex-col">
              <div className="flex-grow min-h-[420px]">
                <MapContainer center={ defaultView.center } zoom={ defaultView.zoom } whenCreated={map => (mapRef.current = map)} style={{ height: '100%', width: '100%'}}>      {/*  minHeight: '420px'  */}
                    <ForceResize hidden={ hidden }/>
                    { selectedBalise === 'all' || selectedBalise === 'none' ?
                          <AutoCenter position={ defaultCenter } zoom={ defaultView.zoom }/>
                      : positions.length === 1 && <AutoCenter position={ positions[0] } /> 
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
                          <Marker key={id} position={[pos.lat, pos.lng]} icon={getRotatedPlaneIcon(pos.cap)}
                              ref={(ref) => {
                                  if (ref) {
                                    markersRef.current[id] = ref;
                                    ref.options.rotationCap = parseFloat(pos.cap) || 0;
                                  } else {
                                    delete markersRef.current[id];
                                  }
                              }}
                          >
                              <Popup>
                                { pos.nombalise || 'Balise' } <span className={`text-[9px] italic ${ pos.mode === 'SLEEPING' ? 'text-zinc-500' : 'text-lime-500'}`}>{ pos.mode }</span><br />
                                [{ pos.lat.toFixed(5) }, { pos.lng.toFixed(5) }] - { parseDate(pos.time).toLocaleString('fr-FR', dateTimeOptions) }<br />
                                Altitude : { pos.altitude }m<br />
                                Cap : { pos.cap }°<br />
                                Vitesse : { convertToKmh(pos.vitesse) }km/h
                              </Popup>
                          </Marker>
                        );
                    })}
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