import { ArrayInput, DateInput, Edit, ReferenceArrayInput, ReferenceInput, SelectArrayInput, SelectInput, SimpleFormIterator, useRecordContext } from "react-admin";
import { SimpleForm, TextInput, NumberInput } from "react-admin";
import { clientWithOriginContact, clientWithPartners, paymentMode } from "../../../app/lib/client";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useClient } from "../ClientProvider";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

const PartnersInput = ({ client }) => { 

    const { setValue, getValues } = useFormContext();
    const origines = getValues('origine') ?? [];

    if (!clientWithPartners(client)) return null;

    useEffect(() => {
        const formattedValues = origines.map(o => getFormattedValueForBackEnd(o));
        setValue("origines", formattedValues);
    }, [origines, setValue]);

    return <ReferenceArrayInput source="origines" reference="origines" label="Contact initial"/>;
}
    
export const PaymentsEdit = () => {

  const { client } = useClient();

   const transform = ({details, origines, ...data}) => {
    return {
      ...data,
      origine: clientWithOriginContact(client) && isDefinedAndNotVoid(origines) ? origines.map(o => getFormattedValueForBackEnd(o)) : [],
      details: details.map((d) => {
        return {...d, prepayment: isDefined(d?.prepayment?.code) ? getFormattedValueForBackEnd(d.prepayment) : null }
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
          <PartnersInput client={ client }/>
          <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '80px!important'} }}/>
        </SimpleForm>
    </Edit>
  )
};