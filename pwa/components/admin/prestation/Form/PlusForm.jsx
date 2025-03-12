"use client";

import React, { useState } from "react";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import zIndex from "@mui/material/styles/zIndex";

export const PlusForm = ({ consumer, setConsumer }) => {

  const changeTextColor = () => setIsStatusSelected(true);

  const [isStatusSelected, setIsStatusSelected] = useState(false);

  return (
      <div className="space-y-4" style={{ zIndex: 3000 }}>
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Statut
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            { consumer.statut === "VALIDATED" ? 
                <DoneIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-green-500"/> :
              consumer.statut === "WAITING" ?
                <HourglassTopIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-yellow-400"/> :
                <ClearIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-red-500"/>
             }
            <select
              value={ consumer.statut }
              onChange={(e) => {
                setConsumer({...consumer, statut: e.target.value});
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isStatusSelected ? "text-black dark:text-white" : ""
              }`}
            >
              <option value="VALIDATED" className="text-body dark:text-bodydark">
                Validé
              </option>
              <option value="WAITING"  className="text-body dark:text-bodydark">
                En attente de confirmation
              </option>
              <option value="WEATHER_CANCEL" className="text-body dark:text-bodydark">
                Annulation météo
              </option>
              <option value="PASSENGER_CANCEL" className="text-body dark:text-bodydark">
                Annulation client
              </option>
              <option value="INTERN_CANCEL" className="text-body dark:text-bodydark">
                Annulation interne
              </option>
            </select>

            {/* <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
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
            </span> */}
          </div>
        </div>
        <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
               Remarque(s)
            </label>
            <textarea 
              id="remarques" 
              name="remarques" 
              rows="6" 
              placeholder="Une particularité à préciser ?"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={(e) => setConsumer({...consumer, remarques: e.target.value})}
            >
              { consumer.remarques }
            </textarea>
        </div>
      </div>
  );
}

