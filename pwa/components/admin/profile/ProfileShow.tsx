import { Show, SimpleShowLayout, BooleanField, FunctionField } from 'react-admin';
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
            <BooleanField source="isEleve" label="Pilote en formation"/>
            <BooleanField source="isPro" label="Pilote professionnel"/>
            <BooleanField source="isInstructeur" label="Pilote instructeur"/>
        </SimpleShowLayout>
    </Show>
)