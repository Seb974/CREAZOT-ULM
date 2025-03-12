"use client";

import React, { useEffect } from "react";

// @ts-ignore
export const FlightTimeForm: React.FC = ({ aircrafts, selectedAircraft, selectedCircuits, selectedFlightTime, setSelectedFlightTime }) => {

  useEffect(() => {
    if (selectedAircraft !== null && selectedAircraft !== undefined) { 
      if (selectedCircuits.find(c => !c.circuit.prixFixe) === undefined) {
        const newFlightTime = selectedAircraft.decimal ? 
            getTimeInDecimal(selectedAircraft, selectedCircuits) : 
            getTimeInMinutes(selectedAircraft, selectedCircuits);
            setSelectedFlightTime(newFlightTime);
      } else 
        setSelectedFlightTime(selectedAircraft.horametre);
    }

  }, [selectedAircraft, selectedCircuits]);

  const getDecimalTime = time => new Date(time).getHours() + new Date(time).getMinutes()/60;

  const HandleChange = e => setSelectedFlightTime(e.target.value);

  const getCircuitTimeInMinutes = (sum, time, qte) => {
      const currentTimeHours = new Date(time).getHours() + Number((new Date(time).getMinutes()).toFixed(2)) / 60;
      const sumTimeHours =  Math.floor(sum) + Number((sum - Math.floor(sum)).toFixed(2)) / 60;
      const totalHours = currentTimeHours * qte + sumTimeHours;
      return Number((Math.floor(totalHours) + Number((totalHours - Math.floor(totalHours)).toFixed(2)) * 60 / 100).toFixed(2));
  };

  const getTimeInDecimal = ({ horametre }, circuits) => {
    const circuitTime = circuits.reduce((sum, {quantite, circuit}) => sum += (quantite * getDecimalTime(circuit.duree)), 0);
    return Number((circuitTime + horametre).toFixed(1));
  };

  const getTimeInMinutes = ({ horametre }, circuits) => {
    const circuitTime = circuits.reduce((sum, { circuit, quantite }) => sum = getCircuitTimeInMinutes(sum, circuit.duree, quantite), 0);
    const aircraftHours = Math.floor(horametre) + Number((horametre - Math.floor(horametre)).toFixed(2)) / 60 * 100;
    const circuitHours = Math.floor(circuitTime) + Number((circuitTime - Math.floor(circuitTime)).toFixed(2)) / 60 * 100;
    const totalHours = aircraftHours + circuitHours;
    return Number((Math.floor(totalHours) + Number((totalHours - Math.floor(totalHours)).toFixed(2)) * 60 / 100).toFixed(2));
  };

  return (
        <div className="mt-7">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Horamètre
              </label>
            <div className="flex">
              <div className="relative z-20 bg-white dark:bg-form-input mt-2 w-full">  
                    <input
                      type="text"
                      name="horametre"
                      placeholder="Horamètre"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={ selectedFlightTime || 0 }
                      onChange={ e => HandleChange(e) }
                    />
                </div>
            </div>
        </div>

  );
}

