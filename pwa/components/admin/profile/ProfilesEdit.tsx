import { Edit, ReferenceInput, SimpleForm, ArrayInput, SimpleFormIterator, SelectInput, required, DateInput } from "react-admin";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";

export const ProfilesEdit = () => {

  const transform = ({ qualifications, pilotQualifications, ...data }) => {
    const updatedProfile = {
        ...data,
        pilote: getFormattedValueForBackEnd(data.pilote),
        pilotQualifications: !isDefinedAndNotVoid(pilotQualifications) ? [] : 
            pilotQualifications.map(q => ({
                ...q, 
                qualification: getFormattedValueForBackEnd(q.qualification),
                dateObtention: new Date(q.dateObtention).toISOString().split('T')[0],
                validUntil: isDefined(q.validUntil) ? new Date(q.validUntil).toISOString().split('T')[0] : null
            }))
    }
    return !isDefinedAndNotVoid(qualifications) ? updatedProfile :
      {...updatedProfile, qualifications : qualifications.map(q => getFormattedValueForBackEnd(q))};
  };

  return (
    <Edit transform={ transform } redirect="list">
        <SimpleForm>
          <ReferenceInput reference="users" source="pilote.@id" >
              <SelectInput label="Pilote" validate={required()}/>
          </ReferenceInput>
          <ArrayInput source="pilotQualifications" label="Qualifications">
            <SimpleFormIterator inline disableReordering>
                <ReferenceInput reference="qualifications" source="qualification.@id">
                    <SelectInput label="Qualification" validate={required()}/>
                </ReferenceInput>
                <DateInput source="dateObtention" label="Date d'obtention" validate={required()}/>
                <DateInput source="validUntil" label="Date de fin de validité" helperText="Laisser vide si pas de fin de validité"/>
            </SimpleFormIterator>
          </ArrayInput>
        </SimpleForm>
    </Edit>
  )
};