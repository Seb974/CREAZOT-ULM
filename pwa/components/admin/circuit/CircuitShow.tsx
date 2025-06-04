import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, FunctionField } from 'react-admin';
import Chip from '@mui/material/Chip';
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";

export const CircuitShow = () => {

    const { client } = useClient();

    const getShipStyle = ({ color }) => ({
        backgroundColor: color + '33',
        color: color,
        border: '1px solid',
        borderColor: color,
        marginRight: '4px',
        marginBottom: '2px',
        marginTop: '2px'
    });

    const OptionsField = () => {
        return !clientWithOptions(client) ? null :
            <BooleanField source="avecOptions" label="Options disponibles"/>
    };

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
                <BooleanField source="prixFixe" label="Tarif non lié à la durée"/>
                <OptionsField/>
                <BooleanField source="requireLandingDeclaration" label="Déclaration atterrissages"/>
                <BooleanField source="hadDefaultLanding" label="Attérrissage par défaut"/>
                <BooleanField source="needsEncadrant" label="Encadrant requis"/>
            </SimpleShowLayout>
        </Show>
    )
}