import { Show, SimpleShowLayout, TextField, NumberField, FunctionField, DateField } from 'react-admin';

export const DisponibiliteShow = () => (
    <Show>
        <SimpleShowLayout>
            <FunctionField
                source="pilote"
                label="Pilote"
                render={record => <>{ record?.pilote?.pilote?.firstName ?? 'Bug' }</> }
            />
            <FunctionField
                source="availability"
                label="Type"
                render={record => <>{ record?.pilote?.availableByDefault ? 'Disponibilité' : 'Indisponibilité' }</> }
            />
            <DateField source="debut" label="Du" sortable={ true }/>
            <DateField source="fin" label="Au"/>
            <TextField source="motif" label="Motif"/>
        </SimpleShowLayout>
    </Show>
)