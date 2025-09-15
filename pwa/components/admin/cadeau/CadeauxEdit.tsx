import { SimpleForm, DateInput, Edit, TextInput, ReferenceInput, BooleanInput, NumberInput, ReferenceArrayInput  } from "react-admin";
import { Box } from "@mui/material";
import { DateExpirationInput } from "./DateExpirationInput";
import { PersonsInput } from "./PersonsInput";
import { MessageInput } from "./MessageInput";
import { PrixInput } from "./PrixInput";
import { SendEmailInput } from "./SendEmailInput";
import { useClient } from '../../admin/ClientProvider';
import { getFormattedValueForBackEnd, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithOptions, clientWithPartners } from "../../../app/lib/client";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

const OptionsInput = ({ client }) => !clientWithOptions(client) ? null : 
    <ReferenceInput reference="combinaisons" source="options.@id" label="Option"/>

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

export const CadeauxEdit = () => {

  const { client } = useClient();

  const transform = (data) => {
    const formattedData = {
        ...data,
        date: new Date(data.date),
        fin: new Date(data.fin),
        sendEmail: data.gift && data.sendEmail,
        offreur: data.gift ? data.offreur : data.beneficiaire,
        origine: isDefinedAndNotVoid(data.origines) ? data.origines.map(o => getFormattedValueForBackEnd(o)) : [],
        circuit: getFormattedValueForBackEnd(data?.circuit),
        options: getFormattedValueForBackEnd(data?.options),
        option: getFormattedValueForBackEnd(data.option)

    };
    return formattedData;
  };

  return (
    <Edit redirect="list" transform={transform} title="Modifier le prépaiement">
      <SimpleForm>
          <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
            <Box flex={1}>
                <DateInput source="date" label="Date d'achat"/>
            </Box>
            <Box flex={1}>
              <DateExpirationInput />
            </Box>
          </Box>
          <TextInput source="code" label="N° du bon cadeau" readOnly/>
          <PersonsInput />
          <TextInput source="email" label="Adresse email"/>
          <TextInput source="telephone" label="N° de téléphone"/>
          <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
              <Box flex={1} display="flex" alignItems="center">
                <NumberInput source="quantite" label="Quantité" />
              </Box>
              <Box flex={2}>
                <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit"/>
              </Box>
          </Box>
          <OptionsInput client={ client }/>
          <PartnersInput client={ client }/>
          <TextInput source="paymentId" label="N° du paiement"/>
          <MessageInput />
          <PrixInput />
          <SendEmailInput />
          <BooleanInput source="used" label="Bon déjà utilisé"/>
        </SimpleForm>
    </Edit>
  )
};