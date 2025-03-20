"use client";

import React, { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import { isDefined } from "../../../../app/lib/utils";

// @ts-ignore
export const OptionForm: React.FC = ({ selectedOption, setSelectedOption, isUpdate = false, reservation = null}) => {

  const dataProvider = useDataProvider();
  const changeTextColor = () => setIsOptionSelected(true);

  const [options, setOptions] = useState([]);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  useEffect(() => {
    dataProvider
        .getList('options', {})
        .then(({ data }) => {
            setOptions(data);
            if (isUpdate && reservation !== null && reservation !== undefined)
              setSelectedOption(reservation.option || "");
        })

  }, []);

  return (
        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Option
          </label>

          <div className="relative z-20 bg-white dark:bg-form-input">
            { selectedOption === "" ? 
                <NoPhotographyIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/> :
                <AddAPhotoIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>
            }
            <select
              value={ isDefined(selectedOption) && isDefined(selectedOption['@id']) ? selectedOption['@id'] : ""}
              onChange={(e) => {
                const newOptions = e.target.value !== "" ? options.find(o => o['@id'] === e.target.value) : "";
                setSelectedOption(newOptions);
                changeTextColor();
              }}
              className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                isOptionSelected ? "text-black dark:text-white" : ""
              }`}
            >
              <option value="" className="text-body dark:text-bodydark">
                Aucune option
              </option>
              { options.map(option => <option key={ option.id } value={ option['@id'] } className="text-body dark:text-bodydark">{ option.nom }</option>)}
            </select>
          </div>
        </div>
  );
}

