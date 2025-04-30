import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

export const OptionShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="name" label="Nom de l'option"/>
            <NumberField source="prix" label="Prix" options={{ style: 'currency', currency: 'EUR' }}/>
        </SimpleShowLayout>
    </Show>
)