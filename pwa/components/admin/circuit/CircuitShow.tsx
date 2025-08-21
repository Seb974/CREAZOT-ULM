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
                 <TextField source="code" label="Code interne"/>
                 <TextField source="webshopId" label="code e-commerce"/>
                 <DateField source="duree" label="Durée" showTime showDate={false}/>
                 <BooleanField source="prixFixe" label="Prix fixe"/>
                 <NumberField source="prix" options={{ style: 'currency', currency: 'EUR' }}/>
                 <NumberField source="cout" label="Coût pilote" options={{ style: 'currency', currency: 'EUR' }}/>
                <TextField source="nature.label" label="Nature de la prestation"/>
                <FunctionField
                  label="Qualifications"
                  render={record => record.qualifications?.map((q, i) => <Chip key={i} label={q.slug} size="small" sx={ getShipStyle(q) }/>)}
                />
                <BooleanField source="avecOptions" label="Options disponibles"/>
                <BooleanField source="needsEncadrant" label="Encadrant requis"/>
                <BooleanField source="requireLandingDeclaration" label="Déclaration atterrissages"/>
                <BooleanField source="hadDefaultLanding" label="Attérrissage par défaut"/>
            </SimpleShowLayout>
        </Show>
    )
}