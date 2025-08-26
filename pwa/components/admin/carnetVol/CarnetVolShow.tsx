import { Show, SimpleShowLayout, TextField, NumberField, DateField, FunctionField, ArrayField, Datagrid } from 'react-admin';
import { decimalToTimeFormatted, isDefined } from '../../../app/lib/utils';

export const CarnetVolShow = () => (
    <Show>
        <SimpleShowLayout>
            <DateField source="date" showTime={ false }/>
            <FunctionField
                label="Pilote"
                source="profil.pilote.firstName"
                render={({ profil }) => isDefined(profil) && isDefined(profil.pilote) && isDefined(profil.pilote.firstName) ?
                profil.pilote.firstName.charAt(0).toUpperCase() + profil.pilote.firstName.slice(1) : ''
                }
            />
            <TextField source="aeronef" label="Aéronef"/>
            <FunctionField
                label="Type de vol"
                render={record => isDefined(record.typeDeVol) ? record.typeDeVol?.label : ""}
            />
            <FunctionField
                source="duree"
                label="Durée"
                render={record => decimalToTimeFormatted(record.duree)}
                textAlign="center"
            />
            <FunctionField
                label="Départ et d'arrivée"
                render={record => {
                    if (!record) return null;

                    const destinations = [
                        { etape: 'Départ', lieu: record.lieuDepart ?? ''},
                        ...(record.lieuxArrivee ?? []).map(a => ({ etape: 'Arrivée', lieu: a ?? ''}))
                    ];

                    return (
                        <Datagrid
                            data={ destinations }
                            isRowSelectable={() => false}
                            rowClick={false}
                            bulkActionButtons={false}
                            sx={{ '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: "lighter" } }}
                            className="text-xs italic"
                        >
                            <TextField source="etape" />
                            <TextField source="lieu" label="Lieu(x)"/>
                        </Datagrid>
                    );
                }}
            />
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