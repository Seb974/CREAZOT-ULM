import { TextInput, FileInput, FileField, NumberInput, BooleanInput, SelectInput, SimpleFormIterator, ArrayInput, TabbedForm, useRedirect, useNotify, TimeInput, ReferenceInput, AutocompleteInput, ReferenceArrayInput, CheckboxGroupInput, DateTimeInput, NumberField, DateInput } from "react-admin";
import { Edit } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { timezones, fileInputSX, uploadImages, sanitizeData } from "../../../app/lib/client";
import { Typography, Divider, Box, Accordion, AccordionSummary, AccordionDetails, Alert, AlertTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ColorPreview } from './ColorPreview';
import { ThanksOptions } from './ThanksOptions';
import { useClient } from '../../admin/ClientProvider';
import { useSessionContext } from "../../admin/SessionContextProvider";

const OptionsOverrideWarning = () => {
    const { watch } = useFormContext();
    const pricingCategory = watch("pricingCategory");
    const isCustom = typeof pricingCategory === 'string'
        ? pricingCategory.includes('personnalise')
        : pricingCategory?.slug === 'personnalise';

    if (isCustom) return null;

    return (
        <Alert severity="warning" sx={{ mb: 2 }}>
            Les options ci-dessous seront <strong>écrasées à la sauvegarde</strong> par les packs de modules sélectionnés dans l'onglet Abonnement.
            Pour gérer les options manuellement, passez la grille tarifaire sur <strong>« Personnalisé »</strong>.
        </Alert>
    );
};

const BillingInfoAlert = () => {
    const annualDiscount = useWatch({ name: 'annualDiscount' }) ?? 30;

    return (
        <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Facturation automatisée via Odoo</AlertTitle>
            <strong>Mensuel</strong> : une facture est générée chaque mois au montant calculé.<br />
            <strong>Annuel</strong> : une seule facture par an avec {annualDiscount}% de remise. Engagement ferme, pas de remboursement anticipé.<br />
            Les factures sont envoyées automatiquement par email. En cas d'impayé, le compte est suspendu après 30 jours.
        </Alert>
    );
};

