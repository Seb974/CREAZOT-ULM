"use client";

import React, { useState, useEffect } from "react";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarView } from "../Calendar/CalendarView";
import { RappelModal } from "../Modal/RappelModal";
import { RegisterModal } from "../Modal/RegisterModal";
import { InformationsModal } from "../Modal/InformationsModal";
import { RappelInformationsModal } from "../Modal/RappelInformationsModal";
import { UpdateModal } from "../Modal/UpdateModal";
import { getDefaultDatesFromDate, getSlotFromDate } from "../../../../app/lib/utils";


export const CalendarWidget = ({ isSmall, client }) => {

    const now = new Date();
    const [events, setEvents] = useState([]);
    const [rappels, setRappels] = useState([]);
    const [visible, setVisible] = useState(false);
    const [toUpdate, setToUpdate] = useState(null);
    const [selection, setSelection] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [slot, setSlot] = useState(getSlotFromDate(now));
    const [rappelVisible, setRappelVisible] = useState(false);
    const [rappelSelection, setRappelSelection] = useState(null);
    const [dates, setDates] = useState(getDefaultDatesFromDate(now));

    useEffect(() => {
        const hash = window.location.hash;
        const queryPart = hash.split('?')[1];
        if (!queryPart) return;
    
        const params = new URLSearchParams(queryPart);
        const scrollTarget = params.get('scroll');
        const dateParam = params.get('date');

        if (scrollTarget === 'calendar') {
        setTimeout(() => {
            const el = document.getElementById('calendar-section');
            if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            }
        }, 200);
        }
        if (dateParam) {
            const parsedDate = new Date(dateParam);
            if (!isNaN(parsedDate.getTime()))
            setDates(getDefaultDatesFromDate(parsedDate));
        }
        window.history.replaceState({}, document.title, '/admin#/');
    }, []);

    return (
        <>
            <div id="calendar-section" className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                <CalendarView 
                    events={ events } 
                    setEvents={ setEvents } 
                    setSelection={ setSelection }
                    setSlot={ setSlot }
                    setVisible={ setVisible }
                    reservations={ reservations }
                    setReservations={ setReservations }
                    setRappelVisible={ setRappelVisible }
                    setRappelSelection={ setRappelSelection }
                    isSmall={ isSmall }
                    dates={ dates } 
                    setDates={ setDates }
                />
            </div>
            <RegisterModal 
                visible={ visible } 
                setVisible={ setVisible } 
                slot={ slot }
                reservations={ reservations }
                setReservations={ setReservations }
                client={ client }
            />
            <InformationsModal 
                selectedReservation={ selection } 
                setSelectedReservation={ setSelection }
                reservations={ reservations }
                setReservations={ setReservations }
                setToUpdate={ setToUpdate }
                isSmall={ isSmall }
            />
            <UpdateModal 
                toUpdate={ toUpdate } 
                setToUpdate={ setToUpdate }
                reservations={ reservations }
                setReservations={ setReservations }
                client={ client }
            />
            <RappelModal 
                rappelVisible={ rappelVisible } 
                setRappelVisible={ setRappelVisible } 
                slot={ slot }
                rappels={ rappels }
                setRappels={ setRappels }
            />
            <RappelInformationsModal 
                selectedRappel={ rappelSelection } 
                setSelectedRappel={ setRappelSelection }
                rappels={ rappels }
                setRappels={ setRappels }
                events={ events }
                setEvents={ setEvents }
            />
        </>
    );
};