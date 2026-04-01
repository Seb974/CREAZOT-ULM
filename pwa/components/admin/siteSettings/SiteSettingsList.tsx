import { useEffect, useState } from "react";
import { useDataProvider, useRedirect } from "react-admin";
import { CircularProgress, Box } from "@mui/material";

export const SiteSettingsList = () => {
    const dataProvider = useDataProvider();
    const redirect = useRedirect();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dataProvider
            .getList("site-settings", {
                pagination: { page: 1, perPage: 1 },
                sort: { field: "id", order: "ASC" },
                filter: {},
            })
            .then(({ data }) => {
                if (data && data.length > 0) {
                    redirect("edit", "site-settings", data[0].id);
                }
            })
            .catch((error) => {
                console.error("Erreur chargement SiteSettings", error);
                setLoading(false);
            });
    }, [dataProvider, redirect]);

    if (!loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <span>Aucun paramètre trouvé.</span>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
        </Box>
    );
};
