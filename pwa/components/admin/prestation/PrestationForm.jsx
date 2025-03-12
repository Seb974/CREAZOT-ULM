"use client";

import React, { useState } from "react";
import { PilotForm } from "./Form/PilotForm";
import { AircraftForm } from "./Form/AircraftForm";
import { FlightForm } from "./Form/FlightForm";
import { FlightTimeForm } from "./Form/FlightTimeForm";
import {SubmitButton} from "./Form/SubmitButton";
import { useDataProvider } from "react-admin";
import { getCircuitDuration, getTotalPrice, getRealDuration, getCircuitPrice, isDefined } from '../../../app/lib/utils';

export const PrestationForm = () => {

  const dataProvider = useDataProvider();
  const [aircrafts, setAircrafts] = useState([]);
  const [selectedPilot, setSelectedPilot] = useState("");
  const [selectedAircraft, setSelectedAircraft] = useState("");
  const [selectedCircuits, setSelectedCircuits] = useState([]);
  const [selectedFlightTime, setSelectedFlightTime] = useState(0);

  const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';

  const handleSubmit = async e => {
      const prestation = {
        aeronef: selectedAircraft.id,
        pilote: isDefined(selectedPilot) && isObject(selectedPilot) ? (selectedPilot['@id'] || selectedPilot.id) : selectedPilot,
        date: new Date(),
        horametreDepart: selectedAircraft.horametre,
        horametreFin: typeof selectedFlightTime === 'string' ? parseFloat(selectedFlightTime.replace(',','.')) : selectedFlightTime,
        duree: getRealDuration(selectedFlightTime, selectedAircraft),
        turnover: getTotalPrice(selectedFlightTime, selectedAircraft, selectedCircuits),
        vols: selectedCircuits.map(c => {
            return {
              circuit: c.circuit.id,
              quantite: parseInt(c.quantite),
              duree: c.circuit.prixFixe ? getCircuitDuration(selectedAircraft, c.circuit, c.quantite) : getRealDuration(selectedFlightTime, selectedAircraft),
              option: c.option.id !== 0 ? c.option.id : null,
              prix: parseInt(c.quantite) * getCircuitPrice(c.circuit, c.option, selectedFlightTime, selectedAircraft)
            }
        })
      };
      dataProvider.create('prestations', {data: prestation});
  };


  return (
      <div className="w-full">
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <PilotForm 
                selectedPilot={ selectedPilot } 
                setSelectedPilot={ setSelectedPilot }
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
            />
            <FlightTimeForm
                aircrafts={ aircrafts }
                selectedAircraft={ selectedAircraft }
                selectedCircuits={ selectedCircuits }
                selectedFlightTime={ selectedFlightTime }
                setSelectedFlightTime={ setSelectedFlightTime }
            />
        </div>
        <div className="pl-7 py-6 flex justify-start gap-4 bg-gray-50">
           <SubmitButton
              selectedCircuits={ selectedCircuits }
              handleSubmit={ handleSubmit }
            />
        </div>
      </div>
  );
}
