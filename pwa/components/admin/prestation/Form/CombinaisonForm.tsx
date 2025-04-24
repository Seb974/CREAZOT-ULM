"use client";

import React, { useEffect, useState } from "react";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import { useDataProvider } from "react-admin";
import { isDefined } from "../../../../app/lib/utils";

// @ts-ignore
export const CombinaisonForm: React.FC = ({ selectedCombinaison, setSelectedCombinaison, quantite }) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsCircuitSelected(true);

  const [combinaisons, setCombinaisons] = useState([]);
  const [isCircuitSelected, setIsCircuitSelected] = useState<boolean>(false);

  useEffect(() => getCombinaisons(), []);

  const getCombinaisons = () => {
    dataProvider
        .getList('combinaisons', {})
        .then(({ data }) => setCombinaisons(data))
  };

  return (
        <div className={`relative z-20 bg-white dark:bg-form-input pb-[4px]`}>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Option
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            { selectedCombinaison === "" ? 
                <NoPhotographyIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/> :
                <AddAPhotoIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>
            }
            <select
              value={ isDefined(selectedCombinaison) && isDefined(selectedCombinaison['@id']) ? selectedCombinaison['@id'] : "" }
              onChange={(e) => {
                const newCombinaison = combinaisons.find(c => c['@id'] === e.target.value);
                setSelectedCombinaison(newCombinaison);
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent px-12 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isCircuitSelected ? "text-black dark:text-white" : ""
              } h-[41px]`}
            >
              <option value="" className="text-body dark:text-bodydark">
                Sans option
              </option>
              { combinaisons.map(combinaison => <option key={ combinaison.id } value={ combinaison['@id'] } className="text-body dark:text-bodydark" disabled={ combinaison.minPassager > quantite }>{ combinaison.nom }</option>)}
            </select>
          </div>
        </div>
  );
}

