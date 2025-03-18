import { useSession } from 'next-auth/react';
import { Show, SimpleShowLayout, TextField, DateField, NumberField, List, Datagrid, WrapperField, ReferenceManyField, ArrayField, FunctionField, EditButton, TopToolbar } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';

const ListActions = () => (
    <TopToolbar>
        <EditButton/>
    </TopToolbar>
  );

export const PrestationShow = () => {

    const session = useSession();
    const user = session.data.user;

    return (
        // @ts-ignore
        <Show actions={isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") ? <ListActions/> : null} >
            <SimpleShowLayout>
                <DateField source="date" label="Date"/>
                <TextField source="aeronef.immatriculation" label="Aéronef"/>
                <TextField source="pilote.firstName" label="Pilote"/>
                <NumberField source="horametreDepart" label="Horamètre de départ" options={{ style: 'unit', unit: 'hour' }}/>
                <NumberField source="duree" label="Temps de vol" options={{ style: 'unit', unit: 'hour' }}/>
                <NumberField source="horametreFin" label="Horamètre de fin" options={{ style: 'unit', unit: 'hour' }}/>
                <ArrayField source="vols">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}} className="text-xs italic">
                        <NumberField source="quantite" label="Nb vol(s)"/>
                        <FunctionField
                        source="circuit"
                        render={record => <p>{record.circuit.code} - <span className="text-xs italic">{record.circuit.nom}</span></p>}
                        />
                        <FunctionField
                        source="nature"
                        render={record => <p>{record.circuit.nature.code} - <span className="text-xs italic">{record.circuit.nature.label}</span></p>}
                        />
                        <TextField source="option.nom" label="Option"/>
                    </Datagrid>
                </ArrayField>
                <TextField source="remarques" label="Remarques"/>
                <NumberField source="turnover" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
            </SimpleShowLayout>
        </Show>
    );
}