import { SimpleForm, NumberInput, ReferenceInput, ArrayInput, SimpleFormIterator, SelectInput, Edit } from "react-admin";
import { useClient } from "../ClientProvider";
import { clientWithLandingManagement, clientWithOptions, getAirportCode } from "../../../app/lib/client";
import { getFormattedValueForBackEnd, isDefinedAndNotVoid } from "../../../app/lib/utils";

const LandingsInput = ({ client }) => {
    const airportList = client.airports.map(a =>({...a, airportCode: getAirportCode(a), airportName: a.nom}));

    const validateLandings = (value) => {
      const codes = new Set();
      for (const l of value || []) {
        if (codes.has(l.airportCode)) {
          return 'Un même aéroport ne peut être déclaré plusieurs fois.';
        }
        if (l.touches === 0 && l.complets === 0) {
          return 'Au moins un toucher ou un complet doit être déclaré.';
        }
        codes.add(l.airportCode);
      }
      return undefined;
    };

    if (!clientWithLandingManagement(client) || !isDefinedAndNotVoid(client.airports))
      return null;

    return (
      <ArrayInput source="landings" label="Atterrissages" validate={ validateLandings }>
          <SimpleFormIterator inline disableReordering> 
              <SelectInput
                  source="airportCode"
                  label="Aéroport"
                  choices={ airportList }
                  optionText={(a) => a.airportName}
                  optionValue="airportCode"
                  />
              <NumberInput source="touches" label="Touchés" min="0" defaultValue={ 0 }/>
              <NumberInput source="complets" label="Complets" min="0" defaultValue={ 1 }/>
          </SimpleFormIterator>
      </ArrayInput>
    );
};

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
                <NumberInput source="prix" label="Prix"/>
                <NumberInput source="cout" label="Coût"/>
                <LandingsInput client={ client }/>
            </SimpleForm>
        </Edit>
    );
};