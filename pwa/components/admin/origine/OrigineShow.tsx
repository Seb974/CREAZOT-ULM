import { Show, SimpleShowLayout, TextField, NumberField, BooleanField } from 'react-admin';

export const OrigineShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Nom"/>
            <NumberField source="discount" label="Remise" options={{ style: 'percent' }}/>
            <BooleanField source="hasCommission" label="Rétro-commission"/>
        </SimpleShowLayout>
    </Show>
)