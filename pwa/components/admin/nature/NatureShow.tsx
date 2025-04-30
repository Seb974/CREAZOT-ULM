import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const NatureShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="code" label="Code"/>
            <TextField source="label" label="Label"/>
        </SimpleShowLayout>
    </Show>
)