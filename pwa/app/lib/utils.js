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
