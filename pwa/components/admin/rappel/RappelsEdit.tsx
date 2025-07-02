import { Edit, SimpleForm, TextInput, BooleanInput, SaveButton, DeleteButton, Toolbar, useRecordContext, DateInput, } from "react-admin";
import { Box } from "@mui/material";
import { useState } from "react";

const CustomToolbar = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Toolbar>
      <SaveButton />
      <DeleteButton mutationMode="pessimistic" redirect={`/?scroll=calendar`}/>
    </Toolbar>
  );
};

export const RappelsEdit = () => {

  const [recordDate, setRecordDate] = useState(new Date());

  const transform = (data) => {
    setRecordDate(new Date(data.date));
    return { ...data, jour: (new Date(data.date)).getDay()};
  };

  return (
    <Edit transform={ transform } mutationMode="pessimistic" redirect={`/?scroll=calendar&refresh=true&date=${recordDate.toJSON().slice(0, 10) || ''}`}>
        <SimpleForm toolbar={<CustomToolbar />}>
          <DateInput source="date" defaultValue={ new Date() } label="Date" />
          <TextInput source="titre" label="Titre" />
          <TextInput source="description" label="Description" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
          <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
              <Box flex={1}>
                  <BooleanInput source="important" label="Important" fullWidth/>
              </Box>
              <Box flex={1}>
                  <BooleanInput source="recurrent" label="Tâche récurrente" fullWidth/>
              </Box>
          </Box>
          <BooleanInput source="finished" label="Clôturé"/>
        </SimpleForm>
    </Edit>
  )
};