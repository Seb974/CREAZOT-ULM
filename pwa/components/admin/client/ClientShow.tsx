import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const ClientShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Nom"/>
        </SimpleShowLayout>
    </Show>
)