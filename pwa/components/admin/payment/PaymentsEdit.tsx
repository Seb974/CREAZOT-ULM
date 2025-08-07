import { ArrayInput, DateInput, Edit, SelectInput, SimpleFormIterator } from "react-admin";
import { SimpleForm, TextInput, NumberInput } from "react-admin";
import { paymentMode } from "../../../app/lib/client";
import { isDefined } from "../../../app/lib/utils";

export const PaymentsEdit = () => {

   const transform = ({details, ...data}) => {
    return {
      ...data,
      details: details.map((d) => {
        return {
        ...d, 
        prepayment: isDefined(d.prepayment) && isDefined(d.prepayment.code) ? 
            typeof d.prepayment === 'string' ? d.prepayment : d.prepayment['@id'] :
            null}
      })
    };
  };

  return (
    <Edit transform={transform}>
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
                  <TextInput source="prepayment.code" label="Prépaiement" readOnly/>
              </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '80px!important'} }}/>
        </SimpleForm>
    </Edit>
  )
};