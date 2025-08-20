import { Edit, ReferenceInput, ArrayInput, SimpleFormIterator, SelectInput, required, DateInput, TabbedForm, NumberInput, TextInput } from "react-admin";
import { calculateValidUntil, getFormattedValueForBackEnd, getValidityDurationMonths, isDefined, isDefinedAndNotVoid, isValidNumber } from "../../../app/lib/utils";
import { certificatMedicalTypes, infiniteCertificateTypes } from "../../../app/lib/client";
import { useWatch, useFormContext } from 'react-hook-form';
import { useEffect } from "react";

const BirthDateWatcher = () => {
  const { setValue } = useFormContext();
  const birthDate = useWatch({ name: 'birthDate', defaultValue: new Date() });
  const type = useWatch({ name: 'certificatMedical.type', defaultValue: 'CNCI' });
  const dateObtention = useWatch({ name: 'certificatMedical.dateObtention', defaultValue: new Date() });

  useEffect(() => {
    const isAlwaysValid = infiniteCertificateTypes.includes(type);
    const defaultDuration = !isAlwaysValid ? getValidityDurationMonths(birthDate, dateObtention): 0;
    setValue('certificatMedical.validityDurationMonths', defaultDuration);
  }, [birthDate, dateObtention, type, setValue]);

  return null;
};

const ValidityDurationMonthsWatcher = () => {
  const { setValue } = useFormContext();
  const type = useWatch({ name: 'certificatMedical.type', defaultValue: 'CNCI' });
  const dateObtention = useWatch({ name: 'certificatMedical.dateObtention', defaultValue: new Date() });
  const validityDurationMonths = useWatch({ name: 'certificatMedical.validityDurationMonths', defaultValue: 60 });

  useEffect(() => {
    const isAlwaysValid = infiniteCertificateTypes.includes(type);
    const defaultDuration = !isAlwaysValid && isValidNumber(validityDurationMonths) ? calculateValidUntil(dateObtention, validityDurationMonths) : null;
    setValue('certificatMedical.validUntil', defaultDuration);
  }, [dateObtention, validityDurationMonths, type, setValue]);

  return null;
};

export const ProfilesEdit = () => {

  const transform = ({ qualifications, pilotQualifications, certificatMedical, ...data }) => {
    const updatedProfile = {
        ...data,
        // pilote: getFormattedValueForBackEnd(data.pilote),
        pilotQualifications: !isDefinedAndNotVoid(pilotQualifications) ? [] : 
            pilotQualifications.map(q => ({
                ...q, 
                qualification: getFormattedValueForBackEnd(q.qualification),
                dateObtention: new Date(q.dateObtention).toISOString().split('T')[0],
                validUntil: isDefined(q.validUntil) ? new Date(q.validUntil).toISOString().split('T')[0] : null
            })
        ),
        certificatMedical: {
            ...certificatMedical,
            dateObtention: new Date(certificatMedical.dateObtention).toISOString().split('T')[0],
            validUntil: isDefined(certificatMedical.validUntil) ? new Date(certificatMedical.validUntil).toISOString().split('T')[0] : null
        }

    }
    return !isDefinedAndNotVoid(qualifications) ? updatedProfile :
      {...updatedProfile, qualifications : qualifications.map(q => getFormattedValueForBackEnd(q))};
  };

  return (
    <Edit transform={ transform } redirect="list">
        <TabbedForm 
            syncWithLocation={false} 
            defaultValues={(record) => ({
                ...record,
                birthDate: new Date(),
                pilotQualifications: record?.pilotQualifications?.map(q => ({...q, dateObtention: new Date()})) ?? [],
                certificatMedical: {
                  dateObtention: new Date(),
                  validityDurationMonths: 60,
                  type: 'CNCI',
                  medecin: "",
                  remarques: ""
                }
            })}
        >
          <TabbedForm.Tab label="Général">
              <ReferenceInput reference="users" source="pilote.@id" readOnly>
                <SelectInput label="Pilote" validate={required()} readOnly/>
              </ReferenceInput>
              <DateInput source="birthDate" label="Date de naissance" validate={required()}/>
              <TextInput source="pilote.email" label="Adresse email" />
              <ArrayInput source="pilotQualifications" label="Qualifications">
                <SimpleFormIterator inline disableReordering>
                    <ReferenceInput reference="qualifications" source="qualification.@id">
                        <SelectInput label="Qualification" validate={required()}/>
                    </ReferenceInput>
                    <DateInput source="dateObtention" label="Date d'obtention" validate={required()}/>
                    <DateInput source="validUntil" label="Date de fin de validité" helperText="Laisser vide si pas de fin de validité"/>
                </SimpleFormIterator>
              </ArrayInput>
          </TabbedForm.Tab>
          <TabbedForm.Tab label="Médical">
              <SelectInput source="certificatMedical.type" label="Type" choices={ certificatMedicalTypes } validate={required()}/>
              <DateInput source="certificatMedical.dateObtention" label="Date d'obtention" validate={required()}/> 
              <NumberInput source="certificatMedical.validityDurationMonths" label="Nombre de mois de validité" min={ 0 } helperText="Mettre 0 si pas de fin de validité"/>
              <DateInput source="certificatMedical.validUntil" label="Date de fin de validité" helperText="Laisser vide si pas de fin de validité"/>
              <TextInput source="certificatMedical.medecin" label="Nom du Médecin" />
              <TextInput source="certificatMedical.remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          </TabbedForm.Tab>
          <BirthDateWatcher />
          <ValidityDurationMonthsWatcher />
        </TabbedForm>
    </Edit>
  )
};