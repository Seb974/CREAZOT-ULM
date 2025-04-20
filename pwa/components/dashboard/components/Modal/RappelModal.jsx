import 'flatpickr/dist/themes/material_red.css';
import React, { useEffect, useState } from "react";
import DoneIcon from '@mui/icons-material/Done';
import { useDataProvider } from "react-admin";
import { getRandomColor, isDefined, isDefinedAndNotVoid } from "../../../../app/lib/utils";
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";

export const RappelModal = ({ rappelVisible, setRappelVisible, slot, rappels, setRappels }) => {

    const dataProvider = useDataProvider();
    const [rappel, setRappel] = useState({ titre: '', description: '', recurrent: false, jour: null, date: null, important: false });

    useEffect(() => {
        if (rappelVisible)
            setRappel({ titre: '', description: '', recurrent: false, jour: (new Date(slot.start)).getDay(), date: new Date((new Date(slot.start).setHours(12, 0, 0))), important: false });
    }, [slot.start]);
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRappel((prevState) => ({
          ...prevState,
          [name]: type === 'checkbox' ? checked : value,
        }));
      };

    const toggleSwitch = ({ target }) => {
        const { id, checked } = target;
        setRappel({...rappel, [id]: checked});
      };

    const onClose = () => reinitializeData();

    const onSubmit = async e => {
        e.preventDefault();
        const newRappel = await dataProvider.create('rappels', {data: rappel});
        setRappels([...rappels, newRappel.data]);
        onClose();
    };

    const reinitializeData = () => {
        setRappel({ titre: '', description: '', recurrent: false, jour: null, date: null, important: false });
        setRappelVisible(false);
    };

    const onBackClick = (e) => {
        if (e.target.id === 'rappel-modal')
            onClose();
    };

    const onDateChange = datetime => setRappel({...rappel, date: new Date((new Date(datetime[0]).setHours(12, 0, 0)))});

    return (
        <div onClick={ onBackClick } id="rappel-modal" tabIndex={ -1 } hidden={ !rappelVisible } className={ !rappelVisible ? "hidden " : "" + "flex overflow-y-auto overflow-x-hidden fixed top-0 right-0  z-2000 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"}>
            <div id="inside-register-modal" className="relative p-4 w-full max-w-md max-h-full">
                    
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Créer un rappel
                            </h3>
                            <button onClick={ e => onClose() } type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden={ !rappelVisible } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                    <div className="p-4 md:p-5">
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="titre" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Titre</label>
                                <input 
                                    type="text" 
                                    name="titre" 
                                    id="titre"
                                    value={ rappel.titre }
                                    onChange={ handleChange }
                                    className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                    placeholder="Tâche"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                    Description
                                </label>
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    rows="3" 
                                    placeholder="Facultatif"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                    onChange={(e) => setRappel({...rappel, description: e.target.value})}
                                    value={ rappel.description }
                                >
                                </textarea>
                            </div>
                            <div>
                                <label className="inline-flex items-center me-5 cursor-pointer mt-2">
                                    <input type="checkbox" id="recurrent" className="sr-only peer" onChange={ toggleSwitch } checked={ rappel.recurrent }/>
                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Tâche récurrente</span>
                                </label>
                            </div>

                            {rappel.recurrent ? (
                            <>
                                <div className="mb-2">
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Jour de la semaine
                                    </label>
                                    <select
                                        value={ rappel.jour }
                                        onChange={ handleChange }
                                        className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white h-[41px]`}
                                    >
                                        <option value="1" className="text-body dark:text-bodydark">
                                            Lundi
                                        </option>
                                        <option value="2"  className="text-body dark:text-bodydark">
                                            Mardi
                                        </option>
                                        <option value="3" className="text-body dark:text-bodydark">
                                            Mercredi
                                        </option>
                                        <option value="4" className="text-body dark:text-bodydark">
                                            Jeudi
                                        </option>
                                        <option value="5" className="text-body dark:text-bodydark">
                                            Vendredi
                                        </option>
                                        <option value="6" className="text-body dark:text-bodydark">
                                            Samedi
                                        </option>
                                        <option value="-0" className="text-body dark:text-bodydark">
                                            Dimanche
                                        </option>
                                    </select>
                                </div>
                            </>
                            ) : (
                            <>
                                <div>
                                    <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date</label>
                                    <Flatpickr
                                        name="date"
                                        value={ rappel.date }
                                        onChange={ onDateChange }
                                        className="form-control form-control-sm border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        options={{
                                            enableTime: false,
                                            dateFormat: "d/m/Y",
                                            mode: "single",
                                            locale: French,
                                            static: true
                                        }}
                                        style={{ height: "41px" }}
                                    />
                                </div>
                            </>
                            )}

                            <div>
                                <label className="inline-flex items-center me-5 cursor-pointer mt-2">
                                    <input type="checkbox" id="important" className="sr-only peer" onChange={ toggleSwitch } checked={ rappel.important }/>
                                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Important</span>
                                </label>
                            </div>                 
                            <div className="flex justify-between items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button onClick={ onClose } className="bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" style={{ height: "44px" }}>
                                  <>Annuler</>  
                                </button>
                                <button onClick={ onSubmit } className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                                    <><DoneIcon className="mr-2"/>{ "Réserver" }</>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

}