import { Show, SimpleShowLayout, TextField, DateField, NumberField } from 'react-admin';

export const VolShow = () => (
    <Show>
        <SimpleShowLayout>
            <DateField source="prestation.date" label="Date"/>
            <TextField source="prestation.aeronef.immatriculation" label="Aéronef"/>
            <TextField source="prestation.pilote.firstName" label="Pilote"/>
            <NumberField source="quantite" label="Nombre de vol(s)"/>
            <TextField source="circuit.nom" label="Circuit"/>
            <TextField source="circuit.nature.label" label="Nature"/> 
            <TextField source="option.nom" label="Option"/>
            <NumberField source="prix" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
        </SimpleShowLayout>
    </Show>
)