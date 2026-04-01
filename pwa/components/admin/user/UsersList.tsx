import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  EmailField,
  FunctionField,
  ExportButton,
  TopToolbar,
  EditButton,
  SimpleList,
  ReferenceArrayField,
  SingleFieldList,
} from "react-admin";
import { Chip, Box, useMediaQuery, type Theme } from "@mui/material";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ClientChipField = () => (
  <FunctionField
    render={(record: any) => (
      <Chip
        label={record.name}
        size="small"
        sx={{
          backgroundColor: record.color ? `${record.color}20` : "#e0e0e0",
          color: record.color || "#666",
          border: `1px solid ${record.color ? `${record.color}55` : "#ccc"}`,
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      />
    )}
  />
);

const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

export const UsersList: NextPage<Props> = () => {
  const isSmall = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down("sm")
  );

  return (
    <List resource="users" actions={<ListActions />}>
      {isSmall ? (
        <SimpleList
          primaryText={(record) =>
            `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim()
          }
          secondaryText={(record) => record.email}
          linkType={false}
        />
      ) : (
        <Datagrid
          sx={{
            "& .RaDatagrid-headerCell": {
              backgroundColor: "#ededed",
              fontWeight: "lighter",
            },
          }}
          rowClick={false}
        >
          <TextField source="firstName" label="Prénom" sortable />
          <TextField source="lastName" label="Nom" sortable />
          <EmailField source="email" label="Email" />
          <ReferenceArrayField
            source="clients"
            reference="clients"
            label="Clients"
            sortable={false}
          >
            <SingleFieldList linkType={false} sx={{ gap: 0.5 }}>
              <ClientChipField />
            </SingleFieldList>
          </ReferenceArrayField>
          <EditButton />
        </Datagrid>
      )}
    </List>
  );
};
