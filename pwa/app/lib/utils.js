export const isDefined = variable => variable !== undefined && variable !== null;

export const isDefinedAndNotVoid = variable => Array.isArray(variable) ? isDefined(variable) && variable.length > 0 : isDefined(variable);

export const getCircuitDuration = (aircraft, circuit, quantite) => {
    if (aircraft.decimal) {
        const decimalHours = new Date(circuit.duree).getHours();
        const decimalMinutes = new Date(circuit.duree).getMinutes() / 60;
        return decimalHours + decimalMinutes;
    } else {
        const conventionalHours = new Date(circuit.duree).getHours();
        const conventionalMinutes = new Date(circuit.duree).getMinutes();
        const hoursInTotalMinutes = Math.floor(quantite * conventionalMinutes / 60);
        const restInTotalMinutes = (quantite * conventionalMinutes % 60) / 100

        return (quantite * conventionalHours) + hoursInTotalMinutes + restInTotalMinutes;
    }
};

export const getRealDuration = (selectedFlightTime, aircraft) => {

    const flightTime = typeof selectedFlightTime === 'string'? parseFloat(selectedFlightTime.replace(',','.')) : selectedFlightTime;
    if (aircraft.decimal) 
      return Number((flightTime - aircraft.horametre).toFixed(2));
    else {
      const flightTimeInDecimal = Math.floor(flightTime) + (flightTime - Math.floor(flightTime)) / 60 * 100;
      const aircraftInDecimal =  Math.floor(aircraft.horametre) + (aircraft.horametre - Math.floor(aircraft.horametre)) / 60 * 100;
      const difference = flightTimeInDecimal - aircraftInDecimal;
      return Number((Math.floor(difference) + (difference - Math.floor(difference)) * 60 / 100).toFixed(2));
    }
};

export const isValidDuration = (selectedFlightTime, aircraft) => {
  const duration = getRealDuration(selectedFlightTime, aircraft);
  return duration > 0;
};

export const getTotalPrice = (flightTime, aircraft, circuits) => {
  const notFixedPrice = circuits.find(c => !c.circuit.prixFixe);
  if (notFixedPrice !== undefined) {
    // const optionPrice = notFixedPrice.circuit.avecOptions && isDefined(notFixedPrice.option) && isDefined(notFixedPrice.option.price) ? notFixedPrice.option.price : 0;
    const duration = getRealDuration(flightTime, aircraft);
    return (aircraft.decimal ? duration : convertMinutesToDecimal(duration)) * notFixedPrice.circuit.prix // + optionPrice;
  } else {
    return circuits.reduce((sum, { circuit, quantite, option }) => {
      const duration = getCircuitDuration(aircraft, circuit, quantite);
      return sum += quantite * (circuit.prix + (isDefined(option) ? option.prix : 0));
    }, 0);
  }
};

export const getCircuitPrice = (circuit, option, flightTime, aircraft) => {
    const optionPrice = circuit.avecOptions && isDefined(option) && isDefined(option.prix) ? option.prix : 0;
    if (circuit.prixFixe) {
      return circuit.prix + optionPrice;
    } else {
      const duration = getRealDuration(flightTime, aircraft)
      return (aircraft.decimal ? duration : convertMinutesToDecimal(duration)) * circuit.prix + optionPrice;
    }
};

export const convertMinutesToDecimal = (duration) => Number((Math.floor(duration) + (duration - Math.floor(duration)) / 60 * 100).toFixed(2));

export const getRandomColor = () => "#" + Math.floor(Math.random()*16777215).toString(16);

export const getDaysArray = (start, end) => {
  const daysArray=[];
  for ( const day = new Date(start); day <= new Date(end); day.setDate(day.getDate() + 1) ) {
    daysArray.push( new Date(day) );
  }
  return daysArray;
};

export const formatDate = date => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

const generateDateRange = (start, end) => {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const groupRappelsByDate = (rappels, startDate, endDate) => {
  const range = generateDateRange(new Date(startDate), new Date(endDate));
  const grouped = {};

  range.forEach(date => {
    const formattedDate = formatDate(date);
    const dayOfWeek = date.getDay();

    const rappelsDuJour = rappels.filter(rappel => {
      if (rappel.recurrent) {
        return rappel.jour === dayOfWeek;
      } else {
        const rappelDateFormatted = formatDate(new Date(rappel.date));
        return rappelDateFormatted === formattedDate;
      }
    });

    if (rappelsDuJour.length > 0) {
      grouped[formattedDate] = rappelsDuJour;
    }
  });

  return grouped;
};

export const getSlotFromDate = date => {
  const formattedDate = new Date(date);
  return {
      start: new Date((formattedDate).setHours(6, 0, 0)),
      end: new Date((formattedDate).setHours(12, 30, 0))
  };
};

export const getDefaultDatesFromDate = date => {
  const formattedDate = new Date(date);
  return {
      start: new Date((formattedDate).setHours(0, 0, 0)),
      end: new Date((formattedDate).setHours(23, 59, 59))
  };
};

export const getDatesFromSlot = ({ start, end }) => {
  const formattedStart = new Date(start);
  const formattedEnd = new Date(end);
  return {
    start: new Date((formattedStart).setHours(0, 0, 0)),
    end: new Date((formattedEnd).setHours(23, 59, 59))
  }
};

export const isSameDates = (date1, date2) => {
  if (isDefined(date1) && isDefined(date2)) {
    return +date1.start === +date2.start && +date1.end === +date2.end;
  }
  return false;
};

export const getFormattedValueForBackEnd = (value, additionalCondition = true) => {
  if (additionalCondition && isDefined(value)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      if ('@id' in value && isDefined(value['@id']))
        return value['@id'];
    }
    if (typeof value === 'string' && value !== '') {
      return value;
    }
  }
  return null;
};

export const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateSafeCode = (prefix = 'PAY') => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
};

export const isNotBlank = variable => isDefined(variable) && variable !== '';

export const matchesStartOfWord = (value, search) => {
  const regex = new RegExp(`\\b${search}`, 'i');
  return regex.test(value);
};

export const getShipStyle = ({ color }) => ({
  backgroundColor: color + '33',
  color: color,
  border: '1px solid',
  borderColor: color,
  marginRight: '4px',
  marginBottom: '2px',
  marginTop: '2px'
})
