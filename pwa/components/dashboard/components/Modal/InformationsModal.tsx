import React from "react";
import { useDataProvider } from "react-admin";
import { isDefined } from "../../../../app/lib/utils";

export const InformationsModal = ({ selectedReservation, setSelectedReservation, reservations, setReservations, toUpdate, setToUpdate }) => {

    const dataProvider = useDataProvider();
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric'};

    const onClose = () => setSelectedReservation(null);

    const onDelete = async () => {
        const deletedData = await dataProvider.delete('reservations',{id: selectedReservation.id});
        setReservations(reservations.filter(r => r.id !== deletedData.data.id));
        setSelectedReservation(null);
    };

    const onUpdate = () => {
        setToUpdate({...selectedReservation});
        setSelectedReservation(null);
    }

    const getStatusInformation = () => {
        const { statut } = selectedReservation;
        if (isDefined(statut)) {
            return statut === "WAITING" ? <b className="text-yellow-400">{"En attente de confirmation."}<br/></b> : 
                   statut === "WEATHER_CANCEL" ? <b className="text-red-500">{"Annulation météo."}<br/></b> : 
                   statut === "PASSENGER_CANCEL" ? <b className="text-red-500">{"Annulation passager."}<br/></b> : 
                   statut === "INTERN_CANCEL" ?  <b className="text-red-500">{"Annulation interne."}<br/></b> : <br/>;
        }
        return <br/>;
    };

    const getResourceInformations = () => {
        const { pilote, avion } = selectedReservation;
        const firstname = isDefined(pilote) ? pilote.firstName : "";
        const immatriculation = isDefined(avion) ? avion.immatriculation : "";
        const separator = isDefined(pilote) && isDefined(avion) ? " | " : "";
        return firstname + separator + immatriculation;
    };

    const onBackClick = (e) => {
        if (e.target.id === 'information-modal')
            onClose();
    };

    return ( selectedReservation === null ? <></> :
        <div onClick={ onBackClick } id="information-modal" tabIndex={ -1 } hidden={ !isDefined(selectedReservation) } className={ !isDefined(selectedReservation) ? "hidden " : "" + "flex overflow-y-auto overflow-x-hidden fixed top-0 right-0  z-2000 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"}>
            <div id="inside-information-modal" className="relative p-4 w-full max-w-md max-h-full">
                    
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Le { new Date(selectedReservation.debut).toLocaleDateString('fr-FR', dateOptions) } à { new Date(selectedReservation.debut).toLocaleTimeString('fr-FR', timeOptions) }
                            </h3>
                            <button onClick={ e => onClose() } type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden={ !isDefined(selectedReservation) } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                    
                    <div className="p-4 md:p-5">
                        <div className="space-y-4">
                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                M ou Mme <b>{ selectedReservation.nom }</b> { isDefined(selectedReservation.nom) && isDefined(selectedReservation.telephone) && selectedReservation.telephone !== "" ? "-" : "" } { isDefined(selectedReservation.telephone) ? <a href={ `tel:${ selectedReservation.telephone }`} className="underline text-cyan-500">{ selectedReservation.telephone }</a> : <></> }<br/>
                                { selectedReservation.quantite }x { selectedReservation.circuit.nom }. { getStatusInformation() }
                                { isDefined(selectedReservation.option) ?  <><i>{ selectedReservation.option.nom }</i><br/></>  : <></> }
                                { getResourceInformations() }
                            </p>
                            { isDefined(selectedReservation.remarques) && selectedReservation.remarques !== "" &&
                                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                    <b><i>Remarque(s) : </i></b><br/>
                                    <i>{ selectedReservation.remarques }</i>
                                </p>
                            }
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button onClick={ e => onUpdate() } data-modal-hide="default-modal" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Modifier
                        </button>
                        <button onClick={ e => onDelete() } data-modal-hide="default-modal" type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-red rounded-lg border border-red-200 hover:bg-red-100 hover:text-white-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-red-700">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}