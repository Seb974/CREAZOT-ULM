import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, FunctionField } from 'react-admin';
import Chip from '@mui/material/Chip';

export const CircuitShow = () => {

    const getShipStyle = ({ color }) => ({
        backgroundColor: color + '33',
        color: color,
        border: '1px solid',
        borderColor: color,
        marginRight: '4px',
        marginBottom: '2px',
        marginTop: '2px'
    });

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="nom" />
                <TextField source="code" />
                <NumberField source="prix" options={{ style: 'currency', currency: 'EUR' }}/>
                <NumberField source="cout" label="Coût pilote" options={{ style: 'currency', currency: 'EUR' }}/>
                <DateField source="duree" label="Durée" showTime showDate={false}/>
                <TextField source="nature.label" label="Nature de la prestation"/>
                <FunctionField
                  label="Qualifications"
                  render={record => record.qualifications?.map((q, i) => <Chip key={i} label={q.slug} size="small" sx={ getShipStyle(q) }/>)}
                />
                <BooleanField source="needsEncadrant" label="Pilote encadrant requis"/>
                <BooleanField source="prixFixe" label="Prix indépendant de la durée"/>
                <BooleanField source="avecOptions" label="Options disponibles"/>
            </SimpleShowLayout>
        </Show>
    )
}