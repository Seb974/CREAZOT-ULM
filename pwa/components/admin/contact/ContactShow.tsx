import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const ContactShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Nom"/>
        </SimpleShowLayout>
    </Show>
)