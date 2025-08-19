"use client";

import 'flatpickr/dist/themes/material_red.css';
import React, { useState } from "react";
import { PilotForm } from "./Form/PilotForm";
import { AircraftForm } from "./Form/AircraftForm";
import { FlightForm } from "./Form/FlightForm";
import { AirportsForm } from "./Form/AirportsForm";
import { FlightTimeForm } from "./Form/FlightTimeForm";
import {SubmitButton} from "./Form/SubmitButton";
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { useRedirect, useNotify, useCreate, useDataProvider } from 'react-admin';
import { getCircuitDuration, getTotalPrice, getRealDuration, getCircuitPrice, isDefined, isValidDuration, isDefinedAndNotVoid } from '../../../app/lib/utils';
import { EncadrantForm } from './Form/EncadrantForm';
import { useClient } from '../../admin/ClientProvider';
import { clientWithLandingManagement, clientWithOptions, getDefaultLanding } from "../../../app/lib/client";

export const PrestationForm = () => {

    const notify = useNotify();
    const redirect = useRedirect();
    const [create] = useCreate();
    const { client } = useClient();
    const defaultLanding = getDefaultLanding(client);
    const [pilots, setPilots] = useState([]);
    const [encadrants, setEncadrants] = useState([]);
    const [date, setDate] = useState(new Date((new Date()).setHours(12, 0, 0)));
    const [aircrafts, setAircrafts] = useState([]);
    const [landings, setLandings] = useState([defaultLanding]);
    const [selectedPilot, setSelectedPilot] = useState("");
    const [selectedEncadrant, setSelectedEncadrant] = useState("");
    const [selectedAircraft, setSelectedAircraft] = useState("");
    const [selectedCircuits, setSelectedCircuits] = useState([]);
    const [selectedFlightTime, setSelectedFlightTime] = useState(0);
    const [remarques, setRemarques] = useState("Rien à signaler.");

    const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

    const handleSubmit = async e => {
        let landingAssigned = false;
        const prestation = {
            aeronef: selectedAircraft.id,
            pilote: isDefined(selectedPilot) && isObject(selectedPilot) ? (selectedPilot['@id'] || selectedPilot.id) : selectedPilot,
            encadrant: isDefined(selectedEncadrant) && isObject(selectedEncadrant) ? (selectedEncadrant['@id'] || selectedEncadrant.id) : (typeof selectedEncadrant === 'string' && selectedEncadrant === '' ? null : selectedEncadrant),
            horametreDepart: selectedAircraft.horametre,
            horametreFin: typeof selectedFlightTime === 'string' ? parseFloat(selectedFlightTime.replace(/[, :]/g, '.')) : selectedFlightTime,
            duree: getRealDuration(selectedFlightTime, selectedAircraft),
            turnover: getTotalPrice(selectedFlightTime, selectedAircraft, selectedCircuits),
            vols: selectedCircuits.map(c => {
                const formattedVol = {
                    circuit: c.circuit.id,
                    quantite: parseInt(c.quantite),
                    duree: c.circuit.prixFixe ? getCircuitDuration(selectedAircraft, c.circuit, c.quantite) : getRealDuration(selectedFlightTime, selectedAircraft),
                    option: clientWithOptions(client) && c.option.id !== 0 ? c.option.id : null,
                    prix: parseInt(c.quantite) * getCircuitPrice(c.circuit, c.option, selectedFlightTime, selectedAircraft)
                };
                if (clientWithLandingManagement(client)) {   
                    if (isDefined(c.circuit.requireLandingDeclaration) && c.circuit.requireLandingDeclaration && landings.length > 0 && !landingAssigned) {
                        landingAssigned = true;
                        return {...formattedVol, landings: landings.map(({id, ...l}) => ({...l, complets: parseInt(l.complets, 10), touches: parseInt(l.touches, 10)}))}
                    } else {
                        const {id, ...defaultLand} = defaultLanding;
                        return isDefined(c.circuit.hadDefaultLanding) && c.circuit.hadDefaultLanding ?
                            {...formattedVol, landings: [{...defaultLand, complets: parseInt(c.quantite) * parseInt(defaultLand.complets, 10), touches: parseInt(defaultLand.touches, 10)}]}
                          : {...formattedVol, landings: []}
                    }
                }
                return formattedVol;
            }),
            date,
            remarques
        };
        try {
            create('prestations', {data: prestation});
            notify('Les vols ont bien été enregistrés.', { type: 'info' });
            redirect('list', 'prestations');
        } catch (error) {
            notify(`Une erreur bloque l\'enregistrement des vols.`, { type: 'error' });
            redirect('list', 'prestations');
            console.log(error);
        }
    };

  return (
      <div className="w-full">
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <div className="mb-4">
                <label htmlFor="debut" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
                <Flatpickr
                    name="debut"
                    value={ date }
                    onChange={ datetime => setDate(new Date((new Date(datetime[0])).setHours(12, 0, 0))) }
                    className="form-control form-control-sm border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    options={{
                        enableTime: false,
                        dateFormat: "d/m/Y",
                        mode: "single",
                        locale: French,
                        static: true,
                        disableMobile: "true"
                    }}
                />
            </div>
            <PilotForm
                selectedPilot={ selectedPilot } 
                setSelectedPilot={ setSelectedPilot }
                pilots={ pilots } 
                setPilots={ setPilots }
                setEncadrants={ setEncadrants }
            />
            <AircraftForm 
                selectedAircraft={ selectedAircraft }
                setSelectedAircraft={ setSelectedAircraft }
                aircrafts={ aircrafts }
                setAircrafts={ setAircrafts }
            />
            <FlightForm
                selectedCircuits={ selectedCircuits }
                setSelectedCircuits={ setSelectedCircuits }
                selectedAircraft={ selectedAircraft }
                selectedFlightTime={ selectedFlightTime }
                selectedPilot={ selectedPilot }
                date={ date }
            />
            <FlightTimeForm
                aircrafts={ aircrafts }
                selectedAircraft={ selectedAircraft }
                selectedCircuits={ selectedCircuits }
                selectedFlightTime={ selectedFlightTime }
                setSelectedFlightTime={ setSelectedFlightTime }
            />
            <EncadrantForm
                selectedPilot={ selectedPilot } 
                encadrants={ encadrants }
                selectedEncadrant={ selectedEncadrant }
                setSelectedEncadrant={ setSelectedEncadrant }
                selectedCircuits={ selectedCircuits }
                autoSelect={ true }
            />
            { clientWithLandingManagement(client) && selectedCircuits.find(({circuit}) => circuit.requireLandingDeclaration) !== undefined && isDefinedAndNotVoid(client.airportCodes) && 
                <AirportsForm
                    client={ client }
                    landings={ landings }
                    setLandings={ setLandings } 
                    defaultLanding={ defaultLanding }
                />
            }
            <div className="mt-7">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Remarque(s)
                </label>
                <textarea 
                    id="remarques" 
                    name="remarques" 
                    rows="4" 
                    placeholder="Une particularité à préciser ?"
                    className="w-full rounded border-[1.5px] border-stroke bg-white px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={(e) => setRemarques( e.target.value)}
                    value={ remarques }
                >
                </textarea>
            </div>
        </div>
        <div className="pl-7 py-6 flex justify-start gap-4 bg-gray-50">
           <SubmitButton
                selectedCircuits={ selectedCircuits }
                handleSubmit={ handleSubmit }
                isValid={ isValidDuration(selectedFlightTime, selectedAircraft) }
            />
        </div>
      </div>
  );
}
