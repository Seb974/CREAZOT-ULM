import { Show, SimpleShowLayout, TextField, DateField, EmailField, FunctionField } from 'react-admin';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { isDefined } from '../../../app/lib/utils';

export const PassagerShow = () => {

    const getConsentIcon = ({ consentAccepted }) => {
        return isDefined(consentAccepted) ? 
        consentAccepted ? 
            <DoneIcon className="text-green-500"/> : 
            <ClearIcon className="text-red-500"/> :
        <></>
    };

    return (
        <Show>
            <SimpleShowLayout>
                <DateField source="date" label="Date" sortable={ true } />
                <TextField source="nom" label="Nom" sortable={ true }/>
                <TextField source="prenom" label="Prénom" sortable={ true }/>
                <TextField source="telephone" label="Prénom" sortable={ true }/>
                <EmailField source="email" label="Adresse email"/>
                <FunctionField 
                    source="consentAccepted"
                    label="Consentement"
                    render={record => getConsentIcon(record) }
                    textAlign="center"
                />
                <DateField source="consentDatetime" locales="fr-FR" showTime showDate={ false } label="Accepté à"/>
                <TextField source="consentText" label="Texte accepté"/>
            </SimpleShowLayout>
        </Show>
    );
}