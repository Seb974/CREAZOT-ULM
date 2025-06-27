import { ArrayInput, DateInput, Edit, SelectInput, SimpleFormIterator } from "react-admin";
import { SimpleForm, TextInput, NumberInput } from "react-admin";
import { paymentMode } from "../../../app/lib/client";

export const PaymentsEdit = () => {

  return (
    <Edit>
        <SimpleForm>
          <TextInput source="reference" label="Code du paiement" disabled={ true }/>
          <DateInput source="date" label="Date du paiement" />
          <TextInput source="reservationCode" label="Code de réservation"/>
          <TextInput source="name" label="Nom de la réservation"/>
          <TextInput source="label" label="Détail (si pas de réservation)"/>
          <ArrayInput source="details" label="" defaultValue={[{ mode: '', montant: '' }]}>
              <SimpleFormIterator inline disableAdd={false} disableRemove={false}>
                  <SelectInput
                      source="mode"
                      label="Mode"
                      choices={ paymentMode }
                  />
                  <NumberInput source="amount" label="Montant (€)"/>
              </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '80px!important'} }}/>
        </SimpleForm>
    </Edit>
  )
};