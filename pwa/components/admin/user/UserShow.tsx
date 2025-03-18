import { Show, SimpleShowLayout, TextField, DateField, EmailField } from 'react-admin';

export const UserShow = () => {

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="firstName" label="Prénom" sortable={ true }/>
                <TextField source="lastName" label="Nom" sortable={ true }/>
            </SimpleShowLayout>
        </Show>
    );
}