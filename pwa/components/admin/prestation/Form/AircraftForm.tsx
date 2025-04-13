"use client";

import React, { useEffect, useState } from "react";
import FlightIcon from '@mui/icons-material/Flight';
import { useDataProvider } from "react-admin";
import { isDefined } from "../../../../app/lib/utils";

// @ts-ignore
export const AircraftForm: React.FC = ({ selectedAircraft, setSelectedAircraft, aircrafts, setAircrafts, autoSelect = true }) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsAircraftSelected(true);

  const [isAircraftSelected, setIsAircraftSelected] = useState<boolean>(false);

  useEffect(() => {
    dataProvider
        .getList('aeronefs', {})
        .then(({ data }) => {
          setAircrafts(data);
          if (autoSelect)
            setSelectedAircraft(data[0]);
        })
  }, []);

  const handleAircraftChange = e => {
    changeTextColor();
    const newAircraft = aircrafts.find(a => a['@id'] === e.target.value);
    setSelectedAircraft(newAircraft);
  };

  return (
        <div className="my-2">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Aéronef
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            <FlightIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>

            <select
              value={ isDefined(selectedAircraft) && isDefined(selectedAircraft['@id']) ? selectedAircraft['@id'] : 0 }
              onChange={ e => handleAircraftChange(e) }
              className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent px-12 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isAircraftSelected ? "text-black dark:text-white" : ""
              } h-[41px]`}
            >
              <option value="" className="text-body dark:text-bodydark">
                Choisissez un aéronef
              </option>
              { aircrafts.map(aircraft => <option key={ aircraft.id } value={ aircraft['@id'] } className="text-body dark:text-bodydark">{ aircraft.immatriculation }</option>)}
            </select>
          </div>
        </div>
  );
}

