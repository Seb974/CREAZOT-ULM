import 'flatpickr/dist/themes/material_red.css';
import React, { useEffect, useRef, useState } from "react";
import DoneIcon from '@mui/icons-material/Done';
import { useDataProvider } from "react-admin";
import { CircuitForm } from "../../../admin/prestation/Form/CircuitForm";
import { generateSafeCode, getFormattedValueForBackEnd, getRandomColor, isDefined, isDefinedAndNotVoid, isNotBlank, isValid } from "../../../../app/lib/utils";
import { PlusForm } from "../../../admin/prestation/Form/PlusForm";
import Flatpickr from 'react-flatpickr';
import { French } from "flatpickr/dist/l10n/fr.js";
import { CombinaisonForm } from '../../../admin/prestation/Form/CombinaisonForm';
import { clientWithGifts, clientWithOptions, clientWithOriginContact, clientWithPartners } from '../../../../app/lib/client';
import { ProfilPiloteForm } from '../../../admin/prestation/Form/ProfilPiloteForm';
import { AircraftForm } from "../../../admin/prestation/Form/AircraftForm";
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import UpdateIcon from '@mui/icons-material/Update';
import ClearIcon from '@mui/icons-material/Clear';

const status = [
    {value:"VALIDATED", label: "Validé"},
    {value:"WAITING", label: "En attente de confirmation"},
    {value:"WEATHER_REPORT", label: "Report météo"},
    {value:"PASSENGER_REPORT", label: "Report client"},
    {value:"INTERN_REPORT", label: "Report interne"},
    {value:"WEATHER_CANCEL", label: "Annulation météo"},
    {value:"PASSENGER_CANCEL", label: "Annulation client"},
    {value:"INTERN_CANCEL", label: "Annulation interne"}
  ];

