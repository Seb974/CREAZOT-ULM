import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  CreateButton,
  SimpleList,
} from "react-admin";
import { useMediaQuery, Theme } from "@mui/material";

export const CountryCodeList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  return (
    <List
      perPage={25}
      sort={{ field: "code", order: "ASC" }}
      title="Codes pays"
      exporter={false}
      actions={<CreateButton label="Ajouter un code pays" />}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => `${record.code} - ${record.label}`}
          linkType="edit"
        />
      ) : (
        <Datagrid
          bulkActionButtons={false}
          rowClick="edit"
          sx={{
            "& .RaDatagrid-headerCell": {
              backgroundColor: "#ededed",
              fontWeight: "lighter",
            },
          }}
        >
          <TextField source="code" label="Code" />
          <TextField source="label" label="Libellé" />
          <EditButton label="" />
          <DeleteButton label="" redirect={false} mutationMode="pessimistic" />
        </Datagrid>
      )}
    </List>
  );
};
