import React, { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SettingsIcon from '@mui/icons-material/Settings';
import DoneIcon from '@mui/icons-material/Done';
import { CircuitForm } from "../../../admin/prestation/Form/CircuitForm";
import { getRandomColor, isDefined } from "../../../../app/lib/utils";
import { PlusForm } from "../../../admin/prestation/Form/PlusForm";

export const RegisterModal = ({ visible, setVisible, slot, reservations, setReservations }) => {

    const dataProvider = useDataProvider();
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric'};
    const [selectedCircuit, setSelectedCircuit] = useState("");
    const [plus, setPlus] = useState(false);
    const [isUpToDate, setIsUpToDate] = useState(false);
    const [consumer, setConsumer] = useState({nom:"", telephone: "", email: "", quantite: 1, statut: "VALIDATED", remarques: "", report: false, debut: new Date(slot.start), color: getRandomColor()});

    useEffect(() => {
        if (visible && !isUpToDate) {
            setConsumer({...consumer, debut: new Date(slot.start)});
            setIsUpToDate(true);
        }
    }, [slot.start]);

    const onConsumerChange = e => setConsumer({...consumer, [e.target.name]: e.target.value});

    const onPlusChange = e => {
        e.preventDefault();
        setPlus(!plus);
    }

    const onClose = () => reinitializeData();

    const onSubmit = async e => {
        e.preventDefault();
        let newReservations = [];
        const endTime = getEndTime(consumer.debut, selectedCircuit);
        const quantite = parseInt(consumer.quantite);
        const prix = selectedCircuit.prix;
        const reservation = {
            ...consumer,
            quantite,
            circuit: selectedCircuit.id,
            fin: endTime,
            prix,
        }
        for (let i = 0; i < quantite; i++) {
            const newReservation = await dataProvider.create('reservations', {data: reservation});
            newReservations = !isDefined(newReservation.data) || (isDefined(newReservation.data.statut) && newReservation.data.statut.includes('CANCEL')) ? 
            newReservations : [...newReservations, newReservation.data];
        }
        setReservations([...reservations, ...newReservations]);
        reinitializeData();
    };

    const getEndTime = (start, circuit) => {
        const duree = new Date(circuit.duree);
        return new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
            start.getHours() + duree.getHours(),
            start.getMinutes() + duree.getMinutes()
        );
    };

    const reinitializeData = () => {
        setConsumer({nom:"", telephone: "", email: "", quantite: 1, statut: "VALIDATED", remarques: "", report: false, debut: new Date((new Date()).setHours(8, 0, 0)), color: getRandomColor()});
        setPlus(false);
        setVisible(false);
        setIsUpToDate(false);
    };

    const onBackClick = (e) => {
        if (e.target.id === 'register-modal')
            onClose();
    };

    return (
        <div onClick={ onBackClick } id="register-modal" tabIndex={ -1 } hidden={ !visible } className={ !visible ? "hidden " : "" + "flex overflow-y-auto overflow-x-hidden fixed top-0 right-0  z-2000 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"}>
            <div id="inside-register-modal" className="relative p-4 w-full max-w-md max-h-full">
                    
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Le { (new Date(consumer.debut)).toLocaleDateString('fr-FR', dateOptions) } à { (new Date(consumer.debut)).toLocaleTimeString('fr-FR', timeOptions) }
                            </h3>
                            <button onClick={ e => onClose() } type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden={ !visible } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                    <div className="p-4 md:p-5">
                        <form className="space-y-4">
                        { !plus ? 
                            <div className="space-y-4" style={{ zIndex: 3000 }}>
                                <div>
                                    <label htmlFor="nom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nom du contact</label>
                                    <input 
                                        type="text" 
                                        name="nom" 
                                        id="nom"
                                        value={ consumer.nom }
                                        onChange={ onConsumerChange }
                                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="Nom"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="telephone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">N° de téléphone</label>
                                    <input 
                                        type="text" 
                                        name="telephone" 
                                        id="telephone"
                                        value={ consumer.telephone }
                                        onChange={ onConsumerChange }
                                        className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="N° de téléphone" 
                                        required
                                    />
                                </div>
                                <div className="relative z-20 bg-white dark:bg-form-input">
                                <label htmlFor="nom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantité</label>
                                    <input
                                        type="number"
                                        name="quantite"
                                        min="1"
                                        placeholder="Quantité"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        value={ consumer.quantite }
                                        onChange={ onConsumerChange }
                                    />
                                </div>
                                <CircuitForm 
                                    selectedCircuit={ selectedCircuit } 
                                    setSelectedCircuit={ setSelectedCircuit }
                                    getOnlyId={ false }
                                /> 
                            </div>
                            : 
                            <PlusForm consumer={ consumer } setConsumer={ setConsumer }/>
                        }
                            
                            <div className="flex justify-between items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button onClick={ onPlusChange } className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    {!plus ? <><SettingsIcon className="mr-2"/>{ "Options" }</> : <><ChevronLeftIcon className="mr-2"/>{ "Revenir" }</>  }
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