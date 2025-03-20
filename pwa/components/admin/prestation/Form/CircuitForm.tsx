"use client";

import React, { useEffect, useState } from "react";
import PublicIcon from '@mui/icons-material/Public';
import { useDataProvider } from "react-admin";
import { isDefined } from "../../../../app/lib/utils";

// @ts-ignore
export const CircuitForm: React.FC = ({ selectedCircuit, setSelectedCircuit, isUpdate = false, reservation = null}) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsCircuitSelected(true);

  const [circuits, setCircuits] = useState([]);
  const [isCircuitSelected, setIsCircuitSelected] = useState<boolean>(false);

  useEffect(() => {
    dataProvider
        .getList('circuits', {})
        .then(({ data }) => {
            setCircuits(data);
            if (!isUpdate)
              setSelectedCircuit(data[0]);
            else {
              if (reservation !== null && reservation !== undefined)
                setSelectedCircuit(reservation.circuit || "");
            }
        })

  }, []);

  return (
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Circuit
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            <PublicIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>

            <select
              value={ isDefined(selectedCircuit) && isDefined(selectedCircuit['@id']) ? selectedCircuit['@id'] : 0 }
              onChange={(e) => {
                const newCircuit = circuits.find(c => c['@id'] === e.target.value);
                setSelectedCircuit(newCircuit);
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isCircuitSelected ? "text-black dark:text-white" : ""
              }`}
            >
              <option value="" disabled className="text-body dark:text-bodydark">
                Choisissez un circuit
              </option>
              { circuits.map(circuit => <option key={ circuit.id } value={ circuit['@id'] } className="text-body dark:text-bodydark">{ circuit.code }</option>)}
            </select>
          </div>
        </div>
  );
}

