import { isDefined, isDefinedAndNotVoid } from "./utils";

export const colors = [
    // Prédéfinies de MUI / React-Admin
    { id: '#1976d2', name: 'Primary' },
    { id: '#9c27b0', name: 'Secondary' },
    { id: '#d32f2f', name: 'Error' },
    { id: '#ed6c02', name: 'Warning' },
    { id: '#0288d1', name: 'Info' }, 
    { id: '#2e7d32', name: 'Success' },

    // Neutres foncés
    { id: '#1e293b', name: 'Slate-800' },
    { id: '#374151', name: 'Gray-700' },
    { id: '#1f2937', name: 'Gray-800' },
    { id: '#3f3f46', name: 'Zinc-700' },
    { id: '#292524', name: 'Stone-800' },
  
    // Dégradé de bleus et froids
    { id: '#0f172a', name: 'Blue-950' },
    { id: '#1e40af', name: 'Blue-800' },
    { id: '#075985', name: 'Sky-800' },
    { id: '#164e63', name: 'Cyan-800' },
    { id: '#115e59', name: 'Teal-800' },
    { id: '#065f46', name: 'Emerald-800' },
    { id: '#166534', name: 'Green-800' },
    { id: '#14532d', name: 'Green-900' },
  
    // Violets, roses et rouges
    { id: '#3730a3', name: 'Indigo-800' },
    { id: '#4338ca', name: 'Indigo-700' },
    { id: '#7c3aed', name: 'Violet-700' },
    { id: '#581c87', name: 'Purple-800' },
    { id: '#86198f', name: 'Fuchsia-800' },
    { id: '#9d174d', name: 'Rose-800' },
    { id: '#be123c', name: 'Red-800' },
    { id: '#7f1d1d', name: 'Red-900' },

    // Oranges et jaunes
    { id: '#7c2d12', name: 'Orange-900' },
    { id: '#92400e', name: 'Orange-800' },
    { id: '#78350f', name: 'Amber-900' },
];
  
export const timezones = [
    { id: 'America/Los_Angeles', name: 'États-Unis - Los Angeles (UTC-8 / UTC-7)' },
    { id: 'America/New_York', name: 'États-Unis - New York (UTC-5 / UTC-4)' },
    { id: 'America/Sao_Paulo', name: 'Brésil - São Paulo (UTC-3)' },
    { id: 'UTC', name: 'UTC (Temps universel coordonné)' },
    { id: 'Europe/London', name: 'Royaume-Uni - Londres (UTC / UTC+1)' },
    { id: 'Africa/Casablanca', name: 'Maroc - Casablanca (UTC+1)' },
    { id: 'Europe/Berlin', name: 'Allemagne - Berlin (UTC+1 / UTC+2)' },
    { id: 'Europe/Paris', name: 'France - Paris (UTC+1 / UTC+2)' },
    { id: 'Africa/Johannesburg', name: 'Afrique du Sud - Johannesburg (UTC+2)' },
    { id: 'Indian/Mayotte', name: 'Mayotte (UTC+3)' },
    { id: 'Africa/Nairobi', name: 'Kenya - Nairobi (UTC+3)' },
    { id: 'Indian/Reunion', name: 'Réunion (UTC+4)' },
    { id: 'Indian/Mauritius', name: 'Maurice (UTC+4)' },
    { id: 'Asia/Dubai', name: 'Émirats - Dubaï (UTC+4)' },
    { id: 'Indian/Maldives', name: 'Maldives (UTC+5)' },
    { id: 'Asia/Kolkata', name: 'Inde - Kolkata (UTC+5:30)' },
    { id: 'Asia/Bangkok', name: 'Thaïlande - Bangkok (UTC+7)' },
    { id: 'Asia/Tokyo', name: 'Japon - Tokyo (UTC+9)' },
    { id: 'Australia/Sydney', name: 'Australie - Sydney (UTC+10 / UTC+11)' },
    { id: 'Pacific/Auckland', name: 'Nouvelle-Zélande - Auckland (UTC+12 / UTC+13)' }
  ];

export const images = [
    {name: 'logo', type: 'logo', opacity: null},
    {name: 'favicon', type: 'favicon', opacity: null},
    {name: 'mapIcon', type: 'mapicon', opacity: null},
    {name: 'thanksImage', type: 'thanksimage', opacity: null},
    {name: 'pdfBackground', type: 'pdfbackground', opacity: null}
];

export const fileInputSX = {
    '& .RaFileInput-dropZone': {
        minHeight: '48px', 
        padding: '8.5px 14px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: 0
    }
};

export const getColor = color => {
    const defaultColor = colors.find(c => c.name.toUpperCase() === "PRIMARY");
    const selection = colors.find(c => c.id === color);
    return isDefined(selection) ? selection : defaultColor;
};