export const RegisterModal = ({ visible, setVisible, slot, reservations, setReservations, client }) => {

    const isOperating = useRef(false);
    const dataProvider = useDataProvider();
    const defaultPrepayment = {['@id']: 0, name: "Aucun"};
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric'};
    const [options, setOptions] = useState([]);
    const [pilots, setPilots] = useState([]);
    const [eligiblePilots, setEligiblePilots] = useState([]);
    const [aircrafts, setAircrafts] = useState([]);
    const [selectedPilot, setSelectedPilot] = useState("");
    const [selectedAircraft, setSelectedAircraft] = useState(""); 
    const [prepayments, setPrepayments] = useState([]);
    const [selectedCircuit, setSelectedCircuit] = useState("");
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedCombinaison, setSelectedCombinaison] = useState("");
    const [isUpToDate, setIsUpToDate] = useState(false);
    const [section, setSection] = useState("contact");
    const [previousPaidValue, setPreviousPaidValue] = useState(false);
    const [selectedInitialContact, setSelectedInitialContact] = useState([]);
    const [selectedOriginContact, setSelectedOriginContact] = useState([]);
    const [creationMode, setCreationMode] = useState('declaration');
    const [selectedPrepayment, setSelectedPrepayment] = useState(defaultPrepayment);
    const [consumer, setConsumer] = useState({nom:"", telephone: "", email: "", quantite: 1, statut: "VALIDATED", remarques: "", report: false, paid: false, upsell: false, debut: new Date(slot.start), color: getRandomColor(), position: "-"});

    useEffect(() => {
        if (isNotBlank(selectedCircuit)) {
            setConsumer({...consumer, fin: getEndTime(new Date(consumer.debut), selectedCircuit)})
        }
    }, [consumer.debut, selectedCircuit]);
    
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

    useEffect(() => {
        getOptions();
        getPrepayments();
    }, []);
    
    useEffect(() => {
        if (visible && !isUpToDate) {
            setConsumer({...consumer, debut: new Date(slot.start)});
            setIsUpToDate(true);
        }
    }, [slot.start]);

    useEffect(() => setSelectedOptions(getSelectedOptions(selectedCombinaison, consumer.quantite)), [selectedCombinaison]);

    const getOptions = () => {
        dataProvider
            .getList('options', {})
            .then(({ data }) => setOptions(data))
      };

    const getPrepayments = () => {
        dataProvider
            .getList('cadeaux', {filter: { used: false }})
            .then(({ data }) => setPrepayments([defaultPrepayment, ...data.map(d => ({...d, quantite: d.quantite ?? 1}))]))
    };

    const onConsumerChange = e => setConsumer({...consumer, [e.target.name]: e.target.value});

    const onClose = () => reinitializeData();

    const onSubmit = async e => {
        e.preventDefault();
        if (isOperating.current) return;
        isOperating.current = true;
        try {
            let newReservations = [];
            const endTime = getEndTime(consumer.debut, selectedCircuit);
            const quantite = parseInt(consumer.quantite);
            const reservation = {
                ...consumer,
                quantite,
                circuit: selectedCircuit.id,
                fin: endTime,
                contact: clientWithOriginContact(client) && isDefinedAndNotVoid(selectedInitialContact) ? selectedInitialContact.map(c => c['@id']) : [],
                origine: clientWithPartners(client) && isDefinedAndNotVoid(selectedOriginContact) ? selectedOriginContact.map(o => o['@id']) : [],
                code: generateSafeCode('RESA'),
                pilote: quantite <= 1 && isNotBlank(selectedPilot) ? getFormattedValueForBackEnd(selectedPilot) : null,
                avion: quantite <= 1 && isNotBlank(selectedAircraft) ? getFormattedValueForBackEnd(selectedAircraft) : null,
                position: quantite <= 1 && isNotBlank(consumer?.position) && consumer?.position !== "-" ? consumer.position : null
            }
            for (let i = 0; i < quantite; i++) {
                const option = clientWithOptions(client) && isDefined(selectedOptions[i]) ? selectedOptions[i]['@id'] : null;
                const prix = getFinalPrice(selectedCircuit, selectedOptions[i], selectedOriginContact);
                const newReservation = await dataProvider.create('reservations', {data: {...reservation, option, prix}});
                newReservations = !isDefined(newReservation.data) || (isDefined(newReservation.data.statut) && newReservation.data.statut.includes('CANCEL')) ? 
                newReservations : [...newReservations, newReservation.data];
            }
            setReservations([...reservations, ...newReservations]);
            reinitializeData();
        } catch (error) {
            console.error(error);
        } finally {
            isOperating.current = false;
        }        
    };

    const onSubmitConversion = async e => {
        e.preventDefault();
        if (isOperating.current) return;
        isOperating.current = true;
        try {
            let newReservations = [];
            const { debut, color, statut } = consumer;
            const { telephone, email, quantite, beneficiaire, circuit, origine } = selectedPrepayment;
            const optionsSelected = clientWithOptions(client) ? getOptionsArray(selectedPrepayment.options, quantite ?? 1, options) : [];
            const data = {
                    telephone: telephone ?? '',
                    email: email ?? '',
                    quantite: quantite ?? 1, 
                    debut: new Date(debut),
                    fin: getEndTime(new Date(debut), circuit),
                    nom: beneficiaire,
                    color,
                    paid: true,
                    upsell: false,
                    report: false,
                    contact: [],
                    remarques: '',
                    statut,
                    circuit: circuit['@id'],
                    cadeau: selectedPrepayment['@id'],
                    origine: clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
                    code: generateSafeCode('RESA'),
                    pilote: quantite <= 1 && isNotBlank(selectedPilot) ? getFormattedValueForBackEnd(selectedPilot) : null,
                    avion: quantite <= 1 && isNotBlank(selectedAircraft) ? getFormattedValueForBackEnd(selectedAircraft) : null,
                    position: quantite <= 1 && isNotBlank(consumer?.position) && consumer?.position !== "-" ? consumer.position : null
                };
            for (let i = 0; i < data.quantite; i++) {
                const option = clientWithOptions(client) && isDefinedAndNotVoid(optionsSelected) && isDefined(optionsSelected[i]) ? optionsSelected[i]['@id'] : null;
                const prix = getFinalPrice(circuit, optionsSelected[i], origine);
                const newReservation = await dataProvider.create('reservations', {data: {...data, option, prix }});
                newReservations = !isDefined(newReservation.data) || (isDefined(newReservation.data.statut) && newReservation.data.statut.includes('CANCEL')) ? 
                newReservations : [...newReservations, newReservation.data];
            }
            const usedPrepayment = getFormattedUsedPrepayment(selectedPrepayment)
            await dataProvider.update('cadeaux', { id: selectedPrepayment.id, data: usedPrepayment});
            setReservations([...reservations, ...newReservations]);
            setPrepayments(prepayments.filter(p => p.id !== usedPrepayment.id));
            reinitializeData();
        } catch (error) {
            console.error(error);
        } finally {
            isOperating.current = false;
        }        
    };

    const getOptionsArray = (selectedOptions, quantite, bddOptions) => {
        let options = isDefined(selectedOptions) && isDefinedAndNotVoid(selectedOptions.options) ? selectedOptions.options.map(o => bddOptions.find(option => option['@id'] === o['@id'])) : [];
        const missingInputs = quantite - options.length;
        if (missingInputs > 0) {
        for (let i = 0; i < missingInputs; i++) {
            options.unshift(null);
        }
        }
        return options;
    };

    const getFormattedUsedPrepayment = prepayment => {
        const { circuit, options, option, origine } = prepayment; 
        return {
            ...prepayment, 
            circuit: getFormattedValueForBackEnd(circuit),
            options: getFormattedValueForBackEnd(options),
            option: getFormattedValueForBackEnd(option),
            origine: isDefinedAndNotVoid(origine) ? origine.map(o => getFormattedValueForBackEnd(o)) : [],
            sendEmail: false,
            used: true
        };
    };

    const getFinalPrice = (selectedCircuit, selectedOption, selectedOriginContact) => {
        const maxOriginDiscount = isDefinedAndNotVoid(selectedOriginContact) ? getMaxDiscountFromOrigin(selectedOriginContact) : 0;
        return (isDefined(selectedCircuit) && isDefined(selectedCircuit.prix) ? selectedCircuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(selectedOption) && isDefined(selectedOption.prix) ? selectedOption.prix : 0);
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
        setConsumer({nom:"", telephone: "", email: "", quantite: 1, statut: "VALIDATED", remarques: "", report: false, paid: false, upsell: false, debut: new Date((new Date()).setHours(8, 0, 0)), color: getRandomColor(), position: "-"});
        setSelectedPilot("");
        setSelectedAircraft("");
        setSelectedCombinaison("");
        setSelectedOptions([]);
        setSection("contact");
        setVisible(false);
        setIsUpToDate(false);
        setSelectedInitialContact([]);
        setSelectedOriginContact([]);
        setCreationMode('declaration');
        setSelectedPrepayment(defaultPrepayment);
    };

    const onBackClick = (e) => {
        if (e.target.id === 'register-modal')
            onClose();
    };

    const onSectionChange = e => {
        e.preventDefault();
        setSection(e.target.id);
    };

    const onDateChange = datetime => setConsumer({...consumer, debut: new Date(datetime[0])});

    const onChangeColor = e => {
        e.preventDefault();
        setConsumer({...consumer, color: getRandomColor()});
    };

    const onPrepaymentChange = e => {
        const newSelection = prepayments.find(c => c['@id'] === e.target.value);
        const newPrepayment = isDefined(newSelection) ? newSelection : defaultPrepayment;
        setSelectedPrepayment(newPrepayment);
    };

    const switchCreationMode = e => {
        e.preventDefault();
        const newValue = creationMode === 'declaration' ? 'conversion' : 'declaration';
        setCreationMode(newValue)
    };

    const getSelectedOptions = (combinaison, quantite) => {
        if (clientWithOptions(client) && combinaison !== "") {
            let selectedOptions = combinaison.options.map(o => options.find(option => o['@id'] === option['@id']));
            const missingInputs = quantite - selectedOptions.length;
            if (missingInputs > 0) {
                for (let i = 0; i < missingInputs; i++) {
                  selectedOptions.unshift(null);
                }
            }
            return selectedOptions;
        }
        return [];
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
                                    { creationMode === 'declaration' ? 
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
                                        :
                                        <a id="details" className="inline-flex p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">
                                            <svg className={section === "details" ? "w-4 h-4 me-2 text-blue-600 dark:text-blue-500" : "w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                                            </svg>Détails
                                        </a>
                                    }
                                </li>  
                                <li className="me-2">
                                    { (creationMode === 'declaration' && consumer?.quantite <= 1) || (creationMode !== 'declaration' && selectedPrepayment?.quantite <= 1) ? 
                                        <a href="#" id="options" onClick={ onSectionChange }
                                            className={ section === "options" ? 
                                                "inline-flex items-center justify-center p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group" :
                                                "inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group"
                                            }
                                        >
                                            <svg className={section === "options" ? "w-4 h-4 me-2 text-blue-600 dark:text-blue-500" : "w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z"/>
                                            </svg>Options
                                        </a>
                                        :
                                        <a id="options" className="inline-flex p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">
                                            <svg className={section === "options" ? "w-4 h-4 me-2 text-blue-600 dark:text-blue-500" : "w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300"} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                                <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z"/>
                                            </svg>Options
                                        </a>
                                    }
                                </li>
                            </ul>
                        </div>
                        <form className="space-y-4">
                            <div id="formContent">
                                { section === "contact" && 
                                    <div className="space-y-4" style={{ zIndex: 3000 }}>
                                        { creationMode === 'declaration' ? 
                                            <div className="space-y-4 min-h-[543px]">
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
                                                <div className="mt-6 flex justify-between items-center">
                                                    <div className="relative z-20 bg-white dark:bg-form-input mr-2 w-1/3">
                                                        <label htmlFor="nom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantité</label>
                                                        <input
                                                            type="number"
                                                            name="quantite"
                                                            min="1"
                                                            placeholder="Quantité"
                                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary h-[41px]"
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
                                                { clientWithOptions(client) && 
                                                    <CombinaisonForm 
                                                        selectedCombinaison={ selectedCombinaison }
                                                        setSelectedCombinaison={ setSelectedCombinaison }
                                                        quantite={ consumer.quantite }
                                                    />
                                                }
                                                { clientWithGifts(client) && 
                                                    <div className="flex justify-end">
                                                        <a href="#" onClick={ switchCreationMode } className="text-xs italic text-teal-700">
                                                            <><ChangeCircleIcon className="mr-1"/><span>Via un prépaiement</span></>
                                                        </a>
                                                    </div>
                                                }
                                            </div>
                                        : 
                                            <div className="min-h-[270px]">
                                                <div className="space-y-4">
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
                                                    <div className="my-2">
                                                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                                            Prépaiement
                                                        </label>
                                                        <div className="relative z-20 bg-white dark:bg-form-input">
                                                            <CreditScoreIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 "/>
                                                            <select
                                                                value={ selectedPrepayment['@id'] }
                                                                onChange={ onPrepaymentChange }
                                                                className={`relative z-20 w-full appearance-none rounded-lg border border-stroke bg-transparent pl-12 pr-4 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white h-[41px]`}
                                                            >
                                                                { prepayments.map((prepayment, i) => (
                                                                    <option key={ i } value={ prepayment['@id'] } className="text-body dark:text-bodydark">
                                                                        { prepayment.name }
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            
                                                        </div>
                                                        <p className="w-full flex justify-end text-xs italic pr-2 pt-1">
                                                                { selectedPrepayment['@id'] === defaultPrepayment['@id'] ? '' :
                                                                `${selectedPrepayment.quantite ?? 1} ${ selectedPrepayment.circuit?.nom } ${ isDefined(selectedPrepayment.options) ? ` avec ${ selectedPrepayment.options.nom }` : ''}`
                                                                }
                                                            </p>
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                                        Statut
                                                        </label>
                                                        <div className="relative z-20 bg-white dark:bg-form-input">
                                                            { consumer.statut === "VALIDATED" ? 
                                                                <DoneIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-green-500"/> :
                                                                consumer.statut === "WAITING" ?
                                                                <HourglassTopIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-yellow-400"/> :
                                                                consumer.statut.includes("REPORT") ?
                                                                <UpdateIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-blue-500"/> :
                                                                <ClearIcon className="absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-80 text-red-500"/>
                                                                }
                                                            <select
                                                                value={ consumer.statut }
                                                                onChange={(e) => setConsumer({...consumer, statut: e.target.value})}
                                                                className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input h-[41px]`}
                                                            >
                                                                { status.map(({value, label}, i) => <option key={i} value={ value } className="text-body dark:text-bodydark">{ label }</option> )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                { clientWithGifts(client) && 
                                                    <div className="flex justify-end mt-4">
                                                        <a href="#" onClick={ switchCreationMode } className="text-xs italic text-teal-700">
                                                            <><NoteAltIcon className="mr-1"/><span>Saisir manuellement</span></>
                                                        </a>
                                                    </div>
                                                }
                                            </div>
                                        }
                                    </div> 
                                }
                                { section === "details" && 
                                    <div className="min-h-[543px]">
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
                                    </div>
                                }
                                { section === "options" &&
                                    <div className="min-h-[543px]">
                                        <div className="my-4">
                                            <ProfilPiloteForm 
                                                selectedPilot={ selectedPilot } 
                                                setSelectedPilot={ setSelectedPilot }
                                                setPilots={ setPilots }
                                                eligiblePilots={ eligiblePilots }
                                                reservation={ consumer }
                                                autoSelect={ false }
                                                date={ consumer.debut }
                                            />
                                        </div>
                                        <div className="my-4">
                                            <AircraftForm 
                                                selectedAircraft={ selectedAircraft }
                                                setSelectedAircraft={ setSelectedAircraft }
                                                aircrafts={ aircrafts }
                                                setAircrafts={ setAircrafts }
                                                reservation={ consumer }
                                                autoSelect={ false }
                                                resource = "reservations"
                                            />
                                        </div>
                                        <div className="my-4">
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
                            </div>
                            <div className="flex justify-between items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                 <button onClick={ onChangeColor } className="bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" style={{ height: "44px" }}>
                                    <span className="flex justify-between items-center"><div className="border-solid rounded-lg mr-2" style={{ height: "20px", width: "40px", backgroundColor: consumer.color }}></div>{ "Changer" }</span>
                                </button>
                                <button 
                                    onClick={ creationMode === 'declaration' ? onSubmit : onSubmitConversion }
                                    className="text-white bg-green-700 hover:bg-green-800 disabled:bg-green-900 focus:ring-4 focus:outline-none cursor-pointer disabled:cursor-default focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                    disabled={ creationMode !== 'declaration' && selectedPrepayment['@id'] === defaultPrepayment['@id'] }
                                >
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