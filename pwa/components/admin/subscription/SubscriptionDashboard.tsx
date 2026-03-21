import { useGetList, Title, ReferenceField, TextField, NumberField, DateField, EditButton, FunctionField } from "react-admin";
import { Card, CardContent, Typography, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "warning" | "error" | "default" }> = {
  active: { label: "Actif", color: "success" },
  trial: { label: "Essai", color: "warning" },
  suspended: { label: "Suspendu", color: "error" },
  cancelled: { label: "Annulé", color: "default" },
};

const KpiCard = ({ title, value, borderColor }: { title: string; value: number; borderColor: string }) => (
  <Card sx={{ flex: 1, minWidth: 200, borderLeft: `4px solid ${borderColor}` }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h4" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const SubscriptionDashboard = () => {
  const { data: clients, isLoading } = useGetList("clients", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "name", order: "ASC" },
  });

  if (isLoading || !clients) return null;

  const activeCount = clients.filter((c) => c.subscriptionStatus === "active").length;
  const trialCount = clients.filter((c) => c.subscriptionStatus === "trial").length;
  const suspendedCount = clients.filter((c) => c.subscriptionStatus === "suspended").length;

  return (
    <div>
      <Title title="Abonnements" />

      <Box sx={{ display: "flex", gap: 2, mb: 3, mt: 2, flexWrap: "wrap" }}>
        <KpiCard title="Clients actifs" value={activeCount} borderColor="#4caf50" />
        <KpiCard title="En période d'essai" value={trialCount} borderColor="#ff9800" />
        <KpiCard title="Suspendus" value={suspendedCount} borderColor="#f44336" />
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Liste des clients
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#ededed" }}>
                  <TableCell>Nom</TableCell>
                  <TableCell>Grille tarifaire</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Max aéronefs</TableCell>
                  <TableCell>Prix mensuel</TableCell>
                  <TableCell>Fin d'essai</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => {
                  const statusConf = STATUS_CONFIG[client.subscriptionStatus] || STATUS_CONFIG.cancelled;
                  return (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.pricingCategoryName || "—"}</TableCell>
                      <TableCell>
                        <Chip label={statusConf.label} color={statusConf.color} size="small" />
                      </TableCell>
                      <TableCell>{client.maxAeronefs ?? "—"}</TableCell>
                      <TableCell>
                        {client.monthlyBasePrice != null
                          ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(client.monthlyBasePrice)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {client.trialEndsAt ? new Date(client.trialEndsAt).toLocaleDateString("fr-FR") : "—"}
                      </TableCell>
                      <TableCell>
                        <EditButton resource="clients" record={client} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionDashboard;
