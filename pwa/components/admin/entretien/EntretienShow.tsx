import { Show, SimpleShowLayout, TextField, DateField, NumberField, BooleanField, ArrayField, Datagrid } from 'react-admin';

export const EntretienShow = () => (
    <Show>
        <SimpleShowLayout>
            <DateField source="date" label="Date"/>
            <TextField source="aeronef.immatriculation" />
            <TextField source="intervention" />
            <ArrayField source="intervenants">
                <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: "none"}}} className="text-xs italic">
                    <TextField source="name" label=""/>
                </Datagrid>
            </ArrayField>
            <NumberField source="horametreNextIntervention" options={{ style: 'unit', unit: 'hour' }} label="Prochaine intervention"/>
        </SimpleShowLayout>
    </Show>
)