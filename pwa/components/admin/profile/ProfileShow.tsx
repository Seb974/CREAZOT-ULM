import { Show, SimpleShowLayout, FunctionField, ArrayField, Datagrid, DateField } from 'react-admin';
import { getShipStyle, isDefined } from '../../../app/lib/utils';
import Chip from '@mui/material/Chip';

export const ProfileShow = () => {

    return (
        <Show>
            <SimpleShowLayout>
                <FunctionField
                    label="Prénom"
                    source="pilote.firstName"
                    render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                        record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                    }
                />
                <ArrayField source="pilotQualifications" label="Qualifications">
                    <Datagrid
                        optimized
                        bulkActionButtons={false}
                        sx={{
                            '& .RaDatagrid-headerCell': { backgroundColor: '#ededed', fontWeight: 'lighter' },
                            '& .RaDatagrid-rowCell': { verticalAlign: 'top' },
                        }}
                    >
                         <FunctionField
                            label="Qualification"
                            render={({qualification, validUntil}) => <Chip label={qualification.slug} size="small" sx={ getShipStyle(qualification, validUntil) }/>}
                        />
                        <DateField source="dateObtention" label="Obtention"/>
                        <FunctionField
                            label="Validité"
                            render={({validUntil}) => isDefined(validUntil) ? (new Date(validUntil)).toLocaleDateString() : 'Sans limite'}
                        />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    )
}