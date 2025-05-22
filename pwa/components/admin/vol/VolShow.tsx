import { Show, SimpleShowLayout, TextField, DateField, NumberField, FunctionField } from 'react-admin';
import { TopToolbar, ShowButton, ListButton } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";

const CustomShowActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const VolShow = () => {

    const { client } = useClient();

    const OptionField = () => {
        return !clientWithOptions(client) ? null :
            <TextField source="option.nom" label="Option"/>
    };

    return (
        <Show actions={<CustomShowActions/>}>
            <SimpleShowLayout>
                <DateField source="prestation.date" label="Date"/>
                <TextField source="prestation.aeronef.immatriculation" label="Aéronef"/>
                <FunctionField
                    label="Prénom"
                    source="prestation.pilote.firstName"
                    sortable={ true }
                    render={(record) => isDefined(record.prestation) && isDefined(record.prestation.pilote) && isDefined(record.prestation.pilote.firstName) ?
                        record.prestation.pilote.firstName.charAt(0).toUpperCase() + record.prestation.pilote.firstName.slice(1) : ''
                    }
                />
                <NumberField source="quantite" label="Nombre de vol(s)"/>
                <TextField source="circuit.nom" label="Circuit"/>
                <TextField source="circuit.nature.label" label="Nature"/>
                <OptionField/> 
                <NumberField source="prix" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
            </SimpleShowLayout>
        </Show>
    )
}