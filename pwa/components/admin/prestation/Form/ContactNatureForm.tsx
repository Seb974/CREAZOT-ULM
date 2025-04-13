"use client";

import React, { useEffect, useState } from "react";
import PublicIcon from '@mui/icons-material/Public';
import { useDataProvider } from "react-admin";
import { isDefined } from "../../../../app/lib/utils";

// @ts-ignore
export const ContactNatureForm: React.FC = ({ selectedSource, setSelectedSource, isUpdate = false, reservation = null}) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsSourceSelected(true);

  const [sources, setSources] = useState([]);
  const [isSourceSelected, setIsSourceSelected] = useState<boolean>(false);

  useEffect(() => {
    dataProvider
        .getList('sources', {})
        .then(({ data }) => {
            setSources(data);
            if (!isUpdate)
              setSelectedSource(data[0]);
            else {
              if (reservation !== null && reservation !== undefined)
                setSelectedSource(reservation.circuit || "");
            }
        })

  }, []);

  return (
        <div className="relative z-20 bg-white dark:bg-form-input">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Origine du contact
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            <PublicIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>

            <select
              value={ isDefined(selectedSource) && isDefined(selectedSource['@id']) ? selectedSource['@id'] : 0 }
              onChange={(e) => {
                const newSource = sources.find(c => c['@id'] === e.target.value);
                setSelectedSource(newSource);
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isSourceSelected ? "text-black dark:text-white" : ""
              }`}
            >
              <option value="" disabled className="text-body dark:text-bodydark">
                  Iconnu
              </option>
              { sources.map(source => <option key={ source.id } value={ source['@id'] } className="text-body dark:text-bodydark">{ source.nom }</option>)}
            </select>
          </div>
        </div>
  );
}