export const ClientsEdit = () => {

    const notify = useNotify();
    const redirect = useRedirect();
    const { updateClient } = useClient();
    const { session } = useSessionContext();

    const transform = async data => {
        const cachedClient = sessionStorage.getItem("client");
        const previousData = cachedClient ? JSON.parse(cachedClient) : null;

        const sanitizedData = sanitizeData(data, previousData);
        const images = await uploadImages(sanitizedData, session, data.id);
        // @ts-ignore
        const updatedClient = { ...sanitizedData, ...Object.fromEntries(images.map(img => [img.name, img.path || null])) };

        return updatedClient;
    };

    const onSubmit = async (data) => {
        const transformedData = await transform(data);

        try {
            const response = await fetch(`${transformedData['@id']}`, {
                method: 'PUT',
                body: JSON.stringify(transformedData),
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour');

            const updatedClient = await response.json();

            updateClient(updatedClient);
            notify('Le client a bien été mis à jour.', { type: 'success' });
            redirect('list', 'clients');
        } catch (error) {
            notify('Erreur : ' + error.message, { type: 'error' });
        }
    };

    return (
        // @ts-ignore
        <div style={{ overflowX: 'auto', width: '100%'}}>
            <Edit>
                <TabbedForm
                    onSubmit={ onSubmit }
                    syncWithLocation={false} 
                    defaultValues={(record) => ({
                        hasPassengerRegistration: false,
                        hasOptions: false, 
                        hasPartners: false,
                        hasGifts: false,
                        hasReservation: false,
                        hasLandingManagement: false,
                        hasEmailConfirmation: false,
                        hasPaymentManagement: false,
                        hasMicrotrakTag: false,
                        hasWebshop: false,
                        seuilMedical: 30,
                        seuilQualifications: 30,
                        hasIndividualFlightLogs: false,
                        useAvailabilityFilter: false,
                        hasExpensesManagement: false,
                        hasGroupUpdate: false,
                        hasNotam: false,
                        minHours: "1970-01-01T00:00:00+00:00",
                        maxHours: "1970-01-01T23:59:00+00:00",
                        ...record,
                    })}
                >   
                    <TabbedForm.Tab label="Informations">
                        <TextInput source="name" label="Nom"/>
                        <TextInput source="address" label="Adresse"/>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1} display="flex" alignItems="center">
                                <TextInput source="zipcode" label="Code postal"/>
                            </Box>
                            <Box flex={2}>
                                <TextInput source="city" label="Ville"/>
                            </Box>
                        </Box>
                        <TextInput source="email" label="Adresse email"/>
                        <TextInput source="phone" label="N° de téléphone"/>
                        <TextInput source="website" label="Site web"/>
                        <TextInput source="emailParams" label="Serveur d'email"/>
                        <TextInput source="emailAddressSender" label="Adresse email d'envoi"/>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <TimeInput source="minHours" label="Heure de démarrage"/>
                            </Box>
                            <Box flex={1}>
                                <TimeInput source="maxHours" label="Heure de fin"/>
                            </Box>
                        </Box>
                        <BooleanInput source="active" label="Utilisateur actif" />    
                    </TabbedForm.Tab>
                    <TabbedForm.Tab label="Options">
                        <OptionsOverrideWarning />
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
                                <BooleanInput source="hasOriginContact" label="Origine du contact" fullWidth/>  
                            </Box> 
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                 <BooleanInput source="hasLandingManagement" label="Gestion des atterrissages" fullWidth/>
                            </Box>
                            <Box flex={1}>
                               <BooleanInput source="hasPassengerRegistration" label="Enregistrement des passagers" fullWidth/>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <BooleanInput source="hasMicrotrakTag" label="Balise(s) Microtrak" fullWidth/>
                            </Box>
                            <Box flex={1}>
                                <BooleanInput source="hasWebshop" label="Site e-commerce lié" fullWidth/>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <BooleanInput source="hasIndividualFlightLogs" label="Carnets de vols individuels" fullWidth/>
                            </Box>
                            <Box flex={1}>
                                <BooleanInput source="useAvailabilityFilter" label="Fitrer sur les disponibilités" fullWidth/>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <BooleanInput source="hasPaymentManagement" label="Gestion des paiements" fullWidth/>
                            </Box>
                            <Box flex={1}>
                                <BooleanInput source="hasGifts" label="Gestion des prépaiements" fullWidth/>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <BooleanInput source="hasExpensesManagement" label="Gestion des dépenses" fullWidth/>
                            </Box>
                            <Box flex={1}>
                            <BooleanInput source="hasGroupUpdate" label="Mise à jour des groupes" fullWidth/>
                        </Box>
                        </Box>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <BooleanInput source="hasNotam" label="NOTAMs / SNOWTAMs" fullWidth/>
                            </Box>
                            <Box flex={1}/>
                        </Box>
                        <Divider sx={{ mt: 2, borderBottomWidth: 2, borderColor: '#666' }} />
                    </TabbedForm.Tab>
                    <TabbedForm.Tab label="Dashboard">
                        <ColorPreview/>
                        <SelectInput source="timezone" choices={ timezones }/>   
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <NumberInput source="lat" label="Latitude" fullWidth />
                            </Box>
                            <Box flex={1}>
                                <NumberInput source="lng" label="Longitude" fullWidth />
                            </Box>
                        </Box>
                        <NumberInput source="zoom" label="Zoom" min={ 1 } max={ 15 }/>
                        <Typography variant="h6" gutterBottom>
                            Seuils d'alerte
                        </Typography>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <NumberInput source="seuilMedical" label="Alerte sur les certificats médicaux" min={ 0 } helperText="Nb de jour(s) avant la fin de validité"/>
                            </Box>
                            <Box flex={1}>
                                <NumberInput source="seuilQualifications" label="Alerte sur les qualifications" min={ 0 } helperText="Nb de jour(s) avant la fin de validité"/>
                            </Box>
                        </Box>
                        <ThanksOptions/>
                    </TabbedForm.Tab>
                    <TabbedForm.Tab label="Images">
                        <FileInput label="Logo" source="logo" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                                    format={(value) => {
                                    if (typeof value === 'string') {
                                        return [{ src: value, title: value.split('/').pop() }];
                                    }
                                    return value;
                                }}
                        >
                            <FileField source="src" title="title" />
                        </FileInput> 
                        <FileInput label="Icone GPS" source="mapIcon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                                    format={(value) => {
                                    if (typeof value === 'string') {
                                        return [{ src: value, title: value.split('/').pop() }];
                                    }
                                    return value;
                                }}
                        >
                            <FileField source="src" title="title" />
                        </FileInput> 
                        <FileInput label="Favicon" source="favicon" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                                    format={(value) => {
                                    if (typeof value === 'string') {
                                        return [{ src: value, title: value.split('/').pop() }];
                                    }
                                    return value;
                                }}
                        >
                            <FileField source="src" title="title" />
                        </FileInput>
                        <FileInput label="Image de la page de remerciement" source="thanksImage" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                                    format={(value) => {
                                    if (typeof value === 'string') {
                                        return [{ src: value, title: value.split('/').pop() }];
                                    }
                                    return value;
                                }}
                        >
                            <FileField source="src" title="title" />
                        </FileInput>
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={2}>
                                <FileInput label="Arrière plan PDF" source="pdfBackground" accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }} sx={ fileInputSX }
                                            format={(value) => {
                                            if (typeof value === 'string') {
                                                return [{ src: value, title: value.split('/').pop() }];
                                            }
                                            return value;
                                        }}
                                >
                                    <FileField source="src" title="title" />
                                </FileInput>
                            </Box>
                            <Box flex={1} display="flex" alignItems="center" pt={2}>
                                <NumberInput source="opacity" label="Opacité" min={ 0 } max={ 1 } fullWidth />
                            </Box>
                        </Box>
                    </TabbedForm.Tab>
                    <TabbedForm.Tab label="Abonnement">
                        <ReferenceInput source="pricingCategory" reference="pricing-categories">
                            <AutocompleteInput optionText="name" label="Grille tarifaire" fullWidth />
                        </ReferenceInput>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Les packs de modules ci-dessous définissent automatiquement les options du client à la sauvegarde.
                            Pour gérer les options manuellement, sélectionnez la grille tarifaire <strong>« Personnalisé »</strong>.
                        </Alert>
                        <ReferenceArrayInput source="modulePacks" reference="module-packs">
                            <CheckboxGroupInput optionText="name" label="Packs de modules" />
                        </ReferenceArrayInput>
                        <SelectInput source="subscriptionStatus" label="Statut de l'abonnement" choices={[
                            { id: "trial", name: "Essai" },
                            { id: "active", name: "Actif" },
                            { id: "suspended", name: "Suspendu" },
                            { id: "cancelled", name: "Annulé" },
                        ]} />
                        <DateTimeInput source="trialEndsAt" label="Fin de la période d'essai" />
                        <NumberInput source="maxAeronefs" label="Nombre max d'aéronefs" />
                        <Divider sx={{ mt: 2, mb: 2, borderBottomWidth: 2, borderColor: '#666' }} />
                        <Typography variant="h6" gutterBottom>
                            Facturation
                        </Typography>
                        <SelectInput
                            source="billingCycle"
                            label="Cycle de facturation"
                            choices={[
                                { id: 'monthly', name: 'Mensuel' },
                                { id: 'annual', name: 'Annuel (-30%)' },
                            ]}
                            defaultValue="monthly"
                        />
                        <NumberInput
                            source="annualDiscount"
                            label="Remise annuelle (%)"
                            min={0}
                            max={100}
                            step={5}
                            defaultValue={30}
                            helperText="Remise appliquée sur le tarif annuel (par défaut 30%)"
                        />
                        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                            <Box flex={1}>
                                <DateInput
                                    source="nextBillingDate"
                                    label="Prochaine facturation"
                                    fullWidth
                                />
                            </Box>
                            <Box flex={1}>
                                <DateInput
                                    source="lastInvoiceDate"
                                    label="Dernière facture"
                                    disabled
                                    fullWidth
                                />
                            </Box>
                        </Box>
                        <NumberInput
                            source="monthlyBasePrice"
                            label="Prix mensuel calculé (€)"
                            disabled
                            helperText="Calculé automatiquement à partir de la grille et des modules"
                        />
                        <BillingInfoAlert />
                        <Accordion sx={{ mt: 3, width: "100%" }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Odoo (Phase 3)</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TextInput source="odooCustomerId" label="ID client Odoo" fullWidth />
                                <TextInput source="odooSubscriptionId" label="ID abonnement Odoo" fullWidth />
                            </AccordionDetails>
                        </Accordion>
                    </TabbedForm.Tab>
                </TabbedForm>
            </Edit>
        </div>
    )
};