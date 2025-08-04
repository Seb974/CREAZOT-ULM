import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import 'moment/locale/fr';
import { useDataProvider } from "react-admin";
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../../../../css/calendar.css";
import WarningIcon from '@mui/icons-material/Warning';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { CircularProgress, IconButton, Button, Box } from '@mui/material';
import { ChevronLeft, ChevronRight, CalendarMonth, ViewWeek, Today } from '@mui/icons-material';
import { getRandomColor, isDefined, isDefinedAndNotVoid, getDaysArray, groupRappelsByDate, getDefaultDatesFromDate } from "../../../../app/lib/utils";
import { useSession } from 'next-auth/react';

const DOW = 1;
const DragAndDropCalendar = withDragAndDrop(Calendar);

moment.locale('fr', { week: { dow: DOW, doy: 1 } });

const localizer = momentLocalizer (moment);

export const CalendarView = ({ events, setEvents, setSelection, setSlot, setVisible, reservations, setReservations, rappels, setRappels, setRappelVisible, setRappelSelection, isSmall, dates, setDates }) => {

  const now = new Date();
  const lastSetDates = useRef(null);
  const session = useSession();
  const dataProvider = useDataProvider();
  const user = session.data.user;
  const authorizedProfiles = ['pro', 'instructeur'];
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30);

  const [profile, setProfile] = useState(null);
  const [view, setView] = useState(Views.DAY);
  const [isInitializing, setIsInitializing] = useState(false);

  const safeSetDates = (newDates) => {
    const last = lastSetDates.current;
    if (!last || last.start.getTime() !== newDates.start.getTime() || last.end.getTime() !== newDates.end.getTime()) {
      lastSetDates.current = newDates;
      setDates(newDates);
    }
};

  const formats = {
    eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
      let s = localizer.format(start, 'HH:mm', culture);
      let e = localizer.format(end, 'HH:mm', culture);
      return view === Views.DAY ? `${s} - ${e}` : "";
    },
    dayHeaderFormat: (date, culture, localizer) =>
      moment(date).format('dddd D MMMM').replace(/^\w/, c => c.toUpperCase()),
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
      const startDate = moment(start);
      const endDate = moment(end);
      if (startDate.month() === endDate.month()) {
        return `Du ${startDate.format('D')} au ${endDate.format('D MMMM')}`;
      }
      return `Du ${startDate.format('D MMMM')} au ${endDate.format('D MMMM')}`;
    },
    agendaHeaderFormat: ({ start, end }) => {
      const startDate = moment(start);
      const endDate = moment(end);
      return `Du ${startDate.format('D MMMM')} au ${endDate.format('D MMMM')}`;
    }
  };

  useEffect(() => getUserProfile(user), [user]);

  useEffect(() => {
    let isStale = false;
    fetchAndBuildEvents(() => isStale);
  
    return () => isStale = true;
  }, [dates, view]);

  const fetchAndBuildEvents = async (isStaleFn = () => false) => {
    if (!dates) {
      console.warn("fetchAndBuildEvents appelé sans dates définies");
      return;
    }

    const { start, end } = Array.isArray(dates) ? dates[0] : dates;
    try {
      setIsInitializing(true);
      const [resasRes, rappelsRes] = await Promise.all([
        dataProvider.getList('reservations', {
          filter: {
            'debut[after]': new Date(start).toISOString(),
            'debut[before]': new Date(end).toISOString(),
            cancel: false,
            pagination: false
          },
          sort: { id: 'ASC' },
          pagination: {}
        }),
        dataProvider.getList('rappels', {
          filter: getRappelsFilter(start, end),
          sort: { id: 'ASC' },
          pagination: {}
        })
      ]);

      if (isStaleFn()) return;

      setReservations(resasRes.data);
      setRappels(rappelsRes.data);
      const reservationEvents = getEventsFromReservations(resasRes.data);
      const rappelEvents = getEventsFromRappels(rappelsRes.data);
      setEvents([...reservationEvents, ...rappelEvents]);

    } catch (e) {
      if (!isStaleFn())
        console.error("❌ Erreur lors du chargement des données", e);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return;
    const newReservationEvents = getEventsFromReservations(reservations);
    const newRappelEvents = getEventsFromRappels(rappels);
    setEvents([...newReservationEvents, ...newRappelEvents]);
  }, [reservations, rappels]);

  const getUserProfile = user => {
    if (isDefined(user)) {
      dataProvider
        .getList('profil_pilotes',{ filter: { 'pilote.email': user.email }, sort: {id: 'ASC' } })
        .then(({ data }) => setProfile(data[0]));
    }
  };

  const getRappelsFilter = (start, end) => {
    const daysArray = getDaysArray(start, end);
    const dayNumbers = daysArray.map(day => day.getDay());
    return {
        'periode[start]': (new Date(start)).toLocaleDateString('fr-CA'),
        'periode[end]': (new Date(end)).toLocaleDateString('fr-CA'),
        'periode[jours][]': [...new Set(dayNumbers)],
        'pagination': false
    }; 
  };

  const getEventsFromReservations = reservations => {
    let newEvents = [];
    if (isDefinedAndNotVoid(reservations)) {
        let color = getRandomColor();
        reservations.map((d, i, array) => {
          color = i > 0 && (array[i].nom === array[i-1].nom && array[i].quantite === array[i-1].quantite ? color : getRandomColor())
          const newEvent = {...d, title: getTitle(d), start: new Date(d.debut), end: new Date(d.fin), color: isDefined(d.color) ? d.color : getRandomColor(), type: 'event-reservation' };
          newEvents = [...newEvents, newEvent];
        });
        return newEvents.filter(e => isDefined(e.statut) && !e.statut.includes("CANCEL"));
    }
    return [];
  };

  const getEventsFromRappels = rappels => {
    if (isDefinedAndNotVoid(rappels)) {
        const {start, end} = Array.isArray(dates) ? dates[0] : dates;
        const groupedRappels = groupRappelsByDate(rappels, start, end);
        return Object.keys(groupedRappels).map((date, i) => {
            const isImportant = isDefined(groupedRappels[date].map(r => r.important).find(r => r === true));
            return {
              id: i + 1,
              rappels: groupedRappels[date],
              title: <>{ isImportant && <WarningIcon/> } { groupedRappels[date].length + " rappel" + (groupedRappels[date].length > 1 ? "s" : "") }</>,
              start: new Date(date),
              end: new Date(date),
              allDay: true,
              type: 'event-rappel'
            }
        });
    }
    return [];
  };

  const getTitle = ({ circuit, nom, pilote, avion, telephone, option, statut, report, prix, position, remarques, paid }) => {
    if (view == Views.DAY)
      return (
        <>
          <b className="text-sm">
            { isDefined(statut) && statut === "WAITING" &&  
              <span style={{ marginLeft: '-6px' }}>
                <HourglassTopIcon style={{ width: '0.8rem', height: '0.8rem' }}/>
              </span>
            }
            {`${ circuit.code }`}{ report && <span className="text-xs italic font-normal">{"  (REPORT)"}</span> }
          </b><i className="text-xs">{`${ isDefined(option) ? " + " + option.nom  : "" }` }</i>
          <br/>
          <b className="text-xs">{`${ nom }` }</b> <span className="text-xs"><i>{`${ telephone }` }</i></span>
     
          <br/>
          { (isDefined(remarques) && remarques.trim() !== "") && 
            <>
              <span className="text-xs"><i className="text-red-50"><WarningIcon/> { remarques }</i></span>
        
              <br/>
            </>
          }
          <span className="text-xs"><b>
            {`${ isDefined(pilote) ? pilote.firstName.toUpperCase() : "" }
              ${ isDefined(pilote) && isDefined(avion) ? "  |  " : "" }
              ${ isDefined(avion) ? avion.immatriculation : "" }
              ${ (isDefined(pilote) || isDefined(avion)) && (isDefined(position) && position !== "-") ? " -> " : "" }
              ${ (isDefined(position) && position !== "-") ? position : "" }`
            }
          </b>
          </span>
          <br/>
          { isAuthorized(profile) && 
            <span className="text-xs"><b>{ prix }€ </b>{`${(isDefined(paid) && paid) ?  "- PAYÉ" : ""}`}</span>
          }
        </>
      );
    else 
      return getVerticalName(circuit.code, statut);
  };

  const getVerticalName = (name, statut) => {
    const arrayName = name.split('');
    return (
        <span className="text-sm text-left mx-0">
            { isDefined(statut) && statut === "WAITING" &&  
              <>
                <span style={{ marginLeft: '-6px' }}>
                  <HourglassTopIcon style={{ width: '0.8rem', height: '0.8rem' }}/>
                </span>
                <br/>
              </> }
            { arrayName.map((n, i) => <span key={ i } className="left-0 mx-[-4px]">{ n }<br/></span> )}
        </span>
    );
  };
    
  const onView = e => setView(Views[e.toUpperCase()]);
    
  const onRangeChange = useCallback((range) => {
      const newView = Array.isArray(range) ? range.length === 1 ? Views.DAY : Views.WEEK : Views.MONTH;
      const date = newView === Views.DAY || newView === Views.WEEK ? range[0] : range.start;
      const newDates = getLimits(date, newView);
      safeSetDates(newDates);
  }, []);
    
  const moveEvent = useCallback(({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      const { allDay } = event;
      if (!allDay) {
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
          .catch(error => console.error(error));
      }
  },
  [setEvents, reservations, setReservations]);

  const getFormattedUpdate = (event, start, end) => {
    const { circuit, option, pilote, avion, contact, origine, cadeau } = event;
    return {
        ...event,
        statut: "WHEATER_REPORT",
        circuit: circuit['@id'],
        option: isDefined(option) ? option['@id'] : null,
        pilote: isDefined(pilote) ? pilote['@id'] : null,
        avion: isDefined(avion) ? avion['@id'] : null,
        cadeau: isDefined(cadeau) ? cadeau['@id'] : null,
        contact: isDefinedAndNotVoid(contact) ? contact.map(c => c['@id']) : [],
        origine: isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
        report: event.report ? true : ((new Date(event.debut)).getDate() !== (new Date(start)).getDate()),
        debut: new Date(start), 
        fin: new Date(end)
    }
  };
      
  const eventStyleGetter = (event, start, end, isSelected) => {
    const { color, type } = event;
    return {
        className: type,
        style: {
            backgroundColor : type === 'event-reservation' ? color : 'red',
            opacity: type === 'event-reservation' ? 0.98 : 0.4,
            width: type === 'event-reservation' ? '33.33%!important' : 'auto!important',
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
    event.type === 'event-reservation'? setSelection(selected) : setRappelSelection(selected);
  };

  const onSelecting = useCallback((slotInfo) => { 
    if (isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin")) {
      if (!isSmall) {
        setSlot({ start: new Date(slotInfo.start), end: new Date(slotInfo.end)});
        slotInfo.slots.length === 2 ? setVisible(true) : setRappelVisible(true);
      } else {
        const target = slotInfo.slots.length === 2 ? 'reservations' : 'rappels';
        setTimeout(() => {
          window.location.hash = `#/${ target }/create?debut=${encodeURIComponent(slotInfo.start.toISOString())}`;
          window.scrollTo(0, 0);
        }, 0);
      }
    }
  }, [isSmall]);

  const isAuthorized = profile => {
    if (isDefined(profile)) {
      const { qualifications } = profile;
      if (isDefinedAndNotVoid(qualifications)) {
        const authorizedSet = new Set(authorizedProfiles);
        return qualifications.map(q => q.slug).some(item => authorizedSet.has(item));
      }
    }
    return false;
  };

  

  const CustomToolbar = ({ label, onNavigate, onView, views, view, isLoading }) => {
    const viewLabels = {
      month: { label: 'Mois', icon: <CalendarMonth fontSize="small" /> },
      week: { label: 'Sem.', icon: <ViewWeek fontSize="small" /> },
      day: { label: 'Jour', icon: <Today fontSize="small" /> },
    };
  
    return (
      <div className="rbc-toolbar">
        {/* Navigation */}
        <div className="rbc-toolbar-section">
          <IconButton onClick={() => onNavigate('PREV')} sx={{ height: 48 }}>
              <ChevronLeft />
            </IconButton>
    
            <Button
              onClick={() => onNavigate('TODAY')}
              startIcon={<Today />}
              variant="outlined"
              size="small"
              sx={{ height: 48, fontWeight: 500 }}
            >
              Aujourd’hui
            </Button>
    
            <IconButton onClick={() => onNavigate('NEXT')} sx={{ height: 48 }}>
              <ChevronRight />
            </IconButton>
        </div>

        {/* Label + Spinner */}
        <div className="rbc-toolbar-label">
          <span>{label}</span>
          {isLoading && <CircularProgress className="ml-2" size={16} color="error" />}
        </div>

        {/* View Switcher */}
        <div className="rbc-toolbar-section">
          {views.map((viewName) => (
            <Button
              key={viewName}
              onClick={() => onView(viewName)}
              variant={view === viewName ? 'contained' : 'outlined'}
              size="small"
              startIcon={viewLabels[viewName]?.icon}
              sx={{
                px: 1.5,
                py: 0.5,
                height: 48,
                boxShadow: view === viewName ? 2 : 0,
                textTransform: 'none', 
              }}
            >
              {viewLabels[viewName]?.label ?? viewName}
            </Button>
          ))}
        </div>
      </div>
    );
  }


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
                // defaultDate={ new Date() }
                date={ dates.start }
                onNavigate={date => safeSetDates(getDefaultDatesFromDate(date))}
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
                components={{
                  toolbar: (props) => <CustomToolbar {...props} isLoading={isInitializing} />,
                }}
                formats={formats}
            />  
        </div>
      </div>
  );
}