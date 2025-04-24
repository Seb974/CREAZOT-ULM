import React, { useEffect } from "react";
import { useDataProvider } from "react-admin";
import { isDefined, formatDate } from "../../../../app/lib/utils";
import { useSession } from "next-auth/react";
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import DoneIcon from '@mui/icons-material/Done';

export const RappelInformationsModal = ({ selectedRappel, setSelectedRappel, rappels, setRappels, events, setEvents }) => {

    const session = useSession();
    const dataProvider = useDataProvider();

    const disabledStyle = {
        'pointerEvents': 'none',
        'color': '#aaa',
        'textDecoration': 'none'
    };

    const user = session.data.user;
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric'};

    const onClose = () => setSelectedRappel(null);

    const onDeleteRappel = (e, id) => {
        e.preventDefault();
        if (isDefined(session) && isDefined(user) && isDefined(user.roles.find(r => r === "admin"))) {
            dataProvider
                .delete('rappels', { id })
                .then(({data}) => {
                    const newRappels = rappels.filter(r => r.id !== id);
                    const newSelectedRappel = {...selectedRappel, rappels: selectedRappel.rappels.filter(r => r.id !== id )};
                    if (newSelectedRappel.rappels.length !== 0) {
                        setSelectedRappel(newSelectedRappel)
                    } else {
                        setSelectedRappel(null);
                        setEvents(events.filter(e => e.id !== newSelectedRappel.id))
                    }
                    setRappels(newRappels);
                });
        }
    };

    const onFinishRappel = (e, id) => {
        e.preventDefault();
        const selection  = rappels.find(rappel => rappel.id === id);
        const newValue = isDefined(selection.finished) ? !selection.finished : true;
        dataProvider
                .update('rappels',{ id: selection.id, data: {...selection, finished: newValue }})
                .then(({data}) => {
                    setSelectedRappel({...selectedRappel, rappels: selectedRappel.rappels.map(r => r.id !== data.id ? r : data)});
                    setRappels(rappels.map(r => r.id === data.id ? data : r));
                });
    };

    const onBackClick = (e) => {
        if (e.target.id === 'rappel-information-modal')
            onClose();
    };

    const getIsFinished = (selectedRappel, rappel) => {
        const bool = !isDefined(rappel.finished) ? false : rappel.finished;
        const selectedRappelDate = formatDate(new Date(selectedRappel.start));
        return bool && (!rappel.recurrent || (new Date(selectedRappelDate) <= new Date()));
    };

    return ( !isDefined(selectedRappel) ? <></> :
        <div onClick={ onBackClick } id="rappel-information-modal" tabIndex={ -1 } hidden={ !isDefined(selectedRappel) } className={ !isDefined(selectedRappel) ? "hidden " : "" + "flex overflow-y-auto overflow-x-hidden fixed top-0 right-0  z-2000 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"}>
            <div id="inside-information-modal" className="relative p-4 w-full max-w-md max-h-full">  
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700"> 
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Le { new Date(selectedRappel.start).toLocaleDateString('fr-FR', dateOptions) } : { selectedRappel.rappels.length + " rappel" + (selectedRappel.rappels.length > 1 ? "s" : "")}
                        </h3>
                        <button onClick={ e => onClose() } type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                            <svg className="w-3 h-3" aria-hidden={ !isDefined(selectedRappel) } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="p-4 md:p-5 max-h-[500px] overflow-scroll">
                        <div className="space-y-4">
                            { selectedRappel.rappels.map((rappel, i) =>
                                <div className="flex justify-between" key={ i }>
                                    <div className="w-5/6">
                                        <h4 className={"text-red-700 " + (getIsFinished(selectedRappel, rappel) ? "line-through" : "")}>{rappel.important && <><WarningIcon/>{" "}</>}{ i + 1 } - { rappel.titre }</h4>
                                        <p className={ "text-base leading-relaxed text-gray-500 dark:text-gray-400 " + (getIsFinished(selectedRappel, rappel) ? "line-through" : "")}>
                                            { rappel.description }
                                        </p>
                                    </div>
                                    <div className="w-1/6 mr-0 pr-0 text-right">
                                        <p className="mb-4 mr-0 pr-0">
                                            <a href="#" onClick={ e => onFinishRappel(e, rappel.id) } data-modal-hide="default-modal" type="button">
                                                { getIsFinished(selectedRappel, rappel) ? <span className="text-green-500"><DoneIcon/></span> : <DoneIcon/>}
                                            </a>
                                        </p>
                                        <p className="mb-4 mr-0 pr-0">
                                            <a href="#" onClick={ e => onDeleteRappel(e, rappel.id) } data-modal-hide="default-modal" type="button" style={ !isDefined(session) || !isDefined(user) || !isDefined(user.roles.find(r => r === "admin")) ? disabledStyle : {} }>
                                                <span className="text-red-600"><DeleteIcon/></span>
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                )
                            }
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button onClick={ e => onClose() } data-modal-hide="default-modal" type="button" className="bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}