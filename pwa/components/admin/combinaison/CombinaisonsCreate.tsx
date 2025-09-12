import { 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  Create,
  required,
  useDataProvider,
  ArrayInput,
  SimpleFormIterator,
  useCreate,
  useRedirect,
  useNotify
} from "react-admin";
import { InputBase, InputAdornment, Typography } from '@mui/material';
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useEffect, useState } from "react";
import { useWatch, useFormContext } from 'react-hook-form';

const OptionsWatcher = ({ setSelectedOptions, setPrix, bddOptions }) => {
  const { control } = useFormContext();
  const options = useWatch({ control, name: 'options', defaultValue: [] });

  useEffect(() => {
      const notNullOptions= options.filter(o => (!isDefined(o) || typeof o === 'string' ? o : o['@id']) !== null);
      const selectedOptions = isDefinedAndNotVoid(notNullOptions) ? notNullOptions.map(o => bddOptions.find(option => (typeof o === 'string' ? o : o['@id']) === option['@id'])) : [];
      const prix = selectedOptions.reduce((sum, option) => sum += (isDefined(option) && isDefined(option.prix) ? option.prix : 0), 0);
      setSelectedOptions(selectedOptions);
      setPrix(prix);

  }, [options, bddOptions, setSelectedOptions]);

  return null;
};

export const CombinaisonsCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const dataProvider = useDataProvider();
  const [options, setOptions] = useState([]);
  const [prix, setPrix] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => getOptions(), []);


  const getOptions = () => {
    dataProvider
        .getList("options", {})
        .then(({ data }) => setOptions(data));
  };
    
  const onSubmit = async data => {
    try {
      data = {
        ...data,
        prix,
        options: isDefinedAndNotVoid(selectedOptions) ? selectedOptions.map(o => ({"@id": (typeof o === 'string' ? o : o['@id']), name: isDefined(o.name) ? o.name :''})) : []
      };
      await create('combinaisons', { data });
      notify('La combinaison d\'option a bien été enregistrée.', { type: 'info' });
      redirect('list', 'combinaisons');
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement de la combinaison d\'option.`, { type: 'error' });
      redirect('list', 'combinaisons');
      console.error(error);
    }
  };

  return (
    <Create redirect="list">
      <SimpleForm onSubmit={onSubmit}> 
        <TextInput source="nom" label="Nom" validate={required()}/>
        <NumberInput source="minPassager" label="Nombre de passager(s) minimum" min={ 1 } defaultValue={ 1 } validate={required()}/>
        <ArrayInput source="options" label="Options associée(s)" >
          <SimpleFormIterator inline disableReordering>
              <ReferenceInput reference="options" source="@id" label="Option" />
          </SimpleFormIterator>
        </ArrayInput>
        <InputBase
            value={ prix }
            readOnly
            disabled
            sx={{
              width: '100%',
              padding: '8px 12px',
              borderBottom: '1px solid #3f51b5',
              backgroundColor: '#F5F5F5', 
              '&.Mui-disabled': {
                backgroundColor: '#F5F5F5',
                color: '#666',
              },
              '&:hover': {
                backgroundColor: '#f1f5f9',
              },
            }}
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
        />
        <OptionsWatcher setSelectedOptions={ setSelectedOptions } setPrix={ setPrix } bddOptions={ options }/>
      </SimpleForm>
    </Create>
  ) ;
}