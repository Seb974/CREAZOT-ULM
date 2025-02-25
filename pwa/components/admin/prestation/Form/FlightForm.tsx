"use client";

import React, { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";
import { OneFlightForm } from "./OneFlightForm";
import { Button } from '../../../common/ui/button';
import AddIcon from '@mui/icons-material/Add';
import { getCircuitPrice } from '../../../../app/lib/utils';

export const FlightForm: React.FC = ({ selectedCircuits, setSelectedCircuits, selectedAircraft, selectedFlightTime }) => {

  const defaultOption = {id: 0, prix: 0};
  const dataProvider = useDataProvider();

  const [circuits, setCircuits] = useState([]);
  const [options, setOptions] = useState([]);
  const [disableOption, setDisableOption] = useState<boolean>(false);
  const [disableAdd, setDisableAdd] = useState<boolean>(false);
  
  useEffect(() => {
    getCircuits();
    getOptions();
  }, []);

  useEffect(() => {
    const circuitWithNoFixedPrice = selectedCircuits.find(c => !c.circuit.prixFixe);
    if (circuitWithNoFixedPrice !== undefined && circuitWithNoFixedPrice !== null) {
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
        .then(({ data }) => {
            setCircuits(data);
            setSelectedCircuits([{ ident: new Date().valueOf(), circuit: data[0], quantite: 1, details: data[0].nom, duree: data[0].duree, option: defaultOption, prix: getCircuitPrice(data[0], defaultOption, selectedFlightTime, selectedAircraft) }])
    });
  };

  const getOptions = () => {
    dataProvider
        .getList('options', {})
        .then(({ data }) => {
            setOptions(data);
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!disableAdd)
        setSelectedCircuits([...selectedCircuits, { ident: new Date().valueOf(), circuit: circuits[0], quantite: 1, details: circuits[0].nom, option: defaultOption, prix: getCircuitPrice(circuits[0], defaultOption, selectedFlightTime, selectedAircraft) }])
  };

  const handleCircuitChange = (selectedCircuit, e) => {
    const newCircuit = circuits.find(c => `${c.id}` === `${e.target.value}`) || circuits[0];
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
                      circuits={ circuits }
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

