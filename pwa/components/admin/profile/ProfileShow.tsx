import { Show, SimpleShowLayout, ArrayField, FunctionField, Datagrid, TextField } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';

export const ProfileShow = () => (
    <Show>
        <SimpleShowLayout>
            <FunctionField
                label="Prénom"
                source="pilote.firstName"
                render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                    record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                }
            />
            <ArrayField source="qualifications" label="Qualifications">
                <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                    <TextField source="name" label=""/>
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
)