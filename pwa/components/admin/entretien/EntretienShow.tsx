import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, ArrayField, Datagrid, FunctionField } from 'react-admin';
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
        </SimpleShowLayout>
    </Show>
)