export const getTimezone = timezone => {
    const defaultTimezone = timezones.find(c => c.id === 'UTC');
    const selection = timezones.find(c => c.id === timezone);
    return isDefined(selection) ? selection : defaultTimezone;
};

export const objectToFormData = (data, form = new FormData(), namespace = '') => {
    for (let key in data) {
        if (!data.hasOwnProperty(key)) continue;

        let value = data[key];
        const formKey = namespace ? `${namespace}[${key}]` : key;

        if (value === undefined)
            value = null;
        
        if (value === null || value === '')
            form.append(formKey, value);
        else if (Array.isArray(value))
            form.append(formKey, JSON.stringify(value));
        else if (value instanceof File)
            form.append(formKey, value);
        else if (value?.rawFile instanceof File)
            form.append(formKey, value.rawFile, value.rawFile.name);
        else if (typeof value === 'object')
            objectToFormData(value, form, formKey);
        else
            form.append(formKey, value);
    }
    return form;
};

export const uploadImages = async (data, session) => {
    const uploadPromises = images.map(async (image) => {
        const value = data[image.name];
    
        const file = value instanceof File
          ? value
          : value?.rawFile instanceof File
            ? value.rawFile
            : null;
    
        if (file) {
          // Nouveau fichier envoyé
          const opacity = image.type === 'pdfbackground' ? data.opacity : image.opacity;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', image.type);
          if (opacity !== null && opacity !== undefined) {
            formData.append('opacity', opacity);
          }
    
          try {
            const response = await fetch('/admin/upload/client-asset', {
              method: 'POST',
              body: formData,
              // @ts-ignore
              headers: { Authorization: `Bearer ${session.data.accessToken}` },
            });
    
            const jsonResponse = await response.json();
    
            if (response.ok && jsonResponse.path) {
              return { name: image.name, path: jsonResponse.path };
            } else {
              console.error(`Erreur lors de l'upload de ${image.name} :`, jsonResponse.error || response.statusText);
              return { name: image.name, path: null };
            }
          } catch (error) {
            console.error(`Exception lors de l'upload de ${image.name} :`, error);
            return { name: image.name, path: null };
          }
    
        } else if (typeof value === 'string') {
          // Image déjà existante
          return { name: image.name, path: value };
        } else {
          // Aucun fichier ni path → null
          return { name: image.name, path: null };
        }
    });
  
    return await Promise.all(uploadPromises);
};

export const sanitizeData = data => {
    const registrationPax = data.hasPassengerRegistration;
    return {
        ...data, 
        thanksTitle: registrationPax && isDefined(data.thanksTitle) ? data.thanksTitle : '',
        thanksMessage: registrationPax && isDefined(data.thanksMessage) ? data.thanksMessage : ''
    }
};

export const clientWithOptions = client => {
    return isDefined(client) && isDefined(client.hasOptions) && client.hasOptions;
};

export const clientWithGifts = client => {
    return isDefined(client) && isDefined(client.hasGifts) && client.hasGifts;
};

export const clientWithOriginContact = client => {
    return isDefined(client) && isDefined(client.hasOriginContact) && client.hasOriginContact;
};

export const clientWithPartners = client => {
    return isDefined(client) && isDefined(client.hasPartners) && client.hasPartners;
};

export const clientWithEmailConfirmation = client => {
    return isDefined(client) && isDefined(client.hasEmailConfirmation) && client.hasEmailConfirmation;
};

export const clientWithLandingManagement = client => {
    return isDefined(client) && isDefined(client.hasLandingManagement) && client.hasLandingManagement;
};

export const clientWithPaymentManagement = client => {
    return isDefined(client) && isDefined(client.hasPaymentManagement) && client.hasPaymentManagement;
};

export const getDefaultLanding = client => {
    if (isDefined(client) && isDefinedAndNotVoid(client.airportCodes) && clientWithLandingManagement(client)) {
        const mainAirport = client.airportCodes.find(airport => airport.main);
        const { code, nom, ...airport } = isDefined(mainAirport) ? mainAirport : client.airportCodes[0];
        return {id: +new Date(), airportCode: code, airportName: nom, complets: 1, touches: 0};
    }
    return [];
};

export const getAirportName = (client, code) => {
    const selectedAirport = client.airportCodes.find(a => a.code === code);
    return isDefined(selectedAirport) ? selectedAirport.nom : "";
};

export const paymentMode = [
    { id: 'cb', name: 'CB', color: '#fb923c' },                 // Orange
    { id: 'especes', name: 'Espèces', color: '#34d399' },       // Teal            
    { id: 'web', name: 'Site Web', color: '#38bdf8' },          // Sky
    { id: 'virement', name: 'Virement', color: '#a78bfa' },     // Violet
    { id: 'cheque', name: 'Chèque', color: '#f87171' },         // Red
];