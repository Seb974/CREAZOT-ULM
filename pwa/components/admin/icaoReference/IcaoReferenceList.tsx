import { useState, useCallback } from "react";
import {
  List,
  Datagrid,
  TextField,
  DeleteButton,
  CreateButton,
  SimpleList,
  useListContext,
} from "react-admin";
import {
  useMediaQuery,
  Theme,
  TextField as MuiTextField,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const IcaoSearch = () => {
  const { setFilters, filterValues, displayedFilters } = useListContext();
  const [search, setSearch] = useState(filterValues?.icao || "");

  const applyFilter = useCallback(() => {
    const trimmed = search.trim();
    setFilters(trimmed ? { icao: trimmed } : {}, displayedFilters);
  }, [search, setFilters, displayedFilters]);

  const clearFilter = useCallback(() => {
    setSearch("");
    setFilters({}, displayedFilters);
  }, [setFilters, displayedFilters]);

  return (
    <MuiTextField
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          applyFilter();
        }
      }}
      placeholder="Rechercher un code ICAO..."
      size="small"
      variant="outlined"
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {search && (
              <IconButton size="small" onClick={clearFilter} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={applyFilter} color="primary" edge="end">
              <SearchIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

const ListActions = () => (
  <Box
    display="flex"
    flexWrap="wrap"
    alignItems="center"
    gap={1}
    width="100%"
    px={2}
    pt={1}
    pb={1}
  >
    <Box flexGrow={1} maxWidth={400} minWidth={200}>
      <IcaoSearch />
    </Box>
    <CreateButton label="Ajouter un code" />
  </Box>
);

export const IcaoReferenceList = () => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  return (
    <List
      actions={<ListActions />}
      perPage={25}
      sort={{ field: "icao", order: "ASC" }}
      title="Codes ICAO de référence"
      exporter={false}
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.icao ?? ""}
          linkType={false}
        />
      ) : (
        <Datagrid
          bulkActionButtons={false}
          sx={{
            "& .RaDatagrid-headerCell": {
              backgroundColor: "#ededed",
              fontWeight: "lighter",
            },
          }}
        >
          <TextField source="icao" label="Code ICAO" />
          <DeleteButton label="" redirect={false} mutationMode="pessimistic" />
        </Datagrid>
      )}
    </List>
  );
};
