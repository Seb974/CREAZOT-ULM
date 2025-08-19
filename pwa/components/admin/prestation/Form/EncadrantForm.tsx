"use client";

import React, { useEffect, useState } from "react";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { isDefined, isDefinedAndNotVoid } from "../../../../app/lib/utils";

// @ts-ignore
export const EncadrantForm: React.FC = ({ selectedPilot, encadrants, selectedEncadrant, setSelectedEncadrant, selectedCircuits, autoSelect = true}) => {

  const changeEncadrantTextColor = () => setIsEncadrantSelected(true);

  const [encadrantNeeded, setEncadrantNeeded] = useState(false);
  const [isEncadrantSelected, setIsEncadrantSelected] = useState<boolean>(false);

  useEffect(() => {
      const circuitNeedingEncadrant = selectedCircuits.find(c => isDefined(c.circuit.needsEncadrant) && c.circuit.needsEncadrant);
      if (isDefined(circuitNeedingEncadrant)) {
        setEncadrantNeeded(true);
        if (autoSelect && isDefinedAndNotVoid(encadrants))
          setSelectedEncadrant(encadrants[0]);
      } else {
        setEncadrantNeeded(false);
        setSelectedEncadrant("");
      }
  }, [selectedCircuits]);

  const hasQualification = pilote => isDefined(pilote) && isDefined(pilote.profil) && isDefinedAndNotVoid(pilote.profil.pilotQualifications) 

  return (
        <div className="mb-2 mt-4">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Encadrant
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            <AdminPanelSettingsIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>

            <select
              disabled={ !encadrantNeeded }
              value={ isDefined(selectedEncadrant) && isDefined(selectedEncadrant['@id']) ? selectedEncadrant['@id'] : "" }
              onChange={(e) => {
                const newEncadrant = e.target.value !== "" ? encadrants.find(p => p['@id'] === e.target.value) : "";
                setSelectedEncadrant(newEncadrant);
                changeEncadrantTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent px-12 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input disabled:cursor-default disabled:bg-whiter ${
                isEncadrantSelected ? "text-black dark:text-white" : ""
              } h-[41px]`}
            >
              <option value="" className="text-body dark:text-bodydark" disabled={ !hasQualification(selectedPilot) }>  
                { encadrantNeeded ? "Aucun encadrant" : "Encadrant non requis"}
              </option>
              { encadrants.map(encadrant => <option key={ encadrant.id } value={ encadrant['@id'] } className="text-body dark:text-bodydark">{ encadrant.firstName.charAt(0).toUpperCase() + encadrant.firstName.slice(1) }</option>)}
            </select>
          </div>
        </div>
  );
}

