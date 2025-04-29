"use client";

import React, { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";
import { OneFlightForm } from "./OneFlightForm";
import { Button } from '../../../common/ui/button';
import AddIcon from '@mui/icons-material/Add';
import { getCircuitPrice, isDefined, isDefinedAndNotVoid } from '../../../../app/lib/utils';

export const FlightForm = ({ selectedCircuits, setSelectedCircuits, selectedAircraft, selectedFlightTime, selectedPilot }) => {

  const defaultOption = {id: 0, prix: 0};
  const dataProvider = useDataProvider();

  const [circuits, setCircuits] = useState([]);
  const [options, setOptions] = useState([]);
  const [availableCircuits, setAvailableCircuits] = useState([]);
  const [disableOption, setDisableOption] = useState(false);
  const [disableAdd, setDisableAdd] = useState(false);
  
  useEffect(() => {
    getCircuits();
    getOptions();
  }, []);

  useEffect(() => {
    if (isDefinedAndNotVoid(circuits) && isDefined(selectedPilot) && isDefined(selectedPilot.profil))
      getAvailableCircuits(circuits, selectedPilot.profil.qualifications);
  }, [circuits, selectedPilot]);

  useEffect(() => {
    const circuitWithNoFixedPrice = selectedCircuits.find(c => !c.circuit.prixFixe);
    if (isDefined(circuitWithNoFixedPrice)) {
        setDisableOption(false);
        setDisableAdd(true);
    } else {
        setDisableOption(selectedCircuits.length > 1);
        setDisableAdd(false);
    }
  }, [selectedCircuits]);

  const getCircuits = () => {
    dataProvider
        .getList('circuits', {})
        .then(({ data }) => setCircuits(data));
  };

  const getOptions = () => {
    dataProvider
        .getList('options', {})
        .then(({ data }) => setOptions(data));
  };

  const getAvailableCircuits = (circuits, userQualifications) => {
    if (isDefinedAndNotVoid(userQualifications)) {
      const availables = circuits.filter(circuit =>
        Array.isArray(circuit.qualifications) &&
        circuit.qualifications.map(q => q['@id']).some(q => (userQualifications.map(q => q['@id']) || []).includes(q))
      );
      setAvailableCircuits(availables);
      if (availables.length > 0)
        setSelectedCircuits([{ ident: new Date().valueOf(), circuit: availables[0], quantite: 1, details: availables[0].nom, duree: availables[0].duree, option: defaultOption, prix: getCircuitPrice(availables[0], defaultOption, selectedFlightTime, selectedAircraft) }])
      else
        setDisableAdd(true);
      return ;
    } else {
      const voids = circuits.filter(c => !isDefinedAndNotVoid(c.qualifications));
      setAvailableCircuits(voids);
      if (voids.length > 0)
        setSelectedCircuits([{ ident: new Date().valueOf(), circuit: voids[0], quantite: 1, details: voids[0].nom, duree: voids[0].duree, option: defaultOption, prix: getCircuitPrice(voids[0], defaultOption, selectedFlightTime, selectedAircraft) }])
      else
        setDisableAdd(true);
      return ;
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!disableAdd)
        setSelectedCircuits([...selectedCircuits, { ident: new Date().valueOf(), circuit: availableCircuits[0], quantite: 1, details: availableCircuits[0].nom, option: defaultOption, prix: getCircuitPrice(availableCircuits[0], defaultOption, selectedFlightTime, selectedAircraft) }])
  };

  const handleCircuitChange = (selectedCircuit, e) => {
    const newCircuit = circuits.find(c => `${c.id}` === `${e.target.value}`) || availableCircuits[0];
    const newSelection = selectedCircuits.map(s => {
      const newOption = newCircuit.avecOptions ? s.option : defaultOption;
      return s.ident !== selectedCircuit.ident ? s : 
          { ...s, 
            circuit: newCircuit, 
            details: newCircuit.nom, 
            quantite: newCircuit.prixFixe ? s.quantite : 1,
            option: newOption,
            prix: getCircuitPrice(newCircuit, newOption, selectedFlightTime, selectedAircraft)
          }
    });
    setSelectedCircuits(newSelection);
  };

  const handleQuantityChange = (selectedCircuit, e) => {
    const newSelection = selectedCircuits.map(s => s.ident === selectedCircuit.ident ? {...s, quantite: e.target.value} : s);
    setSelectedCircuits(newSelection);
  };

  const handleDeleteCircuit = (selectedCircuit, e) => {
    e.preventDefault();
    if (selectedCircuits.length > 1) {
      const newSelection = selectedCircuits.filter(s => s.ident !== selectedCircuit.ident);
      setSelectedCircuits(newSelection);
    }
  };

  const handleOptionChange = (selectedCircuit, e) => {
    const newOption = options.find(o => `${o.id}` === `${e.target.value}`) || defaultOption;
    const newSelection = selectedCircuits.map(s => s.ident === selectedCircuit.ident ? {...s, option: newOption, prix: getCircuitPrice(s.circuit, newOption, selectedFlightTime, selectedAircraft)} : s);
    setSelectedCircuits(newSelection);
  };

  return (
        <>
          <div className="mt-4">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Vol(s) effectué(s)
            </label>

            { selectedCircuits.map(selectedCircuit => {
                return( 
                    <OneFlightForm
                      key={ selectedCircuit.ident }
                      circuits={ availableCircuits }
                      options={ options }
                      selectedCircuit={ selectedCircuit }
                      selectedCircuits={ selectedCircuits }
                      handleCircuitChange={ handleCircuitChange }
                      handleQuantityChange={ handleQuantityChange }
                      handleDeleteCircuit={ handleDeleteCircuit }
                      handleOptionChange={ handleOptionChange }
                      disableOption={ disableOption }
                    />
                )
            })}
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={ e => handleAdd(e) } aria-disabled={ disableAdd } className="flex h-10 items-center rounded bg-green-500 px-4 text-sm font-medium text-white transition-colors hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" >
              <>
                <AddIcon/>
                Ajouter
              </>
            </Button>
          </div>
        </>
  );
}

