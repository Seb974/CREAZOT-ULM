import React, { useEffect, useState } from 'react';
import { EncodedMetarTaf } from './EncodedMetarTaf';
import ExploreIcon from '@mui/icons-material/Explore';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';
import { getAirportCode } from '../../../../app/lib/client';

export const EncodedMetarView = ({ switchToMetar, client, isSmall, hidden }) => {

    const [selectedCode, setSelectedCode] = useState(null);
    const [meteoStations, setMeteoStations] = useState([]);

    useEffect(() => {
        const clientMeteoStations = getMeteoStations(client);
        const defaultStation = getMainAirport(clientMeteoStations);
        setMeteoStations(clientMeteoStations);
        setSelectedCode(defaultStation);
    }, [client]);
    
    const getMeteoStations = ({ airports }) => {
        return isDefinedAndNotVoid(airports) ? airports.filter(a => a.meteo && !!a.code) : []
    };

    const getMainAirport = airports => {
        if (isDefinedAndNotVoid(airports)) {
            const mainAirport = airports.find(airport => isDefined(airport.main) && airport.main === true);
            return isDefined(mainAirport) ? getAirportCode(mainAirport) : getAirportCode(airports[0]);
        }
        return null;
    }

    return (
        <div className={`w-full mt-6 overflow-hidden ${ hidden ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full min-h-[300px] flex flex-col">
                { !isDefinedAndNotVoid(meteoStations) || !isDefined(selectedCode) ? 
                    <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">Aucune station météo enregistrée.</div>
                    :
                    <>
                        <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"> 
                            <select className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2 text-sm min-h-[42px]" value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
                                {meteoStations.map((station, i) => (<option key={i} value={getAirportCode(station)}>{ station.nom }</option>))}
                            </select>
                        </div>
                        <div className="flex-grow">
                            <div className={`transition-all`}>
                                <EncodedMetarTaf code={selectedCode}/>
                            </div>
                        </div>
                        { isSmall && 
                            <div className="mt-4 md:mt-6 text-left md:hidden">
                                <a href="#" onClick={switchToMetar} className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                                    <><ExploreIcon className="mr-2"/>{ "METAR graphique" }</>
                                </a>
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    );
};