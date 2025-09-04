import React, { useEffect, useState } from 'react';
import { EncodedMetarTaf } from './EncodedMetarTaf';
import { GraphicMetar } from './GraphicMetar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';
import { clientWithMicrotrakTags, getAirportCode } from '../../../../app/lib/client';

export const MetarView = ({ showGraphic, setShowGraphic, switchToMap, hidden, client, isSmall }) => {

    const [selectedCode, setSelectedCode] = useState(null);
    const [meteoStations, setMeteoStations] = useState([]);


    useEffect(() => {
        const clientMeteoStations = getMeteoStations(client);
        const defaultStation = getMainAirport(clientMeteoStations);
        setMeteoStations(clientMeteoStations);
        setSelectedCode(defaultStation);
    }, [client]);
    
    const changeView = e => setShowGraphic(!showGraphic);

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
                            { clientWithMicrotrakTags(client) && 
                                <button onClick={changeView} className="inline-flex items-center justify-center px-3 py-2 text-sm border border-gray-300 text-gray-800 rounded hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[42px]">
                                    {showGraphic ? 
                                        <><AssignmentIcon className="mr-2 inline" />{"METAR & TAF bruts"}</>
                                        :
                                        <><ExploreIcon className="mr-2 inline" />{"METAR graphique"}</>
                                    }
                                </button>
                            }
                        </div>
                        <div className="flex-grow">
                            <div className={`transition-all ${ showGraphic ? "" : "hidden"}`}>
                                <GraphicMetar code={selectedCode}/>
                            </div>
                            <div className={`transition-all ${ !showGraphic ? "" : "hidden"}`}>
                                <EncodedMetarTaf code={selectedCode}/>
                            </div>
                        </div>
                        { (clientWithMicrotrakTags(client) || isSmall) && 
                            <div className="mt-4 md:mt-6 text-left md:hidden">
                                <a href="#" onClick={switchToMap} className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                                    { clientWithMicrotrakTags(client) ?
                                        <><TravelExploreIcon className="mr-2"/>{ "Localisation" }</> :
                                        <><AssignmentIcon className="mr-2"/>{ "METAR & TAF bruts" }</>
                                    }
                                </a>
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    );
};