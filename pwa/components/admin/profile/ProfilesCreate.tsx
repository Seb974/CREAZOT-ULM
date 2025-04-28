import { ReferenceInput, SimpleForm, BooleanInput, Create } from "react-admin";
import { useEffect, useState } from "react";
import { useWatch, useFormContext } from 'react-hook-form';

const Watcher = ({ setIsPro, setIsEleve, setIsInstructeur }) => {

  const { control, setValue } = useFormContext();

  const isPro = useWatch({ control, name: 'isPro', defaultValue: false });
  const isEleve = useWatch({ control, name: 'isEleve', defaultValue: false});
  const isInstructeur = useWatch({ control, name: 'isInstructeur', defaultValue: false});

  useEffect(() => {
    setIsEleve(isEleve);
    if (isEleve) {
      if (isPro) {
        setIsPro(false);
        setValue('isPro', false);
      }
      if (isInstructeur) {
        setIsInstructeur(false);
        setValue('isInstructeur', false);
      }
    }
  }, [isEleve, setIsEleve]);
  
  useEffect(() => {
    setIsPro(isPro);
    if (isPro && isEleve) {
        setIsEleve(false);
        setValue('isEleve', false);
    }
  }, [isPro, setIsPro]);

  useEffect(() => {
    setIsInstructeur(isInstructeur);
    if (isInstructeur) {
      if (!isPro) {
        setIsPro(true);
        setValue('isPro', true);
      }
      if (isEleve) {
        setIsEleve(false);
        setValue('isEleve', false);
      }
    }
  }, [isInstructeur, setIsInstructeur]);

  return null;
};

export const ProfilesCreate = () => {

  const [isPro, setIsPro] = useState(null);
  const [isEleve, setIsEleve] = useState(null);
  const [isInstructeur, setIsInstructeur] = useState(null);

  return (
    <Create redirect="list">
      <SimpleForm>
        <ReferenceInput reference="users" source="pilote" label="Pilote" />
        <BooleanInput source="isEleve" label="Pilote en formation" defaultValue={ false }/>
        <BooleanInput source="isPro" label="Pilote professionnel" defaultValue={ false }/>
        <BooleanInput source="isInstructeur" label="Pilote instructeur" defaultValue={ false }/>
        <Watcher setIsPro={ setIsPro } setIsEleve={ setIsEleve } setIsInstructeur={ setIsInstructeur }/>
      </SimpleForm>
    </Create>
  );
};