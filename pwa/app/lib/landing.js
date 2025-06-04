import { isDefined } from "./utils";

export const groupLandingsByDateAirportAndAeronef = (prestations, filters) => {
    const filterByAeronef = presta =>
        !filters.aeronef || presta.aeronef?.immatriculation?.toLowerCase().includes(filters.aeronef.toLowerCase());

    const filterByAirport = landing =>
        !filters.airport ||
        landing.airportCode?.toLowerCase().includes(filters.airport.toLowerCase()) ||
        landing.airportName?.toLowerCase().includes(filters.airport.toLowerCase());

    const resultMap = new Map();

    const prestationsFiltered = prestations.filter(filterByAeronef);

    prestationsFiltered.forEach(({ date, aeronef, vols = [] }, i) => {
        const immat = aeronef?.immatriculation || `–`;

        vols.forEach(({ landings }, j) => {
            const filteredLandings = landings.filter(filterByAirport);

            filteredLandings.forEach(({ airportCode, airportName, touches = 0, complets = 0 }, k) => {
                const key = `${date}-${airportCode}`;
                const existing = resultMap.get(key);

                if (!existing) {
                    resultMap.set(key, {
                        id: key,
                        key,
                        date,
                        airport: airportCode,
                        name: airportName,
                        touches,
                        complets,
                        byAeronef: [{ aeronef: immat, touches, complets }]
                    });
                } else {
                    existing.touches += touches;
                    existing.complets += complets;

                    const existingAeronef = existing.byAeronef.find(a => a.aeronef === immat);
                    if (existingAeronef) {
                        existingAeronef.touches += touches;
                        existingAeronef.complets += complets;
                    } else {
                        existing.byAeronef.push({ aeronef: immat, touches, complets });
                    }
                }
            });
        });
    });

    return Array.from(resultMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const uploadLandings = async (landings, dataProvider) => {
    const uploadPromises = landings.map(async (landing) => {
        try {
            const response = await dataProvider.create('landings', { data: landing });
            if (response?.data) {
                return response.data;
            } else {
                console.error('Réponse invalide pour un atterrissage');
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de l\'upload d\'un atterrissage', error);
            return null;
        }
    });

    return (await Promise.all(uploadPromises)).filter(Boolean);
};
