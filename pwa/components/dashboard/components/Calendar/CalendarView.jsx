import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/fr';
import { useDataProvider } from "react-admin";
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../../../../css/calendar.css";
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { getRandomColor, isDefined } from "../../../../app/lib/utils";
import { useSession } from 'next-auth/react';

const DOW = 1;
const DragAndDropCalendar = withDragAndDrop(Calendar);

moment.locale('fr', { week: { dow: DOW, doy: 1 } });

const localizer = momentLocalizer (moment);

export const CalendarView = ({ events, setEvents, selection, setSelection, slot, setSlot, visible, setVisible, reservations, setReservations }) => {

  const now = new Date();
  const session = useSession();
  const dataProvider = useDataProvider();
  const user = session.data.user;
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30);
  const defaultDates = useState({start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0), end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0) });
  const [dates, setDates] = useState(defaultDates);
  const [view, setView] = useState(Views.DAY);        // Views.WEEK

  useEffect(() => {
    const {start, end} = Array.isArray(dates) ? dates[0] : dates; 
    dataProvider
      .getList('reservations', {
        filter: {'debut[after]': (new Date(start)).toISOString(), 'debut[before]': (new Date(end)).toISOString(), 'cancel': false, 'pagination': false},
        sort: {id: 'ASC' },
        pagination: {}
      })
      .then(({ data }) => setReservations(data))
  }, [dates])

  useEffect(() => getEventsFromReservations(reservations), [reservations, view]);

  const getEventsFromReservations = reservations => {
    let newEvents = [];
    if (reservations.length > 0) {
      let color = getRandomColor();
      reservations.map((d, i, array) => {
        color = i > 0 && (array[i].nom === array[i-1].nom && array[i].quantite === array[i-1].quantite ? color : getRandomColor())
        const newEvent = {...d, title: getTitle(d), start: new Date(d.debut), end: new Date(d.fin), color: isDefined(d.color) ? d.color : getRandomColor() };
        newEvents = [...newEvents, newEvent];
      });
      const filteredEvents = newEvents.filter(e => isDefined(e.statut) && !e.statut.includes("CANCEL"));
      setEvents(filteredEvents);
    }
  }

  const getTitle = ({ circuit, nom, pilote, avion, telephone, option, statut, report }) => {
    if (view == Views.DAY)
      return (
        <>
          <b className="text-sm">
            { isDefined(statut) && statut === "WAITING" &&  <HourglassTopIcon className="text-xs mr-2"/> }{`${ circuit.code }` }{ report && <span className="text-xs italic font-normal">{"  (REPORT)"}</span> }
          </b><i className="text-xs">{`${ isDefined(option) ? " + " + option.nom  : "" }` }</i>
          <br/>
          <b className="text-xs">{`${ nom }` }</b> <span className="text-xs"><i>{`${ telephone }` }</i></span>
          <br/>
          
          <span className="text-xs">
            {`${ isDefined(pilote) ? pilote.firstName : "" }
              ${ isDefined(pilote) && isDefined(avion) ? " | " : "" }
              ${ isDefined(avion) ? avion.immatriculation : "" }` }
          </span>
        </>
      );
    else 
      return getVerticalName(circuit.code);
  };

  const getVerticalName = name => {
    const arrayName = name.split('');
    return (
      <span className="text-sm">
        { arrayName.map((n, i) => <span key={ i }>{ n }<br/></span> )}
      </span>
    );
  };
    
  const onView = e => setView(Views[e.toUpperCase()]);
    
  const onRangeChange = useCallback((range) => {
    const newView = Array.isArray(range) ? range.length === 1 ? Views.DAY : Views.WEEK : Views.MONTH;
    const date = newView === Views.DAY || newView === Views.WEEK ? range[0] : range.start;
    const newDates = getLimits(date, newView);
    setDates(newDates);
  }, []);
    
  const moveEvent = useCallback(({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
        const { allDay } = event;
        if (!allDay && droppedOnAllDaySlot)
            event.allDay = true
        setEvents((prev) => {
            const existing = prev.find((ev) => ev.id === event.id) ?? {}
            const filtered = prev.filter((ev) => ev.id !== event.id)
            return [...filtered, { ...existing, start, end, allDay }]
        });
        const updatedReservation = getFormattedUpdate(event, start, end);
        dataProvider
          .update('reservations', {id: updatedReservation.id, data: updatedReservation})
          .then(({ data }) => {
            const initialReservations = isDefined(reservations.find(r => r['@id'] === data['@id'])) ? reservations : [...reservations, data];
            const newReservations = initialReservations.map(r => r['@id'] === data['@id'] ? data : r);
            setReservations(newReservations);
          })
          .catch(error => console.log(error));
},
[setEvents, reservations, setReservations]);

const getFormattedUpdate = (event, start, end) => {
  const { circuit, option, pilote, avion } = event;
  return {
      ...event,
      circuit: circuit['@id'],
      option: isDefined(option) ? option['@id'] : null,
      pilote: isDefined(pilote) ? pilote['@id'] : null,
      avion: isDefined(avion) ? avion['@id'] : null,
      report: event.report ? true : (new Date(event.debut) < new Date(start)),
      debut: new Date(start), 
      fin: new Date(end)
  }
};
    
const eventStyleGetter = (event, start, end, isSelected) => {
  const { color } = event;
  return {
      style: {
          backgroundColor : color,
          opacity: 0.98,
          width: '33.33%!important',
      }
  };
};

const getLimits = (date = new Date(), currentView = view) => {
  if (currentView === Views.WEEK)
      return getCurrentWeekDates(date);
  else if (currentView === Views.DAY)
      return getDayDate(date);
  return getCurrentMonthDates(date);
};
    
const getCurrentWeekDates = (date = new Date()) => {
  const startDelay = date.getDate() - date.getDay() + DOW;
  const endDelay = startDelay + 6;

  let start = new Date(date);
  start.setDate(startDelay);

  let end = new Date(date);
  end.setDate(endDelay);
  return {
      start: new Date(new Date(start).setHours(0, 0, 0)),
      end: new Date(new Date(end).setHours(23, 59, 59))
  };
};
    
const getDayDate = (date = new Date()) => {
  return {
      start: new Date((date).setHours(0, 0, 0)),
      end: new Date((date).setHours(23, 59, 59))
  }
};

const getCurrentMonthDates = (date = new Date()) => {
  return {
      start: new Date(date.getFullYear(), date.getMonth()+ 1, 1), 
      end: new Date(date.getFullYear(), date.getMonth() + 2, 0)
  };
};
    
const onEventClick = (event) => {
  const selected = events.find(e => e.id === event.id);
  setSelection(selected);
};

const onSelecting = useCallback((slotInfo) => {
  if (isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin")) {
    setSlot({
      start: new Date(slotInfo.start),
      end: new Date(slotInfo.end)
    })
    setVisible(true);
  }
}, []);

    return (
        <div className="calendar-container col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-12">
            <div className="row custom_row bg-white rounded-corner p-4">
                <DragAndDropCalendar
                    className="c-d-sm-down-none"
                    events={ events }
                    eventPropGetter={ eventStyleGetter }
                    views={['week', 'day']}   // 'month',
                    culture="fr"
                    view={ view }
                    defaultDate={ new Date() }
                    localizer={ localizer }
                    onView={ onView }
                    onRangeChange={ range => onRangeChange(range, view) }
                    onSelectSlot={ onSelecting }
                    onSelectEvent={ onEventClick }
                    popup={ true }
                    onEventDrop={ moveEvent }
                    selectable
                    step={ 15 }
                    min={ min }
                    max={ max}
                    formats={{
                      eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
                        let s = localizer.format(start, 'HH:mm', culture);
                        let e = localizer.format(end, 'HH:mm', culture);
                        return view === Views.DAY ? `${s} - ${e}` : "";
                      }         
                    }}
                />  
            </div>
         </div>
    );

}