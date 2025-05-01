'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import CloudIcon from '@mui/icons-material/Cloud';

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

const MapView = ({ isSmall, switchToMetar, hidden }) => {

    return (
        <div className={`block w-full mt-6 ${ hidden ? 'hidden' : ''}`}>
            {/* <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full"> */}
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full flex flex-col">
              <div className="flex-grow min-h-[420px]">
                <MapContainer center={[-21.1351, 55.5114]} zoom={isSmall ? 9 : 10} style={{ height: '100%', width: '100%'}}>      {/*  minHeight: '420px'  */}
                    <ForceResize hidden={ hidden }/>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[-21.1351, 55.5364]}>
                        <Popup>Avion rouge repéré 👀</Popup>
                    </Marker>
                </MapContainer>
              </div>
                {/* <br/> */}
                <div className="mt-4 text-left md:hidden">
                    <a href="#" onClick={switchToMetar} className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                        <><CloudIcon className="mr-2" />{ "METAR & TAF" }</>
                    </a>
              </div>
            </div>
        </div>
    );
};

export default MapView;