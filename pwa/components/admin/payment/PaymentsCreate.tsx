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

    return (
        <>
            <AutocompleteInput
                label="Réservation"
                source="reservation"
                choices={[...choices, { id: 'autre', name: 'Autre...' }]}
                isLoading={isLoading}
            />
            { selectedReservation === 'autre' &&
                <TextInput
                    source="label"
                    label="Description de la réservation"
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
        if (reservations) {
            setReservationsMemo(reservations);
        }
    }, [reservations]);

    const filteredReservations = useMemo(() => {
        const seen = new Set();
        return isDefinedAndNotVoid(reservations) ? reservations.filter(r => {
            const code = r.codeReservation || r.nom;
            if (seen.has(code)) return false;
            seen.add(code);
            return true;
        }) : [];
    }, [reservations]);

    const choices = filteredReservations
        ?.slice()
        .sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime())
        .map((r: any) => ({
            id: r['@id'],
            name: `${r.nom} - ${new Date(r.debut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        })) || [];

    const onSubmit = async (values: any) => {
        const {reservation, label, ...formData} = values;
        const selectedResa = reservationsMemo.find(r => r['@id'] === reservation);

        const extra = {
            name: isDefined(selectedResa) ? selectedResa.nom : '',
            reservationCode: isDefined(selectedResa) ? (isDefined(selectedResa.reservationCode) ? selectedResa.reservationCode : selectedResa['@id']) : '',
            label: !isDefined(selectedResa) && isDefined(label) ? label : '',
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
                <ReservationField choices={choices} isLoading={isLoading} />
                <Typography variant="h6" gutterBottom>Modes de paiement</Typography>
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