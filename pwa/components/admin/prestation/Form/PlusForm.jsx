"use client";

import 'flatpickr/dist/themes/material_red.css';
import React, { useState } from "react";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";

export const PlusForm = ({ consumer, setConsumer }) => {

  const changeTextColor = () => setIsStatusSelected(true);

  const [isStatusSelected, setIsStatusSelected] = useState(false);

  const toggleReport = e => setConsumer({...consumer, report: !consumer.report});

  const onDateChange = datetime => setConsumer({...consumer, debut: new Date(datetime[0])});

  return (
      <div className="space-y-4" style={{ zIndex: 3000 }}>
        <div>
        <label htmlFor="debut" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date et heure de décollage</label>
          <Flatpickr
              name="debut"
              value={ consumer.debut }
              onChange={ onDateChange }
              className="form-control form-control-sm border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
              options={{
                  enableTime: true,
                  time_24hr: true,
                  dateFormat: "d/m/Y - H:i",
                  mode: "single",
                  minDate: 'today',
                  minTime:"06:00",
                  maxTime:"18:00",
                  locale: French,
                  static: true
              }}
              style={{ height: "35px" }}
          />
        </div>
        <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Adresse email</label>
            <input 
                type="email" 
                name="email" 
                id="email"
                value={ consumer.email }
                onChange={(e) => setConsumer({...consumer, email: e.target.value})}
                className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                placeholder="Email"
                required
            />
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
              value={ consumer.remarques }
            >
            </textarea>
        </div>
        <div className="mb-6">
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
          </div>
        </div>
        <div className="mt-6">
          <label className="inline-flex items-center me-5 cursor-pointer mt-4">
              <input type="checkbox" value="" className="sr-only peer" checked={ consumer.report } onChange={ toggleReport }/>
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500 dark:peer-checked:bg-orange-500"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Vol reporté</span>
          </label>
        </div>
      </div>
  );
}

