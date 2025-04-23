import { 
  Edit, 
  useDataProvider,
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator
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

export const CombinaisonsEdit = () => {

  const dataProvider = useDataProvider();
  const [options, setOptions] = useState([]);
  const [prix, setPrix] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    getOptions();
  }, []);

  const getOptions = () => {
    dataProvider
        .getList("options", {})
        .then(({ data }) => setOptions(data));
  };

  const transform = (data) => {
    return {...data,
      ...data,
      prix,
      options: isDefinedAndNotVoid(selectedOptions) ? selectedOptions.map(o => ({"@id": (typeof o === 'string' ? o : o['@id']), name: isDefined(o.name) ? o.name :''})) : []
    }
  };

  return (
  <Edit transform={transform}>
      <SimpleForm> 
        <TextInput source="nom" label="Nom"/>
        <NumberInput source="minPassager" label="Nombre de passager(s) minimum" min={ 1 } defaultValue={ 1 }/>
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
  </Edit>
  )
};