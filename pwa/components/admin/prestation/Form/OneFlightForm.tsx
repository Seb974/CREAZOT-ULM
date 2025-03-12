"use client";

import React, { useState } from "react";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PublicIcon from '@mui/icons-material/Public';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import { Button } from '../../../common/ui/button';

// @ts-ignore
export const OneFlightForm: React.FC = ({ circuits, options, selectedCircuit, selectedCircuits, handleCircuitChange, handleQuantityChange, handleDeleteCircuit, handleOptionChange, disableOption }) => {

  const changeTextCircuitColor = () => setIsCircuitSelected(true);
  const changeTextOptionColor = () => setIsOptionSelected(true);

  const [isCircuitSelected, setIsCircuitSelected] = useState<boolean>(false);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  return (
        <div className="mb-7">
            <div className="flex w-full">
              <div className="relative z-20 bg-white dark:bg-form-input w-9/12 mr-4">
                <PublicIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>

                <select
                  value={selectedCircuit.circuit.id}
                  onChange={(e) => {
                    handleCircuitChange(selectedCircuit, e);
                    changeTextCircuitColor();
                  }}
                  className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                    isCircuitSelected ? "text-black dark:text-white" : ""
                  }`}
                >
                  <option value="" disabled className="text-body dark:text-bodydark">
                    Choisissez un circuit
                  </option>
                  { circuits.map(circuit => {
                      return <option 
                                key={ circuit.id } 
                                value={ circuit.id } 
                                className="text-body dark:text-bodydark"
                                disabled={ !circuit.prixFixe && disableOption }
                              >
                                { circuit.code }
                             </option>
                    })
                  }
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
              <div className="relative z-20 bg-white dark:bg-form-input w-3/12">
                  { selectedCircuit.option.id === 0 ? 
                      <NoPhotographyIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/> :
                      <AddAPhotoIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>
                  }
                  <select
                    value={ selectedCircuit.option.id }
                    disabled={ !selectedCircuit.circuit.avecOptions }
                    onChange={(e) => {
                      handleOptionChange(selectedCircuit, e);
                      changeTextOptionColor();
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input disabled:cursor-default disabled:bg-whiter ${
                      isOptionSelected ? "text-black dark:text-white" : ""
                    }`}
                  >
                    <option value={ 0 } className="text-body dark:text-bodydark">
                        Sans option
                    </option>
                    { options.map(option => {
                        return <option 
                                  key={ option.id } 
                                  value={ option.id } 
                                  className="text-body dark:text-bodydark"
                                >
                                  { option.nom }
                              </option>
                      })
                    }
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
                  
                    {/* <input
                      type="number"
                      name="prix"
                      placeholder="Prix"
                      disabled={ true }
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary aria-disabled:cursor-not-allowed"
                      value={ selectedCircuit.circuit.prix }
                    />
                    <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
                      <span className="opacity-80">{ selectedCircuit.circuit.prixFixe ? "€" : "€/h"}</span>
                    </span> */}
                </div>  
            </div>
            <div className="flex mt-2">
              <div className="relative z-20 bg-white dark:bg-form-input w-9/12 mr-2">
                    <input
                      type="number"
                      name="quantite"
                      min="0"
                      placeholder="Quantité"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      value={ selectedCircuit.quantite }
                      disabled={ !selectedCircuit.circuit.prixFixe }
                      onChange={ e => handleQuantityChange(selectedCircuit, e) }
                    />
                    <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2 pr-2">
                      <span className="opacity-80">{ "U" }</span>
                    </span>
                </div>
                <div className="relative z-20 dark:bg-form-input w-3/12 flex justify-end ml-2">
                  <Button onClick={ e => handleDeleteCircuit(selectedCircuit, e) } aria-disabled={ selectedCircuits.length <= 1 } className="flex h-full w-full flex justify-center rounded bg-red-500 text-sm font-medium text-white transition-colors hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50" >
                        <DeleteForeverIcon/>
                    </Button>
                </div>
            </div>
        </div>

  );
}

