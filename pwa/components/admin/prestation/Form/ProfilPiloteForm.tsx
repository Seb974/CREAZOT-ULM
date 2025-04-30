"use client";

import React, { useEffect, useState } from "react";
import BadgeIcon from '@mui/icons-material/Badge';
import { useDataProvider } from "react-admin";
import { isDefined } from "../../../../app/lib/utils";

// @ts-ignore
export const ProfilPiloteForm: React.FC = ({ selectedPilot, setSelectedPilot, pilots, setPilots, eligiblePilots, setEligiblePilots, selectedCircuit, autoSelect = true}) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsPilotSelected(true);

  const [isPilotSelected, setIsPilotSelected] = useState<boolean>(false);

  useEffect(() => getProfiles(), []);

  const getProfiles = () => {
    dataProvider
      .getList('profil_pilotes', {})
      .then(({ data }) => {
          const pilots = data.map(({pilote, ...profil}) => ({...pilote, profil}));
          setPilots(pilots);
          if (autoSelect)
            setSelectedPilot(pilots[0]);
      })
  };

  return (
        <div className="my-2">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Pilote
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            <BadgeIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>

            <select
              value={ isDefined(selectedPilot) && isDefined(selectedPilot['@id']) ? selectedPilot['@id'] : "" }
              onChange={(e) => {
                const newPilot = e.target.value !== "" ? eligiblePilots.find(p => p['@id'] === e.target.value) : "";
                setSelectedPilot(newPilot);
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent px-12 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isPilotSelected ? "text-black dark:text-white" : ""
              } h-[41px]`}
            >
              <option value="" disabled className="text-body dark:text-bodydark">
                Choisissez un pilote
              </option>
              { eligiblePilots.map(pilot => <option key={ pilot.id } value={ pilot['@id'] } className="text-body dark:text-bodydark">{ pilot.firstName.charAt(0).toUpperCase() + pilot.firstName.slice(1) }</option>)}
            </select>
          </div>
        </div>
  );
}

