import { Show, SimpleShowLayout, FunctionField } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';
import Chip from '@mui/material/Chip';

export const ProfileShow = () => {

    const getShipStyle = ({ color }) => ({
        backgroundColor: color + '33',
        color: color,
        border: '1px solid',
        borderColor: color,
        marginRight: '4px',
        marginBottom: '2px',
        marginTop: '2px'
    });

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
                <FunctionField
                  label="Qualifications"
                  render={record => record.qualifications?.map((q, i) => <Chip key={i} label={q.slug} size="small" sx={ getShipStyle(q) }/>)}
                />
            </SimpleShowLayout>
        </Show>
    )
}