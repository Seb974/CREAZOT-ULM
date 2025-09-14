import { SimpleForm, TextInput, DateInput, ReferenceInput, ArrayInput,  SimpleFormIterator, required, Create, useCreate, useRedirect, useNotify, NumberInput, ReferenceArrayInput, SelectInput } from "react-admin";
import { Box } from "@mui/material";
import { PrixInput } from "./PrixInput";
import { PersonsInput } from "./PersonsInput";
import { MessageInput } from "./MessageInput";
import { SendEmailInput } from "./SendEmailInput";
import { useClient } from '../../admin/ClientProvider';
import { DateExpirationInput } from "./DateExpirationInput";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithOptions, clientWithPartners } from "../../../app/lib/client";

const OptionsInput = ({ client }) => !clientWithOptions(client) ? null : 
    <ReferenceInput reference="combinaisons" source="options" label="Option" />
  
const PartnersInput = ({ client }) => !clientWithPartners(client) ? null : 
    <ReferenceArrayInput source="origine" reference="origines" label="Contact initial"/>

export const CadeauxCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const { client } = useClient();

  const onSubmit = async (data) => {
    try {
        data = {
            ...data,
            code: getUniqueCode(), 
            used: false,
            date: new Date(data.date),
            fin: new Date(data.fin),
            sendEmail: data.gift && data.sendEmail,
            offreur: data.gift ? data.offreur : data.beneficiaire,
            origine: clientWithPartners(client) && isDefinedAndNotVoid(data?.origine) ? data.origine.map(o => getFormattedValueForBackEnd(o)) : [],
            circuit: isDefined(data.circuit) ? getFormattedValueForBackEnd(data.circuit) : null,
            options: isDefined(data.options) ? getFormattedValueForBackEnd(data.options) : null,
            option: isDefined(data.option) ? getFormattedValueForBackEnd(data.option) : null,
        };
        create('cadeaux', { data });
        notify('Le bon cadeau a bien été enregistré.', { type: 'info' });
        redirect('list', 'cadeaux');
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement du bon cadeau.`, { type: 'error' });
      redirect('list', 'cadeaux');
      console.warn(error);
    }
  };

  const getUniqueCode = () => Date.now().toString(36).substr(6) + Math.random().toString(36).substr(2);

  return (
    <Create redirect="list" title="Créer un prépaiement">
      <SimpleForm onSubmit={ onSubmit }>
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
          <Box flex={1}>
              <DateInput source="date" defaultValue={ new Date() } label="Date d'achat"/>
          </Box>
          <Box flex={1}>
            <DateExpirationInput />
          </Box>
        </Box>
        <PersonsInput />
        <TextInput source="email" label="Adresse email" />
        <TextInput source="telephone" label="N° de téléphone" />
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
            <Box flex={1} display="flex" alignItems="center">
              <NumberInput source="quantite" label="Quantité" defaultValue={ 1 } validate={required()} min={ 1 }/>
            </Box>
            <Box flex={2}>
              <ReferenceInput reference="circuits" source="circuit" label="Circuit"/>
            </Box>
        </Box>
        <OptionsInput client={ client }/>
        <PartnersInput client={ client }/>
        <TextInput source="paymentId" label="N° du paiement"/>
        <MessageInput />
        <PrixInput />
        <SendEmailInput />
      </SimpleForm>
    </Create>
  );
};