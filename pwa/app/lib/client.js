import { isDefined } from "./utils";

export const colors = [
    { id: '#1e293b', name: 'Slate-800' },
    { id: '#374151', name: 'Gray-700' },
    { id: '#3f3f46', name: 'Zinc-700' },
    { id: '#1f2937', name: 'Gray-800' },
    { id: '#292524', name: 'Stone-800' },
    { id: '#0f172a', name: 'Blue-950' },
    { id: '#1e40af', name: 'Blue-800' },
    { id: '#3730a3', name: 'Indigo-800' },
    { id: '#581c87', name: 'Purple-800' },
    { id: '#86198f', name: 'Fuchsia-800' },
    { id: '#9d174d', name: 'Rose-800' },
    { id: '#be123c', name: 'Red-800' },
    { id: '#7f1d1d', name: 'Red-900' },
    { id: '#7c2d12', name: 'Orange-900' },
    { id: '#78350f', name: 'Amber-900' },
    { id: '#92400e', name: 'Orange-800' },
    { id: '#14532d', name: 'Green-900' },
    { id: '#166534', name: 'Green-800' },
    { id: '#065f46', name: 'Emerald-800' },
    { id: '#115e59', name: 'Teal-800' },
    { id: '#164e63', name: 'Cyan-800' },
    { id: '#075985', name: 'Sky-800' },
    { id: '#4338ca', name: 'Indigo-700' },
    { id: '#7c3aed', name: 'Violet-700' },
];

export const timezones = [
    { id: 'UTC', name: 'UTC (Temps universel coordonné)' },
    { id: 'Indian/Reunion', name: 'Réunion (UTC+4)' },
    { id: 'Indian/Mauritius', name: 'Maurice (UTC+4)' },
    { id: 'Indian/Mayotte', name: 'Mayotte (UTC+3)' },
    { id: 'Indian/Maldives', name: 'Maldives (UTC+5)' },
    { id: 'Europe/Paris', name: 'France - Paris (UTC+1 / UTC+2)' },
    { id: 'Europe/London', name: 'Royaume-Uni - Londres (UTC / UTC+1)' },
    { id: 'Europe/Berlin', name: 'Allemagne - Berlin (UTC+1 / UTC+2)' },
    { id: 'Africa/Nairobi', name: 'Kenya - Nairobi (UTC+3)' },
    { id: 'Africa/Johannesburg', name: 'Afrique du Sud - Johannesburg (UTC+2)' },
    { id: 'Africa/Casablanca', name: 'Maroc - Casablanca (UTC+1)' },
    { id: 'Asia/Dubai', name: 'Émirats - Dubaï (UTC+4)' },
    { id: 'Asia/Kolkata', name: 'Inde - Kolkata (UTC+5:30)' },
    { id: 'Asia/Bangkok', name: 'Thaïlande - Bangkok (UTC+7)' },
    { id: 'Asia/Tokyo', name: 'Japon - Tokyo (UTC+9)' },
    { id: 'America/Sao_Paulo', name: 'Brésil - São Paulo (UTC-3)' },
    { id: 'America/New_York', name: 'États-Unis - New York (UTC-5 / UTC-4)' },
    { id: 'America/Los_Angeles', name: 'États-Unis - Los Angeles (UTC-8 / UTC-7)' },
    { id: 'Australia/Sydney', name: 'Australie - Sydney (UTC+10 / UTC+11)' },
    { id: 'Pacific/Auckland', name: 'Nouvelle-Zélande - Auckland (UTC+12 / UTC+13)' }
];

export const getColor = color => {
    const defaultColor = colors.find(c => c.name.toUpperCase() === "GRAY");
    const selection = colors.find(c => c.id === color);
    return isDefined(selection) ? selection : defaultColor;
};

export const getTimezone = timezone => {
    const defaultTimezone = timezones.find(c => c.id === 'UTC');
    const selection = timezones.find(c => c.id === timezone);
    return isDefined(selection) ? selection : defaultTimezone;
};


