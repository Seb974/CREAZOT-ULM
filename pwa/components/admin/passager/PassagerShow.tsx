import { Show, SimpleShowLayout, TextField, DateField, EmailField } from 'react-admin';

export const PassagerShow = () => {

    return (
        <Show>
            <SimpleShowLayout>
                <DateField source="date" label="Date" sortable={ true } />
                    <TextField source="nom" label="Nom" sortable={ true }/>
                    <TextField source="prenom" label="Prénom" sortable={ true }/>
                    <TextField source="telephone" label="Prénom" sortable={ true }/>
                    <EmailField source="email" label="Adresse email"/>
            </SimpleShowLayout>
        </Show>
    );
}