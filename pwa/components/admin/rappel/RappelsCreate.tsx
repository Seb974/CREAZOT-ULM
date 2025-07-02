import { SimpleForm, TextInput, Create, required, BooleanInput, useCreate, useNotify, DateInput } from "react-admin";
import { Box } from "@mui/material";
import { useLocation } from 'react-router-dom';
import { useRef } from "react";


export const RappelsCreate = () => {

  const notify = useNotify();
  const [create] = useCreate();
  const location = useLocation();
  const isOperating = useRef(false);
  const searchParams = new URLSearchParams(location.search);
  const debut = searchParams.get('debut');
 
  const onSubmit = async (data) => {
    if (isOperating.current) return;

    isOperating.current = true;
    const parsedDate = new Date((new Date(data.date)).setHours(12, 0, 0));

    try {
        data = { ...data, date: parsedDate, jour: parsedDate.getDay(), finished: false};
        await create('rappels', { data });
        notify('Le rappel a bien été enregistré.', { type: 'info' });
        const dateStr = parsedDate.toISOString().slice(0, 10);
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = `/admin#/?scroll=calendar&date=${dateStr}`;    // &refresh=true
    } catch (error) {
        notify(`Une erreur bloque l\'enregistrement du rappel.`, { type: 'error' });
        console.error(error);
        window.location.href = `/admin#/?scroll=calendar&date=${parsedDate.toJSON().slice(0, 10) || ''}`;
    } finally {
        isOperating.current = false;
    }
  };

  return (
    <Create redirect="list">
      <SimpleForm onSubmit={onSubmit} defaultValues={{ date: new Date((new Date(debut)).setHours(12, 0, 0)) }}>
        <DateInput source="date" defaultValue={ new Date() } label="Date" validate={required()}/>
        <TextInput source="titre" label="Titre" validate={required()}/>
        <TextInput source="description" label="Description" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
            <Box flex={1}>
                <BooleanInput source="important" label="Important" fullWidth/>
            </Box>
            <Box flex={1}>
                <BooleanInput source="recurrent" label="Tâche récurrente" fullWidth/>
            </Box>
        </Box>
      </SimpleForm>
    </Create>
  ) ;
}