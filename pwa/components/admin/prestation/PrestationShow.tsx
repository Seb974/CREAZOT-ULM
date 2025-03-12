import { Show, SimpleShowLayout, TextField, DateField, NumberField, List, Datagrid, WrapperField, ReferenceManyField } from 'react-admin';

export const PrestationShow = () => (
    <Show>
        <SimpleShowLayout>
            <DateField source="date" label="Date"/>
            <TextField source="aeronef.immatriculation" label="Aéronef"/>
            <TextField source="pilote.firstName" label="Pilote"/>
            <NumberField source="horametreDepart" label="Horamètre de départ"/>
            <NumberField source="duree" label="Temps de vol"/>
            <NumberField source="horametreFin" label="Horamètre de fin"/>
            <ReferenceManyField reference="vols" target="vol" label="Vols">
              <Datagrid isRowSelectable={ record => false } rowClick={ false } bulkActionButtons={false}>
                    <NumberField source="quantite" label="Nb vol(s)"/>
                    <TextField source="circuit.code" label="Circuit"/>
                    <TextField source="circuit.nom" label=" "/>
                    <TextField source="circuit.nature.code" label="Nature"/>
                    <TextField source="circuit.nature.label" label=" "/>
                    <TextField source="option.nom" label="Option"/>
              </Datagrid>
            </ReferenceManyField>
            <NumberField source="turnover" label="C.A." options={{ style: 'currency', currency: 'EUR' }}/>
        </SimpleShowLayout>
    </Show>
)