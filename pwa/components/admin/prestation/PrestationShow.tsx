import { useSession } from 'next-auth/react';
import { Show, SimpleShowLayout, TextField, DateField, NumberField, Datagrid, ArrayField, FunctionField, EditButton, TopToolbar } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';
import { useClient } from '../ClientProvider';
import { clientWithOptions } from "../../../app/lib/client";
import { FC } from 'react';
import { useRecordContext } from 'react-admin';

const ListActions = () => (
    <TopToolbar>
        <EditButton/>
    </TopToolbar>
  );

const LandingDetails: FC = () => {
    const record = useRecordContext();
    if (!record || !record.landings || record.landings.length === 0) return null;

    return (
        <div className="p-2">
            <p className="font-semibold mb-2 text-sm text-gray-700">✈️ Atterrissages</p>
            <Datagrid
                isRowSelectable={record => false} rowClick={false} bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }} className="text-xs italic"
                data={record.landings}
                total={record.landings.length}
            >
                <FunctionField
                    source="airportCode"
                    label="Aéroport"
                    render={record => <p>{record.airportCode} - <span className="text-xs italic">{record.airportName}</span></p>}
                />
                <NumberField source="complets" label="Complet(s)" />
                <NumberField source="touches" label="Touché(s)" />
            </Datagrid>
        </div>
    );
};

export const PrestationShow = () => {

    const session = useSession();
    const user = session.data.user;
    const { client } = useClient();

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

    const OptionField = () => {
        return !clientWithOptions(client) ? null :
            <TextField source="option.nom" label="Option"/>
    };

    return (
        // @ts-ignore
        <Show actions={isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") ? <ListActions/> : null} >
            <SimpleShowLayout>
                <DateField source="date" label="Date"/>
                <TextField source="aeronef.immatriculation" label="Aéronef"/>
                <FunctionField
                    label="Pilote"
                    source="pilote.firstName"
                    render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                        record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                    }                     
                />
                <FunctionField
                    label="Encadrant"
                    source="encadrant.firstName"
                    render={(record) => isDefined(record.encadrant) && isDefined(record.encadrant.firstName) ?
                        record.encadrant.firstName.charAt(0).toUpperCase() + record.encadrant.firstName.slice(1) : ''
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
                    <Datagrid
                        optimized
                        expand={<LandingDetails />}
                        bulkActionButtons={false}
                        sx={{
                            '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                            '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                        }}
                    >
                        <NumberField source="quantite" label="Nb vol(s)" />
                        <FunctionField
                            source="circuit"
                            render={record =>
                                isDefined(record.circuit) && isDefined(record.circuit.code) && isDefined(record.circuit.nom) ?
                                <p>{record.circuit.code} - <span className="text-xs italic">{record.circuit.nom}</span></p> : ""
                            }
                        />
                        <FunctionField
                            source="nature"
                            render={record =>
                                isDefined(record.circuit) && isDefined(record.circuit.nature) && isDefined(record.circuit.nature.code) && isDefined(record.circuit.nature.label) ?
                                <p>{record.circuit.nature.code} - <span className="text-xs italic">{record.circuit.nature.label}</span></p> : ""
                            }
                        />
                        <OptionField />
                    </Datagrid>
                </ArrayField>
                <TextField source="remarques" label="Remarques"/>
                <NumberField source="turnover" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
            </SimpleShowLayout>
        </Show>
    );
}