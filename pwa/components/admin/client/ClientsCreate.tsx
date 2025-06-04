import { TextInput, FileInput, FileField, NumberInput, BooleanInput, SelectInput, SimpleFormIterator, ArrayInput, TabbedForm, required, useRedirect, useNotify } from "react-admin";
import { Create } from "react-admin";
import { colors, objectToFormData, timezones, fileInputSX, sanitizeData } from "../../../app/lib/client";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { ColorPreview } from './ColorPreview';
import { ThanksOptions } from './ThanksOptions';

export const ClientsCreate = () => {

    const notify = useNotify();
    const redirect = useRedirect();
    const session = useSession();

    const onSubmit = async data => {
        const sanitizedData = sanitizeData(data);
        const formData = objectToFormData(sanitizedData);
        try {
            // @ts-ignore
            const response = await fetch('/clients', { method: 'POST', body: formData, headers: {'Authorization': `Bearer ${session.data.accessToken}`}});
        
            if (!response.ok) throw new Error('Erreur lors de l’envoi');
            notify('Le client a bien été enregistré.', { type: 'success' });
            redirect('list', 'clients');
          } catch (error) {
            notify('Erreur : ' + error.message, { type: 'error' });
          }
    };

    return (
        <Create redirect="list">
            <TabbedForm 
                onSubmit={ onSubmit }
                defaultValues={(record) => ({
                    active: true,
                    timezone: timezones[0].id,
                    color: colors[0].id,
                    zoom: 9,
                    opacity: 1,
                    hasPassengerRegistration: false,
                    hasOptions: false, 
                    hasPartners: false,
                    hasGifts: false,
                    hasReservation: false,
                    hasOriginContact: false,
                    hasLandingManagement: false,
                    hasEmailConfirmation: false,
                    airportCodes: record?.airportCodes?.map(code => ({ ...code, meteo: code.meteo ?? false, main: code.main ?? false })) ?? [],
                })}
            >
                <TabbedForm.Tab label="Informations">
                    <TextInput source="name" label="Nom" validate={required()}/>
                    <TextInput source="address" label="Adresse" validate={required()}/>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1} display="flex" alignItems="center">
                            <TextInput source="zipcode" label="Code postal" validate={required()}/>
                        </Box>
                        <Box flex={2}>
                            <TextInput source="city" label="Ville" validate={required()}/>
                        </Box>
                    </Box>
                    <TextInput source="email" label="Adresse email" validate={required()}/>
                    <TextInput source="phone" label="N° de téléphone" validate={required()}/>
                    <TextInput source="website" label="Site web"/>
                    <TextInput source="emailServer" label="Serveur d'email SendGrid"/>
                    <TextInput source="emailAddressSender" label="Adresse email d'envoi"/>
                    <BooleanInput source="active" label="Utilisateur actif" />
                </TabbedForm.Tab>
                <TabbedForm.Tab label="Dashboard">
                    <ColorPreview/>
                    <SelectInput source="timezone" choices={ timezones } validate={required()}/>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1}>
                            <NumberInput source="lat" label="Latitude" fullWidth />
                        </Box>
                        <Box flex={1}>
                            <NumberInput source="lng" label="Longitude" fullWidth />
                        </Box>
                    </Box>
                    <NumberInput source="zoom" label="Zoom"  min={ 1 } max={ 15 }/>
                    <ArrayInput source="airportCodes" label="Codes des aéroports">
                        <SimpleFormIterator inline disableReordering>
                            <TextInput source="code"/>
                            <TextInput source="nom"/>
                            <BooleanInput source="meteo" parse={(value) => value === undefined ? false : value} sx={{marginTop: '1em'}}/>
                            <BooleanInput source="main" label="principal" parse={(value) => value === undefined ? false : value} sx={{marginTop: '1em'}}/>
                        </SimpleFormIterator>
                    </ArrayInput>
                    <ArrayInput source="camIds" label="Caméras Windy">
                        <SimpleFormIterator inline disableReordering>
                            <TextInput source="id"/>
                            <TextInput source="nom"/>
                        </SimpleFormIterator>
                    </ArrayInput>
                </TabbedForm.Tab>
                <TabbedForm.Tab label="Images">
                    <FileInput label="Logo" source="logo" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                        <FileField source="src" title="title" />
                    </FileInput> 
                    <FileInput label="Icone GPS" source="mapIcon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                        <FileField source="src" title="title" />
                    </FileInput> 
                    <FileInput label="Favicon" source="favicon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                        <FileField source="src" title="title" />
                    </FileInput>
                    <FileInput label="Image de la page de remerciement" source="thanksImage" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                        <FileField source="src" title="title" />
                    </FileInput>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={2}>
                            <FileInput label="Arrière plan PDF" source="pdfBackground" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }>
                                <FileField source="src" title="title" />
                            </FileInput>
                        </Box>
                        <Box flex={1} display="flex" alignItems="center" pt={2}>
                            <NumberInput source="opacity" label="Opacité" min={ 0 } max={ 1 } fullWidth />
                        </Box>
                    </Box>
                </TabbedForm.Tab>
                <TabbedForm.Tab label="Options">
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1}>
                            <BooleanInput source="hasReservation" label="Réservations" fullWidth/>
                        </Box>
                        <Box flex={1}>
                            <BooleanInput source="hasOptions" label="Options" fullWidth/>
                        </Box>
                    </Box>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1}>
                            <BooleanInput source="hasPartners" label="Partenariat" fullWidth/>
                        </Box>
                        <Box flex={1}>
                            <BooleanInput source="hasGifts" label="Cadeaux" fullWidth/>
                        </Box> 
                    </Box>
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1}>
                            <BooleanInput source="hasOriginContact" label="Origine du contact" fullWidth/>
                        </Box>
                        <Box flex={1}>
                            <BooleanInput source="hasLandingManagement" label="Gestion des atterrissages" fullWidth/>
                        </Box>
                    </Box>
                    <BooleanInput source="hasPassengerRegistration" label="Enregistrement des passagers" fullWidth/>
                    <ThanksOptions/>
                </TabbedForm.Tab>
            </TabbedForm>
        </Create>
    )
};