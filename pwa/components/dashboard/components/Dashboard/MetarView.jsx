import React, { useEffect, useState } from 'react';
import { EncodedMetarTaf } from './EncodedMetarTaf';
import { GraphicMetar } from './GraphicMetar';
import { NotamView } from './NotamView';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExploreIcon from '@mui/icons-material/Explore';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { Tabs, Tab } from '@mui/material';
import { isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';
import { clientWithMicrotrakTags, getAirportCode } from '../../../../app/lib/client';

export const MetarView = ({ showGraphic, setShowGraphic, switchToMap, hidden, client, isSmall }) => {

    const [selectedCode, setSelectedCode] = useState(null);
    const [meteoStations, setMeteoStations] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const clientMeteoStations = getMeteoStations(client);
        const defaultStation = getMainAirport(clientMeteoStations);
        setMeteoStations(clientMeteoStations);
        setSelectedCode(defaultStation);
    }, [client]);

    useEffect(() => {
        setShowGraphic(activeTab === 0);
    }, [activeTab]);

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

    const hasNotam = isDefined(client.hasNotam) && client.hasNotam;
    const hasMicrotrak = clientWithMicrotrakTags(client);

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

                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: 36,
                                mb: 2,
                                '& .MuiTab-root': {
                                    minHeight: 36,
                                    py: 0.5,
                                    fontSize: '0.8rem',
                                    textTransform: 'none',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#dc2626',
                                },
                                '& .Mui-selected': {
                                    color: '#dc2626 !important',
                                },
                            }}
                        >
                            <Tab icon={<ExploreIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="METAR graphique" />
                            {hasMicrotrak && <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="METAR & TAF bruts" />}
                            {hasNotam && <Tab icon={<AnnouncementIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="NOTAM" />}
                        </Tabs>

                        <div className="flex-grow">
                            {activeTab === 0 && <GraphicMetar code={selectedCode} />}
                            {hasMicrotrak && activeTab === 1 && <EncodedMetarTaf code={selectedCode} />}
                            {hasNotam && activeTab === (hasMicrotrak ? 2 : 1) && <NotamView code={selectedCode} />}
                        </div>

                        { (hasMicrotrak || isSmall) && 
                            <div className="mt-4 md:mt-6 text-left md:hidden">
                                <a href="#" onClick={switchToMap} className="inline-flex items-center text-sm gap-1 px-3 py-1 rounded border border-gray-800 text-gray-800 hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all md:hidden">
                                    <TravelExploreIcon className="mr-2"/>{ "Localisation" }
                                </a>
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    );
};
