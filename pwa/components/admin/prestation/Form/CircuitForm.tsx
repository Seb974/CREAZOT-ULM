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
  //   const [loading, setLoading] = useState<boolean>(false);

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
        // .catch(error => setLoading(false))

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

            <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.8">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="#637381"
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </div>
  );
}

