import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField } from 'react-admin';

export const CircuitShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="nom" />
            <TextField source="code" />
            <NumberField source="prix" options={{ style: 'currency', currency: 'EUR' }}/>
            <NumberField source="cout" label="Coût pilote" options={{ style: 'currency', currency: 'EUR' }}/>
            <DateField source="duree" label="Durée" showTime showDate={false}/>
            <TextField source="nature.label" label="Nature de la prestation"/>
            <BooleanField source="prixFixe" label="Prix indépendant de la durée"/>
            <BooleanField source="avecOptions" label="Options disponibles"/>
        </SimpleShowLayout>
    </Show>
)