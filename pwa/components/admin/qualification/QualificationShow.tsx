import { Show, SimpleShowLayout, BooleanField, TextField, FunctionField } from 'react-admin';
import { isDefined } from '../../../app/lib/utils';
import { getColor } from '../../../app/lib/colors';

export const QualificationShow = () => {
    
    return (
    <Show>
        <SimpleShowLayout>
            <TextField source="nom" label="Qualification"/>
            <FunctionField
                label="Couleur associée"
                source="color"
                render={({ color }) =>  <span style={{ color: getColor(color).id }}>{ isDefined(color) ? getColor(color).name : 'Couleur par défaut' }</span>
                }
            />
            <BooleanField source="encadrant" label="Qualification d'encadrant"/>
        </SimpleShowLayout>
    </Show>
    )
}