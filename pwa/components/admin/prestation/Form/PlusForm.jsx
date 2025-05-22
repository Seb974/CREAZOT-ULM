"use client";

import 'flatpickr/dist/themes/material_red.css';
import React, { useState, useEffect } from "react";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import UpdateIcon from '@mui/icons-material/Update';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import Select from 'react-select';
import { useDataProvider } from "react-admin";
import { clientWithOriginContact, clientWithPartners } from '../../../../app/lib/client';

export const PlusForm = ({ consumer, setConsumer, selectedInitialContact, setSelectedInitialContact, selectedOriginContact, setSelectedOriginContact, previousPaidValue, setPreviousPaidValue, client }) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsStatusSelected(true);

  const status = [
    {value:"VALIDATED", label: "Validé"},
    {value:"WAITING", label: "En attente de confirmation"},
    {value:"WEATHER_REPORT", label: "Report météo"},
    {value:"PASSENGER_REPORT", label: "Report client"},
    {value:"INTERN_REPORT", label: "Report interne"},
    {value:"WEATHER_CANCEL", label: "Annulation météo"},
    {value:"PASSENGER_CANCEL", label: "Annulation client"},
    {value:"INTERN_CANCEL", label: "Annulation interne"}
  ];

  const [contacts, setContacts] = useState([]);
  const [origines, setOrigines] = useState([]);
  const [previousStatus, setPreviousStatus] = useState(consumer.statut);
  const [availableStatus, setAvailableStatus] = useState(status);
  const [isStatusSelected, setIsStatusSelected] = useState(false);

  useEffect(() => {
    getContacts();
    getOrigines();
  }, []);

  useEffect(() => {
    if (consumer.report) {
      setPreviousStatus(consumer.statut);
      const reportStatuts = status.filter(s => s.value.includes("REPORT"));
      setAvailableStatus(reportStatuts);
      if (reportStatuts.find(s => s.value === consumer.statut) === undefined)
        setConsumer({...consumer, statut: reportStatuts[0].value});
    } else {
      setAvailableStatus(status);
      setConsumer({...consumer, statut: previousStatus});
    }
  }, [consumer.report])

  const toggleSwitch = ({ target }) => {
    const { id, checked } = target;
    setConsumer({...consumer, [id]: checked});
    if (id === 'paid')
        setPreviousPaidValue(checked);
  };

  const getContacts = () => {
      dataProvider
        .getList('contacts', {})
        .then(({ data }) => setContacts(data.map(d => ({...d, value: d['@id']}))));
  };

  const getOrigines = () => {
    dataProvider
      .getList('origines', {})
      .then(({ data }) => setOrigines(data.map(d => ({...d, value: d['@id']}))));
};

  return (
      <div className="space-y-4" style={{ zIndex: 3000 }}>
        { clientWithOriginContact(client) && 
          <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Contact initial
              </label>
              <Select
                closeMenuOnSelect={false}
                className="basic-multi-select z-50"
                value={ selectedInitialContact }
                isMulti
                options={ contacts }
                onChange={ e => setSelectedInitialContact(e) }
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    minHeight: '41px',
                    zIndex: 999
                  }),
                }}
              />
          </div>
        }
        { clientWithPartners(client) &&
          <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Origine du contact
              </label>
              <Select
                closeMenuOnSelect={false}
                className="basic-multi-select z-40"
                value={ selectedOriginContact }
                isMulti
                options={ origines }
                onChange={ e => setSelectedOriginContact(e) }
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    minHeight: '41px',
                    zIndex: 990
                  }),
                }}
              />
          </div>
        }
        <div className="mb-2">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Statut
          </label>
          <div className="relative z-20 bg-white dark:bg-form-input">
            { consumer.statut === "VALIDATED" ? 
                <DoneIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-green-500"/> :
              consumer.statut === "WAITING" ?
                <HourglassTopIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-yellow-400"/> :
              consumer.statut.includes("REPORT") ?
                <UpdateIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-blue-500"/> :
                <ClearIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-red-500"/>
             }
            <select
              value={ consumer.statut }
              onChange={(e) => {
                setConsumer({...consumer, statut: e.target.value});
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isStatusSelected ? "text-black dark:text-white" : ""
              } h-[41px]`}
            >
              { availableStatus.map(({value, label}, i) => <option key={i} value={ value } className="text-body dark:text-bodydark">{ label }</option> )}
            </select>
          </div>
        </div>
        <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
               Remarque(s)
            </label>
            <textarea 
              id="remarques" 
              name="remarques" 
              rows="3" 
              placeholder="Une particularité à préciser ?"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={(e) => setConsumer({...consumer, remarques: e.target.value})}
              value={ consumer.remarques }
            >
            </textarea>
        </div>
        <div className="mt-0 flex justify-between items-center">
          <div>
            <label className="inline-flex items-center me-5 cursor-pointer mt-2">
                <input type="checkbox" id="paid" className="sr-only peer" onChange={ toggleSwitch } checked={ consumer.paid }/>
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Payé</span>
            </label>
          </div>
          <div>
            <label className="inline-flex items-center me-5 cursor-pointer mt-2">
                <input type="checkbox" id="upsell" className="sr-only peer" onChange={ toggleSwitch } checked={ consumer.upsell }/>
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600 dark:peer-checked:bg-teal-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Upsell</span>
            </label>
          </div> 
          <div>
            <label className="inline-flex items-center me-5 cursor-pointer mt-2">
                <input type="checkbox" id="report" className="sr-only peer" onChange={ toggleSwitch } checked={ consumer.report }/>
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500 dark:peer-checked:bg-orange-500"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Report</span>
            </label>
          </div>
        </div>
      </div>
  );
}

