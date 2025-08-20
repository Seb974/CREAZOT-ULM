import 'flatpickr/dist/themes/material_red.css';
import React, { useEffect, useRef, useState } from "react";
import { useDataProvider } from "react-admin";
import DoneIcon from '@mui/icons-material/Done';
import { ProfilPiloteForm } from '../../../admin/prestation/Form/ProfilPiloteForm';
import { CircuitForm } from "../../../admin/prestation/Form/CircuitForm";
import { AircraftForm } from "../../../admin/prestation/Form/AircraftForm";
import { OptionForm } from "../../../admin/prestation/Form/OptionForm";
import { generateSafeCode, getRandomColor, isDefined, isDefinedAndNotVoid, isNotBlank, isValid } from "../../../../app/lib/utils";
import { PlusForm } from "../../../admin/prestation/Form/PlusForm";
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { clientWithGifts, clientWithOptions, clientWithOriginContact, clientWithPartners } from '../../../../app/lib/client';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

export const UpdateModal = ({ toUpdate, setToUpdate, reservations, setReservations, client }) => {

    const isOperating = useRef(false);
    const dataProvider = useDataProvider();
    const defaultCadeau = {['@id']: 0, name: "Aucun"};
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric'};
    const [pilots, setPilots] = useState([]);
    const [eligiblePilots, setEligiblePilots] = useState([]);
    const [aircrafts, setAircrafts] = useState([]);
    const [selectedPilot, setSelectedPilot] = useState("");
    const [selectedCircuit, setSelectedCircuit] = useState("");
    const [selectedOption, setSelectedOption] = useState("");
    const [selectedAircraft, setSelectedAircraft] = useState("");
    const [validCadeaux, setValidCadeaux] = useState([]);
    const [section, setSection] = useState("contact");
    const [previousPaidValue, setPreviousPaidValue] = useState(false);
    const [selectedInitialContact, setSelectedInitialContact] = useState([]);
    const [selectedOriginContact, setSelectedOriginContact] = useState([]);
    const [consumer, setConsumer] = useState({nom:"", telephone: "", email: "", quantite: 1, statut: "VALIDATED", remarques: "", report: false, paid: false, upsell: false, debut: new Date((new Date()).setHours(8, 0, 0)), color: getRandomColor(), position: "-", cadeau: defaultCadeau['@id']});

    useEffect(() => {
        if (!isDefinedAndNotVoid(validCadeaux))
            getValidCadeaux();
    }, [consumer]);

    useEffect(() => {
        if (isDefined(toUpdate)) {
            setSelectedCircuit(toUpdate.circuit || "");
            setSelectedOption(toUpdate.option || "");
            setSelectedAircraft(toUpdate.avion || "");
            setSelectedInitialContact(isDefinedAndNotVoid(toUpdate.contact) ? toUpdate.contact.map(c => ({...c, value: c['@id']})) : []);
            setSelectedOriginContact(isDefinedAndNotVoid(toUpdate.origine) ? toUpdate.origine.map(o => ({...o, value: o['@id']})) : []);
            setConsumer({
                ...toUpdate, 
                statut: isDefined(toUpdate.statut) ? toUpdate.statut : "VALIDATED",
                email: isDefined(toUpdate.email) ? toUpdate.email : "",
                remarques: isDefined(toUpdate.remarques) ? toUpdate.remarques : "",
                report: isDefined(toUpdate.report) ? toUpdate.report : false,
                paid: isDefined(toUpdate.paid) ? toUpdate.paid : false,
                upsell: isDefined(toUpdate.upsell) ? toUpdate.upsell : false,
                position: isDefined(toUpdate.position) ? toUpdate.position : "-",
                debut: isDefined(toUpdate.debut) ? new Date(toUpdate.debut) : new Date((new Date()).setHours(8, 0, 0)),
                cadeau: isDefined(toUpdate.cadeau) ? toUpdate.cadeau : defaultCadeau,
            });
            getValidCadeaux(toUpdate)
        } else {
            reinitializeData();
        }
    }, [toUpdate]);

    useEffect(() => {
        if ( isDefined(toUpdate) && isDefinedAndNotVoid(eligiblePilots) && isDefined(toUpdate.pilote) && (!isDefined(selectedPilot) || selectedPilot === "" || !eligiblePilots.some(p => p['@id'] === selectedPilot['@id'])) ) {
            const currentPilot = eligiblePilots.find(p => p['@id'] === (typeof toUpdate.pilote === 'string' ? toUpdate.pilote : toUpdate.pilote['@id']));
            if (isDefined(currentPilot))
                setSelectedPilot(currentPilot);
            else
                setSelectedPilot("");
        }
    }, [toUpdate, eligiblePilots]);

    useEffect(() => {
        if (isDefined(selectedCircuit)) {
            let pilotesEligibles = [];
            if (isDefinedAndNotVoid(pilots)) {
                const qualificationsRequises = selectedCircuit?.qualifications?.map(q => q['@id']) || [];
                const needsEncadrant = selectedCircuit?.needsEncadrant;
                pilotesEligibles = qualificationsRequises.length === 0
                    ? (needsEncadrant ? pilots.filter(({profil, ...p}) => isDefined(profil.pilotQualifications.find(q => isDefined(q.qualification.encadrant) && q.qualification.encadrant && isValid(q.validUntil, q.dateObtention, consumer.debut)))) : pilots)
                    : pilots.filter(({profil, ...p}) =>
                        Array.isArray(profil.pilotQualifications) &&
                        profil.pilotQualifications
                            .filter(q => isValid(q.validUntil, q.dateObtention, consumer.debut))
                            .map(q => q.qualification['@id'])
                            .some(q => qualificationsRequises.includes(q))
                );
            }
            setEligiblePilots(pilotesEligibles);
        } else {
            setEligiblePilots(pilots);
        }
    }, [selectedCircuit, pilots]);
    
    const onConsumerChange = e => setConsumer({...consumer, [e.target.name]: e.target.value});

    const onClose = () => setToUpdate(null);

    const onDateChange = datetime => setConsumer({...consumer, debut: new Date(datetime[0])});

    const getValidCadeaux = (consumer) => {
        try {
            if (isDefined(consumer)) {
                dataProvider
                    .getList('cadeaux', {filter: { valid: isDefined(consumer.cadeau) && consumer.cadeau['@id'] !== defaultCadeau['@id'] ? consumer.cadeau : 'null' }})
                    .then(({ data }) => setValidCadeaux([defaultCadeau, ...data]));
            }
        } catch (e) {
            console.log(e);
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (isOperating.current) return;
        isOperating.current = true;
        try {
            const prix = getFinalPrice(selectedCircuit, selectedOption, selectedOriginContact);
            const selectedCadeau = clientWithGifts(client) && (consumer.cadeau['@id'] !== defaultCadeau['@id']) ? consumer.cadeau['@id'] : null;
            const reservation = {
                ...consumer,
                circuit: selectedCircuit['@id'],
                option: clientWithOptions(client) && selectedOption !== "" ? selectedOption['@id'] : null,
                pilote: selectedPilot !== "" ? selectedPilot['@id'] : null,
                avion: selectedAircraft !== "" ? selectedAircraft['@id'] : null,
                fin: getEndTime(consumer.debut, selectedCircuit),
                contact: clientWithOriginContact(client) && isDefinedAndNotVoid(selectedInitialContact) ? selectedInitialContact.map(c => c['@id']) : [],
                origine: clientWithPartners(client) && isDefinedAndNotVoid(selectedOriginContact) ? selectedOriginContact.map(o => o['@id']) : [],
                paid: clientWithGifts(client) && isDefined(selectedCadeau) ? true : consumer.paid,
                code: isNotBlank(consumer.code) ? consumer.code : generateSafeCode('RESA'),
                cadeau: selectedCadeau,
                prix
            };
            const updatedReservation = await dataProvider.update('reservations', {id: reservation.id, data: reservation});
            const updatedReservations = reservations
                                            .map(r => r['@id'] === updatedReservation.data['@id'] ? updatedReservation.data : r)
                                            .filter(r => isDefined(r.statut) && !r.statut.includes("CANCEL"));
            setReservations(updatedReservations);
            reinitializeData();
            setToUpdate(null);
        } catch (error) {
            console.log(error);
        } finally {
            isOperating.current = false;
        }
    };

    const getFinalPrice = (selectedCircuit, selectedOption, selectedOriginContact) => {
        const maxOriginDiscount = isDefinedAndNotVoid(selectedOriginContact) ? getMaxDiscountFromOrigin(selectedOriginContact) : 0;
        return selectedCircuit.prix * (1 - (maxOriginDiscount / 100)) + (selectedOption.prix || 0);
    };
    
    const getMaxDiscountFromOrigin = selectedOriginContact =>  selectedOriginContact.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

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
        setSelectedPilot("");
        setSelectedOption("");
        setSelectedAircraft("");
        setConsumer({nom:"", telephone: "", email: "", quantite:1, statut: "VALIDATED", remarques: "", report: false, paid: false, upsell: false, debut: new Date((new Date()).setHours(8, 0, 0)), color: getRandomColor(), position: "-"});
        setSection("contact");
        setSelectedInitialContact([]);
        setSelectedOriginContact([]);
    };

    const onBackClick = (e) => {
        if (e.target.id === 'update-modal')
            onClose();
    };

    const onSectionChange = e => {
        e.preventDefault();
        setSection(e.target.id)
    };

    const onChangeColor = e => {
        e.preventDefault();
        setConsumer({...consumer, color: getRandomColor()});
    };

    const onBonCadeauChange = e => {
        const selectedBonCadeau = validCadeaux.find(c => c['@id'] === e.target.value);
        const newBonCadeau = isDefined(selectedBonCadeau) ? selectedBonCadeau : defaultCadeau;
        setConsumer({...consumer, cadeau: newBonCadeau, paid: newBonCadeau['@id'] !== defaultCadeau['@id'] ? true : previousPaidValue});
    };

    return (
        <div onClick={ onBackClick } id="update-modal" tabIndex={ -1 } hidden={ toUpdate === null } className={ toUpdate === null ? "hidden " : "" + "flex overflow-y-auto overflow-x-hidden fixed top-0 right-0  z-2000 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"}>
            <div id="inside-update-modal" className="relative p-4 w-full max-w-md max-h-full">
                    
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Le { (new Date(consumer.debut)).toLocaleDateString('fr-FR', dateOptions) } à { (new Date(consumer.debut)).toLocaleTimeString('fr-FR', timeOptions) }
                            </h3>
                            <button onClick={ e => onClose() } type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden={ toUpdate === null } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                    
                    <div className="p-4 md:p-5">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                                <li className="me-2">
                                    <a href="#" id="contact" onClick={ onSectionChange }
                                        className={ section === "contact" ? 
                                          "inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" :
                                          "inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group"
                                        }
                                    >
                                        <svg className={section === "contact" ? "w-4 h-4 me-2 text-blue-600 dark:text-blue-500" : "w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                        </svg>Contact
                                    </a>
                                </li>
                                <li className="me-2">
                                    <a href="#" id="details" onClick={ onSectionChange }
                                        className={ section === "details" ? 
                                          "inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" :
                                          "inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group"
                                        }
                                    >
                                        <svg className={section === "details" ? "w-4 h-4 me-2 text-blue-600 dark:text-blue-500" : "w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                                        </svg>Détails
                                    </a>
                                </li>
                                <li className="me-2">
                                    <a href="#" id="options" onClick={ onSectionChange }
                                        className={ section === "options" ? 
                                          "inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" :
                                          "inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group"
                                        }
                                    >
                                        <svg className={section === "options" ? "w-4 h-4 me-2 text-blue-600 dark:text-blue-500" : "w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                            <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z"/>
                                        </svg>Options
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <form className="space-y-4">
                            { section === "contact" && 
                                <div className="space-y-4" style={{ zIndex: 3000 }}>
                                    <div>
                                        <label htmlFor="debut" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date et heure de décollage</label>
                                        <Flatpickr
                                            name="debut"
                                            value={ consumer.debut }
                                            onChange={ onDateChange }
                                            className="form-control form-control-sm border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            options={{
                                                enableTime: true,
                                                time_24hr: true,
                                                dateFormat: "d/m/Y - H:i",
                                                mode: "single",
                                                minDate: new Date(consumer.debut) < new Date((new Date).setHours(6, 0, 0)) ? new Date(consumer.debut) : new Date((new Date).setHours(6, 0, 0)),
                                                minTime:"06:00",
                                                maxTime:"18:00",
                                                locale: French,
                                                static: true
                                            }}
                                            style={{ height: "41px" }}
                                        />
                                    </div>
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
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Adresse email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            id="email"
                                            value={ consumer.email }
                                            onChange={ onConsumerChange }
                                            className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                            placeholder="Email"
                                            required
                                        />
                                    </div>
                                    <CircuitForm 
                                        selectedCircuit={ selectedCircuit } 
                                        setSelectedCircuit={ setSelectedCircuit }
                                        getOnlyId={ false }
                                        isUpdate={ true }
                                        reservation={ toUpdate }
                                    /> 
                                </div>
                            }
                            { section === "details" && 
                                <PlusForm 
                                    consumer={ consumer } 
                                    setConsumer={ setConsumer } 
                                    selectedInitialContact={ selectedInitialContact }
                                    setSelectedInitialContact={ setSelectedInitialContact }
                                    selectedOriginContact={ selectedOriginContact }
                                    setSelectedOriginContact={ setSelectedOriginContact }
                                    previousPaidValue={ previousPaidValue }
                                    setPreviousPaidValue={ setPreviousPaidValue }
                                    client={ client }
                                /> 
                            }
                            { section === "options" &&
                                <div>
                                    { clientWithGifts(client) &&
                                        <div className="mb-2">
                                            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                                Prépaiement
                                            </label>
                                            <div className="relative z-20 bg-white dark:bg-form-input">
                                                { consumer.cadeau['@id'] === defaultCadeau['@id'] ? 
                                                    <CreditCardOffIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/> :
                                                    <CreditScoreIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>
                                                }
                                                <select
                                                    value={ consumer.cadeau['@id'] }
                                                    onChange={ onBonCadeauChange }
                                                    className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent pl-12 pr-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white h-[41px]`}
                                                >
                                                    { validCadeaux.map((cadeau, i) => (
                                                        <option key={ i } value={ cadeau['@id'] } className="text-body dark:text-bodydark">
                                                            { cadeau.name }
                                                        </option>
                                                    ))}
                                                </select>

                                            </div>
                                        </div>
                                    }
                                    { clientWithOptions(client) && 
                                        <OptionForm 
                                            selectedOption={ selectedOption } 
                                            setSelectedOption={ setSelectedOption }
                                            isUpdate={ true }
                                            reservation={ toUpdate }
                                        /> 
                                    }
                                    <ProfilPiloteForm 
                                        selectedPilot={ selectedPilot } 
                                        setSelectedPilot={ setSelectedPilot }
                                        pilots={ pilots }
                                        setPilots={ setPilots }
                                        eligiblePilots={ eligiblePilots }
                                        setEligiblePilots={ setEligiblePilots }
                                        selectedCircuit={ selectedCircuit }
                                        autoSelect={ false }
                                        date={ consumer.debut }
                                    />
                                    <AircraftForm 
                                        selectedAircraft={ selectedAircraft }
                                        setSelectedAircraft={ setSelectedAircraft }
                                        aircrafts={ aircrafts }
                                        setAircrafts={ setAircrafts }
                                        autoSelect={ false }
                                    />
                                    <div className="mb-2">
                                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                            Position
                                        </label>
                                        <div className="relative z-20 bg-white dark:bg-form-input">
                                            <MilitaryTechIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80"/>
                                            <select
                                                value={ consumer.position }
                                                onChange={(e) => {
                                                setConsumer({...consumer, position: e.target.value});
                                                }}
                                                className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent pl-12 pr-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white h-[41px]`}
                                            >
                                                <option value="Leader" className="text-body dark:text-bodydark">
                                                    Leader
                                                </option>
                                                <option value="2"  className="text-body dark:text-bodydark">
                                                    2
                                                </option>
                                                <option value="3" className="text-body dark:text-bodydark">
                                                    3
                                                </option>
                                                <option value="4" className="text-body dark:text-bodydark">
                                                    4
                                                </option>
                                                <option value="-" className="text-body dark:text-bodydark">
                                                    -
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            }

                            <div className="flex justify-between items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                <button onClick={ onChangeColor } className="bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" style={{ height: "44px" }}>
                                    <span className="flex justify-between items-center"><div className="border-solid rounded-lg mr-2" style={{ height: "20px", width: "40px", backgroundColor: consumer.color }}></div>{ "Changer" }</span>
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