import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, ArrayField, Datagrid, FunctionField, FileField } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';

export const EntretienShow = () => (
    <Show>
        <SimpleShowLayout>
            <DateField source="date" label="Date"/>
            <TextField source="aeronef.immatriculation" />
            <BooleanField source="changementMoteur" label="Changement moteur"/>
            <TextField source="intervention" />
            <ArrayField source="intervenants">
                <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                    <FunctionField
                        label=""
                        source="name"
                        render={(record) => isDefined(record.name) ? record.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}
                    />
                </Datagrid>
            </ArrayField>
            <NumberField source="horametreNextIntervention" options={{ style: 'unit', unit: 'hour' }} label="Prochaine intervention"/>
            <ArrayField source="expenses" label="Dépenses associées">
                <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                    <FunctionField label="" source="name" render={ record => record?.name ?? '' } />
                </Datagrid>
            </ArrayField>
            <FileField source="documents" src="contentUrl" title="description" target="_blank" label="Documents associés"/>
            <DateField source="createdAt" label="Créé le" showTime/>
            <FunctionField
                label="Créé par"
                source="createdBy.firstName"
                render={(record) => isDefined(record?.createdBy) && isDefined(record?.createdBy?.firstName) ?
                    record?.createdBy?.firstName?.charAt(0).toUpperCase() + record?.createdBy?.firstName?.slice(1) : ''
                }
            />
            <DateField source="updatedAt" label="Modifié le" showTime/>
            <FunctionField
                label="Modifié par"
                source="updatedBy.firstName"
                render={(record) => isDefined(record?.updatedBy) && isDefined(record?.updatedBy?.firstName) ?
                    record?.updatedBy?.firstName?.charAt(0).toUpperCase() + record?.updatedBy?.firstName?.slice(1) : ''
                }
            />
        </SimpleShowLayout>
    </Show>
)