import { SimpleForm, NumberInput, ReferenceInput, ArrayInput, SimpleFormIterator, SelectInput, Edit } from "react-admin";
import { useClient } from "../ClientProvider";
import { clientWithOptions } from "../../../app/lib/client";
import { getFormattedValueForBackEnd, isDefined } from "../../../app/lib/utils";

export const VolsEdit = () => {

    const { client } = useClient();

    const OptionInput = () => !clientWithOptions(client) ? null : 
        <ReferenceInput reference="options" source="option.@id" label="Option" />

    const transform = ({prestation, circuit, createdBy, updatedBy, ...data}) => {
        return {
            ...data,
            prestation: prestation['@id'],
            circuit: circuit['@id'],
            createdBy: getFormattedValueForBackEnd(createdBy),
            updatedBy: getFormattedValueForBackEnd(updatedBy)
        }
    };

    return (
        <Edit transform={ transform } >
            <SimpleForm>
                <NumberInput source="quantite" label="Quantité"/>
                <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit"/>
                <OptionInput/>
                {/* <NumberInput source="duree" label="Durée"/> */}
                <NumberInput source="prix" label="Prix"/>
                <NumberInput source="cout" label="Coût"/>
                <ArrayInput source="landings" label="Atterrissages">
                    <SimpleFormIterator inline disableReordering>
                        <SelectInput source="airportCode" label="Aéroport" choices={ client.airportCodes } optionText="nom" optionValue="code"/>
                        <NumberInput source="touches" label="Touchés"/>
                        <NumberInput source="complets" label="Complets"/>
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    );
};