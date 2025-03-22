import { ArrayInput, DateInput, Edit, NumberInput, ReferenceInput, SimpleForm, SimpleFormIterator, TextInput } from "react-admin";
import { isDefined } from "../../../app/lib/utils";

export const PrestationEdit = () => {

    const transform = ({date, aeronef, pilote, vols, ...data}) => {
        const newData = ({
          ...data, 
          date: new Date(date),
          pilote: isDefined(pilote) && isDefined(pilote['@id']) ? pilote['@id'] : null,
          aeronef: isDefined(aeronef) && isDefined(aeronef['@id']) ? aeronef['@id'] : null,
          vols: vols.map(vol => ({
              ...vol,
              circuit: isDefined(vol.circuit) && isDefined(vol.circuit['@id']) ? vol.circuit['@id'] : null,
              option: isDefined(vol.option) && isDefined(vol.option['@id']) ? vol.option['@id'] : null,
          }))
        });
        return newData;
    };

    return (
      // @ts-ignore
      <Edit transform={transform}>  
        <SimpleForm>
            <DateInput source="date" />
            <ReferenceInput reference="aeronefs" source="aeronef.@id" label="Aéronef" />
            <ReferenceInput reference="users" source="pilote.@id" label="Pilote" />
            <ArrayInput source="vols">
                <SimpleFormIterator inline disableReordering>
                    <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
                    <ReferenceInput reference="options" source="option.@id" label="Option" />
                    <NumberInput source="quantite" />
                </SimpleFormIterator>
            </ArrayInput>
            <NumberInput source="horametreDepart" />
            <NumberInput source="duree" />
            <NumberInput source="horametreFin" />
            <TextInput source="remarques" />
        </SimpleForm>
      </Edit>
    );
};
