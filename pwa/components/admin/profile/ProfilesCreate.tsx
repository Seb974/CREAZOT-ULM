import { ReferenceInput, Create, ArrayInput, SimpleFormIterator, useCreate, useRedirect, useNotify, DateInput, BooleanInput, required, SelectInput, TabbedForm, NumberInput, TextInput, FileInput, FileField, useRecordContext } from "react-admin";
import { calculateValidUntil, decimalToTime, getFormattedValueForBackEnd, getValidityDurationMonths, isDefined, isDefinedAndNotVoid, isValidNumber, timeToDecimal } from "../../../app/lib/utils";
import { certificatMedicalTypes, infiniteCertificateTypes, syncDocument, syncDocuments } from "../../../app/lib/client";
import { useWatch, useFormContext } from 'react-hook-form';
import { useSessionContext } from "../SessionContextProvider";
import { useEffect } from "react";
import { Link } from "@mui/material";

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

const MyFileField = ({ source }) => {
  const record = useRecordContext();
  if (!record) return null;

  const url = record[source];
  const label = record.description || record.title || record.path || "Sans nom";

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" underline="always"
      sx={{ color: "primary.main", fontSize: "0.85rem" }}
    >
      {label}
    </Link>
  );
};

export const ProfilesCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const { session } = useSessionContext();

  const getDocument = async ({ document }, description = '') => {
      const finalDescription = description.length > 0 ? description : document?.rawFile?.name ?? '';
      const docWithDescription = document ? {...document, description: finalDescription} : null;
      return await syncDocument(docWithDescription, session);
  }

  const getDocuments = async (documents) => { 
      const docs = documents.map(document => {
          return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
      });
      return await syncDocuments(docs, session);
  };

  const onSubmit = async ({ pilotQualifications, certificatMedical, documents, ...data }) => {
    try {
      const documentIds = isDefinedAndNotVoid(documents) ? await getDocuments(documents) : [];
      const certificatMedicalDocument = isDefined(certificatMedical) ? await getDocument(certificatMedical, 'Certificat Médical') : null;

      const formattedPilotQualifications = await Promise.all(
        pilotQualifications.map(async (q) => {
          const qualificationDocument = isDefined(q.qualification) ? await getDocument(q, q.qualification?.nom ?? '') : null;
          return {
            ...q,
            qualification: getFormattedValueForBackEnd(q.qualification),
            dateObtention: new Date(q.dateObtention).toISOString().split('T')[0],
            validUntil: isDefined(q.validUntil) ? new Date(q.validUntil).toISOString().split('T')[0] : null,
            document: qualificationDocument
          };
        })
      );

      const newProfile = {
          ...data,
          pilote: getFormattedValueForBackEnd(data.pilote),
          documents: documentIds,
          pilotQualifications: !isDefinedAndNotVoid(pilotQualifications) ? [] : formattedPilotQualifications,
          certificatMedical: {
            ...certificatMedical,
            dateObtention: new Date(certificatMedical.dateObtention).toISOString().split('T')[0],
            validUntil: isDefined(certificatMedical.validUntil) ? new Date(certificatMedical.validUntil).toISOString().split('T')[0] : null,
            document: certificatMedicalDocument
        }
      };

      await create('profil_pilotes', {data: newProfile});
      notify('Le profil du pilote a bien été enregistré.', { type: 'info' });
      redirect('list', 'profil_pilotes');
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement du profil du pilote.`, { type: 'error' });
      redirect('list', 'profil_pilotes');
      console.error(error);
    }
  };

  return (
    <Create redirect="list">
      <TabbedForm 
          onSubmit={ onSubmit }
          defaultValues={(record) => ({
              birthDate: new Date(),
              dateObtention: new Date(),
              totalFlightHours: 0,
              pilotQualifications: record?.pilotQualifications?.map(q => ({...q, dateObtention: new Date()})) ?? [],
              validityDurationMonths: 60, 
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
            <ReferenceInput reference="users" source="pilote" filter={ { "exists[profilPilote]": false }}>
              <SelectInput label="Pilote" validate={required()}/>
            </ReferenceInput>
            <DateInput source="birthDate" label="Date de naissance" validate={required()}/>
            <TextInput source="totalFlightHours" label="Total des heures de vol" format={ decimalToTime } parse={ timeToDecimal } />
            <BooleanInput source="availableByDefault" label="Disponible par défaut" defaultValue={ false }/>
            <ArrayInput source="pilotQualifications" label="Qualifications">
              <SimpleFormIterator inline disableReordering>
                  <ReferenceInput reference="qualifications" source="qualification">
                      <SelectInput label="Qualification" validate={required()}/>
                  </ReferenceInput>
                  <DateInput source="dateObtention" label="Date d'obtention" validate={required()}/>
                  <DateInput source="validUntil" label="Date de fin de validité" helperText="Laisser vide si pas de fin de validité"/>
                  <FileInput source="document" multiple={ false } label=" " placeholder="Fichier">
                      <MyFileField source="contentUrl"/>
                  </FileInput>
              </SimpleFormIterator>
            </ArrayInput>
            <FileInput source="documents" multiple={ true } label="Autres documents">
                <MyFileField source="contentUrl"/>
            </FileInput>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Médical">
            <SelectInput source="certificatMedical.type" label="Type" choices={ certificatMedicalTypes } validate={required()}/>
            <DateInput source="certificatMedical.dateObtention" label="Date d'obtention" validate={required()}/> 
            <NumberInput source="certificatMedical.validityDurationMonths" label="Nombre de mois de validité" min={ 0 } helperText="Mettre 0 si pas de fin de validité"/>
            <DateInput source="certificatMedical.validUntil" label="Date de fin de validité" helperText="Laisser vide si pas de fin de validité"/>
            <TextInput source="certificatMedical.medecin" label="Nom du Médecin" />
            <TextInput source="certificatMedical.remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
            <FileInput source="certificatMedical.document" multiple={ false } label="Certificat médical">
                <MyFileField source="contentUrl"/>
            </FileInput>
        </TabbedForm.Tab>
        <BirthDateWatcher />
        <ValidityDurationMonthsWatcher />
      </TabbedForm>
    </Create>
  );
};