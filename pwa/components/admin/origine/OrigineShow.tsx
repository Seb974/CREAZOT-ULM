import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const OrigineShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Nom"/>
            <NumberField source="discount" label="Remise" options={{ style: 'percent' }}/>
        </SimpleShowLayout>
    </Show>
)