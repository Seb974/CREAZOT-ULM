"use client";

import React from "react";
import { Button } from '../../../common/ui/button';
import AddIcon from '@mui/icons-material/Add';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export const AirportsForm = ({ client, landings, setLandings, defaultLanding }) => {

    const handleAirportChange = (landing, e) => {
        const selectedCode = e.target.value;
        const selectedAirport = client.airportCodes.find(a => a.code === selectedCode);

        if (!selectedAirport) return;

        const newLandings = landings.map(l => l.id !== landing.id ? l : {...l, airportCode: selectedAirport.code, airportName: selectedAirport.nom });
        setLandings(newLandings);
    };

    const handleAdd = e => {
        e.preventDefault();
        const nextAvailable = client.airportCodes.find(a => !landings.some(l => l.airportCode === a.code));

        if (!nextAvailable) return;

        const { code, nom } = nextAvailable;
        const newLanding = { ...defaultLanding, id: +new Date(), airportCode: code, airportName: nom };
        setLandings([...landings, newLanding]);
    };

    const handleChange = (landing, e) => {
        const newLandings = landings.map(l => l.id !== landing.id ? l : {...l, [e.target.name]: e.target.value});
        setLandings(newLandings);
    };

    const handleDeleteLanding = (landing, e) => {
        e.preventDefault();
        if (landings.length > 1) {
            const sanitizedLandings = landings.filter(l => l.id !== landing.id);
            setLandings(sanitizedLandings);
        }
    };
    
    return (
        <>
          <div className="mt-8">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Atterrissage(s) effectué(s)
            </label>
            { landings.map((landing, index) => {
                const availableAirports = client.airportCodes.filter(a => {
                    const isAlreadySelected = landings.some(l => l.airportCode === a.code && l.id !== landing.id);
                    return !isAlreadySelected || a.code === landing.airportCode;
                });

                return (
                    <div key={index} className="mb-7">
                        <div className="md:flex md:items-center md:gap-4">
                            <div className="relative z-20 bg-white dark:bg-form-input w-full md:w-9/12 mb-4 md:mb-0">
                                <FlightLandIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80" />
                                <select
                                    value={landing.airportCode}
                                    onChange={(e) => handleAirportChange(landing, e)}
                                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                                >
                                    <option value="" disabled className="text-body dark:text-bodydark">
                                        Choisissez un aéroport
                                    </option>
                                    {availableAirports.map((airport, index) => (
                                        <option key={index} value={airport.code} className="text-body dark:text-bodydark">
                                            {airport.code + ' - ' + airport.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-3/12">
                                <Button
                                    onClick={(e) => handleDeleteLanding(landing, e)}
                                    aria-disabled={landings.length <= 1}
                                    className="w-full h-full flex justify-center rounded bg-red-500 text-sm font-medium text-white transition-colors hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 min-h-[50px]"
                                >
                                    <DeleteForeverIcon />
                                </Button>
                            </div>
                        </div>
                        <div className="md:flex md:gap-4 mt-4">
                            <div className="relative z-20 bg-white dark:bg-form-input w-full md:w-6/12 mb-4 md:mb-0">
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white bg-gray-50">
                                    Atterrissages complets
                                </label>
                                <input
                                    type="number"
                                    name="complets"
                                    min="0"
                                    placeholder="Nombre d'atterrissage(s) complet(s)"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={landing.complets}
                                    onChange={(e) => handleChange(landing, e)}
                                />
                            </div>

                            <div className="relative z-20 bg-white dark:bg-form-input w-full md:w-6/12">
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white bg-gray-50">
                                    Touchés
                                </label>
                                <input
                                    type="number"
                                    name="touches"
                                    min="0"
                                    placeholder="Nombre de touché(s)"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    value={landing.touches}
                                    onChange={(e) => handleChange(landing, e)}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={ e => handleAdd(e) } aria-disabled={ landings.length >= client.airportCodes.length } className="flex h-10 items-center rounded bg-green-500 px-4 text-sm font-medium text-white transition-colors hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" >
              <> <AddIcon/> Ajouter </>
            </Button>
          </div>
        </>
    );
};