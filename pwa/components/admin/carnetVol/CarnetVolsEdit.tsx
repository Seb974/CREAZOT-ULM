import { SimpleForm, TextInput, Edit, required, DateInput, ReferenceInput, SelectInput, ArrayInput, SimpleFormIterator } from "react-admin"; 
import { decimalToTime, isDefined, timeToDecimal } from "../../../app/lib/utils";
import { useClient } from '../../admin/ClientProvider';

export const CarnetVolsEdit = () => {

  const { client } = useClient();

  const getMainAirportName = () => {
      const mainAirport = client?.airports?.find(a => a.main);
      return isDefined(mainAirport) ? mainAirport.nom : '';
  };

  const transform = ({ createdBy, updatedBy, profil, typeDeVol, date, ...data }) => {
    return {
      ...data, 
      profil : profil?.['@id'] ?? null,
      typeDeVol: typeDeVol?.['@id'] ?? null,
      createdBy: createdBy?.['@id'] ?? null,
      updatedBy: updatedBy?.['@id'] ?? null,
      date: date ? new Date(date).toISOString() : null
    }
  };

  return (
    <Edit transform={ transform } redirect="list">
        <SimpleForm>
          <DateInput source="date" label="Date" validate={required()}/>
          <ReferenceInput reference="users" source="profil.pilote.@id">
            <SelectInput label="Pilote" disabled/>
          </ReferenceInput>
          <TextInput source="aeronef" label="Aeronef" validate={required()}/>
          <ReferenceInput reference="natures" source="typeDeVol.@id">
            <SelectInput label="Nature du vol" validate={required()}/>
          </ReferenceInput>
          <TextInput source="duree" label="Durée du vol" format={ decimalToTime } parse={ timeToDecimal } validate={required()}/>
          <TextInput source="lieuDepart" label="Lieu de départ"  defaultValue={ getMainAirportName() } validate={required()}/>
          <ArrayInput source="lieuxArrivee" label="Lieu(x) d'arrivée">
              <SimpleFormIterator inline disableReordering>
                  <TextInput source="" defaultValue={ getMainAirportName() }/>   
              </SimpleFormIterator>
          </ArrayInput>
        </SimpleForm>
    </Edit>
  )
};