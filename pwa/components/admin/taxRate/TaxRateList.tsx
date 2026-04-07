import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  DeleteButton,
  CreateButton,
  SimpleList,
  ReferenceField,
  FunctionField,
} from "react-admin";
import { useMediaQuery, Theme } from "@mui/material";

export const TaxRateList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  return (
    <List
      perPage={25}
      sort={{ field: "countryCode", order: "ASC" }}
      title="Taux de TVA"
      exporter={false}
      actions={<CreateButton label="Ajouter un taux" />}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.label}
          secondaryText={(record) => `${(record.rate * 100).toFixed(2)}%`}
          tertiaryText={(record) => record.countryCode?.code ?? ""}
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
          <ReferenceField source="countryCode" reference="country_codes" label="Code pays" link={false}>
            <FunctionField render={(record: any) => `${record.code} - ${record.label}`} />
          </ReferenceField>
          <TextField source="label" label="Libellé" />
          <FunctionField
            source="rate"
            label="Taux"
            render={(record: any) => `${(record.rate * 100).toFixed(2)} %`}
          />
          <EditButton label="" />
          <DeleteButton label="" redirect={false} mutationMode="pessimistic" />
        </Datagrid>
      )}
    </List>
  );
};
