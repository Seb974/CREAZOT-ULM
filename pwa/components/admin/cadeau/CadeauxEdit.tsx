import { SimpleForm, DateInput, Edit, TextInput, ReferenceInput, ArrayInput, SimpleFormIterator, BooleanInput, NumberInput  } from "react-admin";
import { Box } from "@mui/material";
import { DateExpirationInput } from "./DateExpirationInput";
import { PersonsInput } from "./PersonsInput";
import { MessageInput } from "./MessageInput";
import { PrixInput } from "./PrixInput";
import { SendEmailInput } from "./SendEmailInput";
import { useClient } from '../../admin/ClientProvider';
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithPartners } from "../../../app/lib/client";

export const CadeauxEdit = () => {

  const { client } = useClient();

  const transform = (data) => {
    const formattedData = {
        ...data,
        date: new Date(data.date),
        fin: new Date(data.fin),
        sendEmail: data.gift && data.sendEmail,
        offreur: data.gift ? data.offreur : data.beneficiaire,
        origine: isDefinedAndNotVoid(data.origine) ? data.origine.map(o => o['@id']) : [],
        circuit: isDefined(data.circuit) ? typeof data.circuit === 'string' ? data.circuit : data.circuit['@id'] : null,
        options: isDefined(data.options) ? typeof data.options === 'string' ? data.options : data.options['@id'] : null,
        option: isDefined(data.option) ? typeof data.option === 'string' ? data.option : data.option['@id'] : null,

    };
    return formattedData;
  };

  const PartnersInput = () => !clientWithPartners(client) ? null : 
      <ArrayInput source="origine" label="Origine de l'appel">
        <SimpleFormIterator inline disableReordering>
            <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
        </SimpleFormIterator>
      </ArrayInput>

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
          <ReferenceInput reference="combinaisons" source="options.@id" label="Option" />
          <PartnersInput/>
          <TextInput source="paymentId" label="N° du paiement"/>
          <MessageInput />
          <PrixInput />
          <SendEmailInput />
          <BooleanInput source="used" label="Bon déjà utilisé"/>
        </SimpleForm>
    </Edit>
  )
};