import { SimpleForm, TextInput, DateInput, ReferenceInput, ArrayInput,  SimpleFormIterator, required, Create, useCreate, useRedirect, useNotify, NumberInput } from "react-admin";
import { Box } from "@mui/material";
import { PrixInput } from "./PrixInput";
import { PersonsInput } from "./PersonsInput";
import { MessageInput } from "./MessageInput";
import { SendEmailInput } from "./SendEmailInput";
import { useClient } from '../../admin/ClientProvider';
import { DateExpirationInput } from "./DateExpirationInput";
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { clientWithPartners } from "../../../app/lib/client";

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
            origine: isDefinedAndNotVoid(data.origine) ? data.origine.map(o => o['@id']) : [],
            circuit: isDefined(data.circuit) ? typeof data.circuit === 'string' ? data.circuit : data.circuit['@id'] : null,
            options: isDefined(data.options) ? typeof data.options === 'string' ? data.options : data.options['@id'] : null,
            option: isDefined(data.option) ? typeof data.option === 'string' ? data.option : data.option['@id'] : null,
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

  const PartnersInput = () => !clientWithPartners(client) ? null : 
      <ArrayInput source="origine" label="Origine de l'appel">
        <SimpleFormIterator inline disableReordering>
            <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
        </SimpleFormIterator>
      </ArrayInput>

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
        <ReferenceInput reference="combinaisons" source="options" label="Option" />
        <PartnersInput/>
        <TextInput source="paymentId" label="N° du paiement"/>
        <MessageInput />
        <PrixInput />
        <SendEmailInput />
      </SimpleForm>
    </Create>
  );
};