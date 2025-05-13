import React, { useState, useEffect } from 'react';
import { EncodedMetarTaf } from './EncodedMetarTaf';
import { GraphicMetar } from './GraphicMetar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

export const MetarView = ({ showGraphic, setShowGraphic, switchToMap, hidden }) => {

    const aeroports = [
        {code: "FMEP", name: "Pierrefonds"},
        {code: "FMEE", name: "Roland Garros"}
    ];

    const [selectedCode, setSelectedCode] = useState(aeroports[0].code);
    
    const changeView = e => setShowGraphic(!showGraphic);

    return (
        <div className={`w-full mt-6 overflow-hidden ${ hidden ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full min-h-[300px] flex flex-col">
                <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <select className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2 text-sm min-h-[42px]" value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
                        {aeroports.map(({ code, name }, i) => (<option key={i} value={code}>{code + " - " + name}</option>))}
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
            </div>
        </div>
    );
};