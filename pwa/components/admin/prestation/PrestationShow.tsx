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

    const getFormattedDuration = ({ aeronef, duree }) => {
        const hours = Math.trunc(duree);
        const minutes = aeronef.decimal ? Math.round((duree - Math.trunc(duree)) * 60) : Math.round((duree - Math.trunc(duree)) * 100);
        return `${ hours }:${ minutes < 10 ? '0' : '' }${ minutes }`;
    }
    
    const getFormattedHorametre = (prestation, horametre) => {
    const hours = Math.trunc(prestation[horametre]);
    const minutes = Math.round((prestation[horametre] - Math.trunc(prestation[horametre])) * (prestation.aeronef.decimal ? 10 : 100));
    return `${ hours }${prestation.aeronef.decimal ? ',' : ':'}${ !prestation.aeronef.decimal && minutes < 10 ? '0' : '' }${ minutes }`;
    }

    return (
        // @ts-ignore
        <Show actions={isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") ? <ListActions/> : null} >
            <SimpleShowLayout>
                <DateField source="date" label="Date"/>
                <TextField source="aeronef.immatriculation" label="Aéronef"/>
                <FunctionField
                    label="Prénom"
                    source="pilote.firstName"
                    render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                        record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                    }
                />
                <FunctionField
                    source="horametreDepart"
                    label="Horamètre au Départ"
                    render={record => getFormattedHorametre(record, "horametreDepart")}
                    textAlign="right"
                />
                <FunctionField
                    source="duree"
                    label="Durée"
                    render={record => getFormattedDuration(record)}
                    textAlign="right"
                />
                <FunctionField
                    source="horametreFin"
                    label="Horamètre à l'arrivée"
                    render={record => getFormattedHorametre(record, "horametreFin")}
                    textAlign="right"
                />
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