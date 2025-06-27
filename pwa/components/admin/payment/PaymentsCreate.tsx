import { ArrayInput, AutocompleteInput, DateInput, NumberInput, SelectInput, SimpleForm, SimpleFormIterator, required, useDataProvider, useGetList, useNotify, useRedirect, TextInput } from "react-admin";
import { Create } from "react-admin";
import { Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { generateSafeCode, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { paymentMode } from "../../../app/lib/client";

const ReservationField = ({ choices = [], isLoading = false }) => {
    const { control } = useFormContext();
    const selectedReservation = useWatch({ control, name: 'reservation' });

    const selectedChoice = useMemo(() => {
        return choices.find(choice => choice.id === selectedReservation);
    }, [selectedReservation, choices]);

    const helperText = selectedReservation && selectedChoice?.prix
        ? <><b>{ `${selectedChoice.prix.toFixed(2)} €` }</b>{`  - Attention aux upsells et options.`}</>
        : undefined;

    return (
        <>
            <AutocompleteInput
                label="Réservation"
                source="reservation"
                choices={[...choices, { id: 'autre', name: 'Autre...' }]}
                isLoading={isLoading}
                defaultValue={'autre'}
                helperText={selectedReservation && selectedReservation !== 'autre' ? helperText : ''}
            />
            { selectedReservation === 'autre' &&
                <TextInput
                    source="label"
                    label="Détail du paiement"
                    validate={required()}
                    fullWidth
                />
            }
        </>
    );
};

export const PaymentsCreate = () => {

    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reservationsMemo, setReservationsMemo] = useState([]);

    const dateOnlyISO = selectedDate.toISOString().split('T')[0];
    const filter = useMemo(() => ({
        'debut[after]': `${dateOnlyISO}T00:00:00`,
        'debut[before]': `${dateOnlyISO}T23:59:59`,
        paid: false,
    }), [dateOnlyISO]);
    
    const { data: reservations, isLoading, error } = useGetList('reservations', {
        filter,
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'debut', order: 'ASC' },
    });

    useMemo(() => {
        if (reservations)
            setReservationsMemo(reservations);
    }, [reservations]);

    const groupedReservations = useMemo(() => {
        if (!Array.isArray(reservations)) return [];
    
        const groups = reservations.reduce((acc, resa) => {
            const key = resa.codeReservation || `${resa.nom}_${resa.debut}`;
            if (!acc[key]) {
                acc[key] = {
                    ids: [],
                    nom: resa.nom,
                    debut: resa.debut,
                    prix: 0,
                };
            }
            acc[key].ids.push(resa['@id']);
            acc[key].prix += resa.prix || 0;
            return acc;
        }, {});
    
        return Object.entries(groups).map(([key, value]) => ({
            // @ts-ignore
            id: value.ids[0],
            // @ts-ignore
            name: `${value.nom} - ${new Date(value.debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            // @ts-ignore
            prix: value.prix
        }));
    }, [reservations]);
    

    const onSubmit = async (values: any) => {
        const {reservation, label, ...formData} = values;
        const selectedResa = reservationsMemo.find(r => r['@id'] === reservation);

        const extra = {
            name: isDefined(selectedResa) ? selectedResa.nom : null,
            reservationCode: isDefined(selectedResa) && isDefined(selectedResa.reservationCode) ? selectedResa.reservationCode : null,
            label: !isDefined(selectedResa) && isDefined(label) ? label : null,
            reference: generateSafeCode('PAY'),
        };
        const data = {...formData, ...extra };            
        try {
            await dataProvider.create('payments', { data: data });
            notify('Paiement enregistré avec succès', { type: 'success' });
            redirect('list', 'payments');
        } catch (error) {
            notify('Erreur lors de l\'enregistrement', { type: 'error' });
        }
    };

    if (error) return <p>Erreur : {error.message}</p>;

    return (
        <Create>
            <SimpleForm onSubmit={onSubmit}>
                <DateInput 
                    source="date" 
                    label="Date du paiement" 
                    defaultValue={selectedDate}
                    onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        if (!isNaN(newDate.getTime())) 
                            setSelectedDate(newDate);
                    }} 
                />
                <ReservationField choices={groupedReservations} isLoading={isLoading} />
                <Typography className="mt-4" variant="h6" gutterBottom>Modes de paiement</Typography>
                <ArrayInput source="details" label="" defaultValue={[{ mode: '', montant: '' }]}>
                    <SimpleFormIterator inline disableAdd={false} disableRemove={false}>
                        <SelectInput
                            source="mode"
                            label="Mode"
                            choices={ paymentMode }
                        />
                        <NumberInput source="amount" label="Montant (€)" validate={required()}/>
                    </SimpleFormIterator>
                </ArrayInput>
                <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '80px!important'} }}/>
            </SimpleForm>
        </Create>
  )
};