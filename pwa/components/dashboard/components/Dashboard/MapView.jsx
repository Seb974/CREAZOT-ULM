'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState  } from 'react';
import CloudIcon from '@mui/icons-material/Cloud';
import { SelectBalise } from './Map/SelectBalise';
import { LeafletControl } from './Map/LeafletControl';
import { useBalisePositions } from './Map/useBalisePositions';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';

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

const AutoCenter = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position]);

  return null;
};

const MapView = ({ isSmall, switchToMetar, hidden }) => {

  const pollingInterval = 8000;
  const [aeronefs, setAeronefs] = useState([]);
  const [selectedBalise, setSelectedBalise] = useState('all');
  const { positions, isLoading, error } = useBalisePositions(selectedBalise, aeronefs, pollingInterval, hidden);

  useEffect(() => console.log(positions), [positions]);

    return (
        <div className={`block w-full mt-6 ${ hidden ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full flex flex-col">
              <div className="flex-grow min-h-[420px]">
                <MapContainer center={[-21.1351, 55.5114]} zoom={isSmall ? 9 : 10} style={{ height: '100%', width: '100%'}}>      {/*  minHeight: '420px'  */}
                    <ForceResize hidden={ hidden }/>
                    { selectedBalise !== 'all' && positions.length === 1 && <AutoCenter position={positions[0]} /> }
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LeafletControl position="topright">
                        <SelectBalise value={ selectedBalise } onChange={ setSelectedBalise } setAeronefs={ setAeronefs }/>
                    </LeafletControl>
                    {/* <Marker position={[-21.1351, 55.5364]}>
                        <Popup>Avion rouge repéré 👀</Popup>
                    </Marker> */}

                    {/* Chargement des positions */}
                    {isLoading && <div>Chargement des positions...</div>}

                    {/* Affichage des erreurs */}
                    {error && <div>Erreur : {error}</div>}

                    {/* Affichage des marqueurs */}
                    { !isLoading && !error && isDefinedAndNotVoid(positions) && positions.map((pos, idx) => (
                      <Marker key={idx} position={[pos.lat, pos.lng]}>
                        <Popup>
                          {pos.nombalise || 'Balise'}<br />
                          ({pos.lat}, {pos.lng})
                        </Popup>
                      </Marker>
                    ))}
                </MapContainer>
              </div>
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