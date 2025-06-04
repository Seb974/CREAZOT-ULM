import React, { useEffect, useState } from 'react';
import { EncodedMetarTaf } from './EncodedMetarTaf';
import { GraphicMetar } from './GraphicMetar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';

export const MetarView = ({ showGraphic, setShowGraphic, switchToMap, hidden, client }) => {

    const [selectedCode, setSelectedCode] = useState(null);
    const [meteoStations, setMeteoStations] = useState([]);


    useEffect(() => {
        const clientMeteoStations = getMeteoStations(client);
        const defaultStation = getMainAirport(clientMeteoStations);
        setMeteoStations(clientMeteoStations);
        setSelectedCode(defaultStation);
    }, [client]);
    
    const changeView = e => setShowGraphic(!showGraphic);

    const getMeteoStations = ({ airportCodes }) => {
        return isDefinedAndNotVoid(airportCodes) ? airportCodes.filter(a => a.meteo) : []
    };

    const getMainAirport = airports => {
        if (isDefinedAndNotVoid(airports)) {
            const mainAirport = airports.find(airport => isDefined(airport.main) && airport.main === true);
            return isDefined(mainAirport) ? mainAirport.code : airports[0].code;
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
                                {meteoStations.map(({ code, nom }, i) => (<option key={i} value={code}>{code + " - " + nom}</option>))}
                            </select>
                            <button onClick={changeView} className="inline-flex items-center justify-center px-3 py-2 text-sm border border-gray-300 text-gray-800 rounded hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[42px]">
                                {showGraphic ? 
                                    <><AssignmentIcon className="mr-2 inline" />{"METAR & TAF bruts"}</>
                                    :
                                    <><ExploreIcon className="mr-2 inline" />{"METAR graphique"}</>
                                }
                            </button>
                        </div>
                        <div className="flex-grow">
                            <div className={`transition-all ${ showGraphic ? "" : "hidden"}`}>
                                <GraphicMetar code={selectedCode}/>
                            </div>
                            <div className={`transition-all ${ !showGraphic ? "" : "hidden"}`}>
                                <EncodedMetarTaf code={selectedCode}/>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-6 text-left md:hidden">
                            <a href="#" onClick={switchToMap} className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                                <><TravelExploreIcon className="mr-2"/>{ "Localisation" }</>
                            </a>
                        </div>
                    </>
                }
            </div>
        </div>
    );
};