import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  FunctionField,
  useRecordContext,
  useNotify,
  useRefresh,
} from "react-admin";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { useSessionContext } from "../SessionContextProvider";
import axios from "axios";
import { ENTRYPOINT } from "../../../config/entrypoint";

const statusConfig: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "success" | "error" }> = {
  pending: { label: "En attente", color: "warning" },
  analyzing: { label: "Analyse IA", color: "info" },
  proposing: { label: "Créneaux proposés", color: "primary" },
  awaiting_customer: { label: "Attente client", color: "info" },
  awaiting_club: { label: "À valider", color: "warning" },
  confirmed: { label: "Confirmée", color: "success" },
  cancelled: { label: "Annulée", color: "error" },
  expired: { label: "Expirée", color: "default" },
};

const channelLabels: Record<string, string> = {
  email: "📧 Email",
  voice: "📞 Vocal",
  sms: "💬 SMS",
  whatsapp: "💬 WhatsApp",
};

const ThreadDetail = () => {
  const record = useRecordContext();
  const { session } = useSessionContext();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const ctx = record.aiContext || {};
  const extracted = ctx.extracted || {};
  const proposedSlots = ctx.proposed_slots || [];
  const cfg = statusConfig[record.status] || { label: record.status, color: "default" as const };

  const handleValidate = async (slotIndex: number = 0) => {
    try {
      await axios.post(
        `${ENTRYPOINT}/admin/ai-reservation/conversations/${record.id}/validate`,
        { slotIndex },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );
      notify("Réservation créée avec succès !", { type: "success" });
      refresh();
    } catch (err: any) {
      notify(err?.response?.data?.error || "Erreur", { type: "error" });
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post(
        `${ENTRYPOINT}/admin/ai-reservation/conversations/${record.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );
      notify("Conversation annulée", { type: "info" });
      refresh();
    } catch (err: any) {
      notify(err?.response?.data?.error || "Erreur", { type: "error" });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SmartToyIcon sx={{ fontSize: 32, color: "#6366f1" }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Conversation #{record.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {channelLabels[record.channel] || record.channel} — {new Date(record.createdAt).toLocaleString("fr-FR")}
          </Typography>
        </Box>
        <Chip label={cfg.label} color={cfg.color} sx={{ ml: "auto" }} />
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Informations client
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Nom</Typography>
            <Typography>{record.customerName || extracted.customer_name || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography>{record.customerEmail || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Téléphone</Typography>
            <Typography>{record.customerPhone || "—"}</Typography>
          </Box>
        </Box>
      </Paper>

      {record.summary && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<SmartToyIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Résumé IA</Typography>
          <Typography variant="body2">{record.summary}</Typography>
        </Alert>
      )}

      {Object.keys(extracted).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Données extraites par l'IA
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            {extracted.circuit_code && (
              <Box>
                <Typography variant="caption" color="text.secondary">Prestation</Typography>
                <Typography>{extracted.circuit_code}</Typography>
              </Box>
            )}
            {extracted.preferred_date && (
              <Box>
                <Typography variant="caption" color="text.secondary">Date souhaitée</Typography>
                <Typography>{extracted.preferred_date}</Typography>
              </Box>
            )}
            {extracted.preferred_time && (
              <Box>
                <Typography variant="caption" color="text.secondary">Heure souhaitée</Typography>
                <Typography>{extracted.preferred_time}</Typography>
              </Box>
            )}
            {extracted.quantity && (
              <Box>
                <Typography variant="caption" color="text.secondary">Nombre de personnes</Typography>
                <Typography>{extracted.quantity}</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {proposedSlots.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Créneaux proposés
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Début</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Prix</TableCell>
                {record.status === "awaiting_club" && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {proposedSlots.map((slot: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{slot.debut}</TableCell>
                  <TableCell>{slot.fin}</TableCell>
                  <TableCell>{slot.aeronef || "—"}</TableCell>
                  <TableCell>{slot.prix ? `${slot.prix} €` : "—"}</TableCell>
                  {record.status === "awaiting_club" && (
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleValidate(i)}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        Valider ce créneau
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {record.reservation && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Réservation #{typeof record.reservation === "object" ? record.reservation.id : record.reservation} créée avec succès.
          </Typography>
        </Alert>
      )}

      {record.status !== "confirmed" && record.status !== "cancelled" && (
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {record.status === "awaiting_club" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleValidate(0)}
              sx={{ textTransform: "none" }}
            >
              Valider (1er créneau)
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            sx={{ textTransform: "none" }}
          >
            Annuler cette conversation
          </Button>
        </Box>
      )}
    </Box>
  );
};

export const ConversationThreadShow = () => (
  <Show title="Détail de la conversation">
    <SimpleShowLayout>
      <ThreadDetail />
    </SimpleShowLayout>
  </Show>
);
