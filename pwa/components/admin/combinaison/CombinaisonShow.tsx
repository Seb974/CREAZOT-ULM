import { Show, SimpleShowLayout, TextField, NumberField, ArrayField, Datagrid } from 'react-admin';

export const CombinaisonShow = () => {

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="nom" label="Passager" sortable={ true }/>
                <NumberField source="minPassager" label="Nombre de passager minimal"/>
                <ArrayField source="options" label="Options associées">
                    <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false} sx={{ '& .RaDatagrid-headerCell': {display: 'none'}}} className="text-xs italic">
                        <TextField source="name" label="Nom"/>
                    </Datagrid>
                </ArrayField>
                <NumberField source="prix" label="Prix" options={{ style: 'currency', currency: 'EUR' }}/>

            </SimpleShowLayout>
        </Show>
    );
}