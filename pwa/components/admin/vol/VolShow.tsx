import { Show, SimpleShowLayout, TextField, DateField, NumberField, FunctionField, Datagrid, ArrayField } from 'react-admin';
import { TopToolbar, ListButton, EditButton } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';
import { useClient } from '../../admin/ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";
import { useSessionContext } from '../SessionContextProvider';

const CustomShowActions = ({ hasAdminAccess }) => (
    <TopToolbar>
        <ListButton />
        { hasAdminAccess && <EditButton />}
    </TopToolbar>
);

export const VolShow = () => {

    const { client } = useClient();
    const { session } = useSessionContext();
    const user = session?.user;

    const hasAdminAccess = user => isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin");

    const OptionField = () => {
        return !clientWithOptions(client) ? null :
            <TextField source="option.nom" label="Option"/>
    };

    return (
        <Show actions={<CustomShowActions hasAdminAccess={ hasAdminAccess(user) }/>}>
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
                <ArrayField source="landings" label="Atterrissages">
                    <Datagrid
                        isRowSelectable={record => false} 
                        rowClick={false} 
                        bulkActionButtons={false} 
                        sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }} 
                        className="text-xs italic"
                    >
                        <FunctionField
                            source="airportCode"
                            label="Aéroport"
                            render={record => <p>{record.airportCode} - <span className="text-xs italic">{record.airportName}</span></p>}
                        />
                        <NumberField source="complets" label="Complet(s)" />
                        <NumberField source="touches" label="Touché(s)" />
                    </Datagrid>
                </ArrayField>
                <NumberField source="prix" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
                <NumberField source="cout" label="Coût pilote" options={{ style: 'currency', currency: 'EUR' }}/>
                <DateField source="createdAt" label="Créé le" showTime/>
                <FunctionField
                    label="Créé par"
                    source="createdBy.firstName"
                    render={(record) => isDefined(record.createdBy) && isDefined(record.createdBy.firstName) ?
                        record.createdBy.firstName.charAt(0).toUpperCase() + record.createdBy.firstName.slice(1) : ''
                    }
                />
                <DateField source="updatedAt" label="Modifié le" showTime/>
                <FunctionField
                    label="Modifié par"
                    source="updatedBy.firstName"
                    render={(record) => isDefined(record.updatedBy) && isDefined(record.updatedBy.firstName) ?
                        record.updatedBy.firstName.charAt(0).toUpperCase() + record.updatedBy.firstName.slice(1) : ''
                    }
                />
            </SimpleShowLayout>
        </Show>
    )
}