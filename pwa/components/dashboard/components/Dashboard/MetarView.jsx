import React from 'react';
import { EncodedMetarTaf } from './EncodedMetarTaf';
import { GraphicMetar } from './GraphicMetar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

export const MetarView = ({ showGraphic, setShowGraphic, switchToMap, hidden }) => {

    const changeView = e => setShowGraphic(!showGraphic);

    return (
        <div className={`w-full mt-6 overflow-hidden ${ hidden ? 'hidden' : ''}`}>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark h-full min-h-[300px] flex flex-col">
                <div className="flex-grow">
                    <div className={`transition-all ${ showGraphic ? "" : "hidden"}`}>
                        <GraphicMetar />
                    </div>
                    <div className={`transition-all ${ !showGraphic ? "" : "hidden"}`}>
                        <EncodedMetarTaf />
                    </div>
                </div>
                <div className="my-4 text-right">
                    <a href="#" onClick={changeView} className="text-danger text-sm underline hover:underline hover:text-red-700 transition-colors duration-150 cursor-pointer">
                        { showGraphic ? 
                            <><AssignmentIcon className="mr-2"/>{ "METAR & TAF bruts" }</>
                            : 
                            <><ExploreIcon className="mr-2"/>{ "METAR graphique" }</>
                        }
                    </a>
                </div>
                <div className="mt-4 text-left md:hidden">
                    <a href="#" onClick={switchToMap} className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                        <><TravelExploreIcon className="mr-2"/>{ "Localisation" }</>
                    </a>
                </div>
            </div>
        </div>
    );
};