import { Menu, MenuItemLink, useSidebarState } from "react-admin";
import ClientSelector from '../ClientSelector';
import CommentIcon from "@mui/icons-material/Comment";
import GroupIcon from '@mui/icons-material/Group';
import FlightIcon from '@mui/icons-material/Flight';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import BadgeIcon from '@mui/icons-material/Badge';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PublicIcon from '@mui/icons-material/Public';
import BuildIcon from '@mui/icons-material/Build';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import { useClient } from '../../admin/ClientProvider';
import { isDefined } from "../../../app/lib/utils";
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg';
import { useState } from 'react';
import { Collapse } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import FilterIcon from '@mui/icons-material/Filter';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import CollectionsIcon from '@mui/icons-material/Collections';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useSessionContext } from "../../admin/SessionContextProvider";
import { clientUsingAvailabilityFilter, clientWithExpensesManagement } from "../../../app/lib/client";
import ConnectingAirportsIcon from '@mui/icons-material/ConnectingAirports';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import ExtensionIcon from '@mui/icons-material/Extension';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PeopleIcon from "@mui/icons-material/People";
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import RadarIcon from '@mui/icons-material/Radar';
import FlagIcon from "@mui/icons-material/Flag";
import PercentIcon from "@mui/icons-material/Percent";
import GavelIcon from "@mui/icons-material/Gavel";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const CustomMenu = () => {

  const { session } = useSessionContext();
  const user = session?.user;
  const { client, isAdmin, isSuperAdmin } = useClient();
  const [superAdminOpen, setSuperAdminOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [tarificationOpen, setTarificationOpen] = useState(false);
  const [openSidebar] = useSidebarState();

  const handleSuperAdminClick = e => {
    e.preventDefault();
    setSuperAdminOpen(!superAdminOpen);
  };

  const handleOptionsClick = e => {
    e.preventDefault();
    setOptionsOpen(!optionsOpen);
  };

  const handleTarificationClick = e => {
    e.preventDefault();
    setTarificationOpen(!tarificationOpen);
  };

  return (
    <Menu>
      <Menu.DashboardItem />
      {/* @ts-ignore */}
      { (isDefined(client) && isDefined(client.hasReservation) && client.hasReservation) && isAdmin &&
        <Menu.Item
          to="/reservations"
          primaryText="Réservations"
          leftIcon={<EditCalendarIcon />}
        />
      }
      {/* @ts-ignore */}
      { (isDefined(client) && (client.hasAiReservationAssistant || client.hasVoiceAssistant)) && isAdmin &&
        <Menu.Item
          to="/conversation_threads"
          primaryText="Assistant IA"
          leftIcon={<SmartToyIcon />}
        />
      }
      {/* @ts-ignore */}
      { (isDefined(client) && isDefined(client.hasGifts) && client.hasGifts) && isAdmin &&
        <Menu.Item
          to="/cadeaux"
          primaryText="Prépaiements"
          leftIcon={<CreditScoreIcon />}
        />
      }
      {/* @ts-ignore */}
      { isAdmin && clientWithExpensesManagement(client) &&
        <Menu.Item
          to="/expenses"
          primaryText="Dépenses"
          leftIcon={<ShoppingCartIcon />}
        />
      }
      {/* @ts-ignore */}
      { isAdmin && isDefined(client) && isDefined(client.hasPaymentManagement) && client.hasPaymentManagement &&
        <Menu.Item
          to="/payments"
          primaryText="Paiements"
          leftIcon={<PointOfSaleIcon />}
        />
      }
      <Menu.Item
        to="/prestations"
        primaryText="Carnets de vols"
        leftIcon={<AirplaneTicketIcon />}
      />
      <Menu.Item
        to="/vols"
        primaryText="Vols"
        leftIcon={<FlightTakeoffIcon />}
      />
      {/* @ts-ignore */}
      { (isDefined(client) && isDefined(client.hasLandingManagement) && client.hasLandingManagement) && isAdmin &&
        <Menu.Item
          to="/landings"
          primaryText="Atterrissages"
          leftIcon={<FlightLandIcon />}
        />
      }
      
      { isDefined(client) && isDefined(client.hasPassengerRegistration) && client.hasPassengerRegistration && 
        <Menu.Item
          to="/passagers"
          primaryText="Passagers"
          leftIcon={<GroupIcon />}
        />
      }
      
      {/* @ts-ignore */}
      { isAdmin &&
        <Menu.Item
          to="/entretiens"
          primaryText="Maintenance"
          leftIcon={<BuildIcon />}
        />
      }
      {/* @ts-ignore */}
      { isAdmin &&
        <Menu.Item
          to="/aeronefs"
          primaryText="Aéronefs"
          leftIcon={<FlightIcon />}
        />
      }
      {/* @ts-ignore */}
      { isAdmin && clientUsingAvailabilityFilter(client) &&
        <Menu.Item
          to="/disponibilites"
          primaryText="Disponibilités"
          leftIcon={<InsertInvitationIcon />}
        />
      }
      {/* @ts-ignore */}
      { isAdmin &&
        <Menu.Item
          to="/profil_pilotes"
          primaryText="Pilotes"
          leftIcon={<BadgeIcon />}
        />
      }

      {/* @ts-ignore */}
      { isAdmin &&
          <MenuItemLink
              to="#"
              onClick={ handleSuperAdminClick }
              primaryText="Administration"
              leftIcon={<TuneIcon className="h-[24px] w-[24px]"/>}
              dense={ !openSidebar }
              sx={{ cursor: 'pointer', backgroundColor: superAdminOpen ? '#EFF2F5' : '#F9FAFB' }}
          >
          </MenuItemLink>
      }
      {/* @ts-ignore */}
      { isAdmin &&
        <Collapse in={ superAdminOpen } timeout="auto" unmountOnExit>
            { isAdmin &&
              <Menu.Item
                to="/circuits"
                primaryText="Circuits"
                leftIcon={<PublicIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }  
            {/* @ts-ignore */}
            { isSuperAdmin && isDefined(client) && isDefined(client.hasOptions) && client.hasOptions && 
              <>
                <MenuItemLink
                      to="#"
                      onClick={ handleOptionsClick }
                      primaryText="Options"
                      leftIcon={<CollectionsIcon className="h-[24px] w-[24px]"/>}
                      dense={ !openSidebar }
                      sx={{ cursor: 'pointer',  pl: 3, backgroundColor: optionsOpen ? '#E4E7EB' : '#EFF2F5' }}
                  >
                  </MenuItemLink>
                  <Collapse in={ optionsOpen } timeout="auto" unmountOnExit>
                      <Menu.Item
                            to="/options"
                            primaryText="Eléments"
                            leftIcon={<CropOriginalIcon />}
                            sx={{ pl: 2, backgroundColor: '#E4E7EB' }}
                          />
                      <Menu.Item
                            to="/combinaisons"
                            primaryText="Packs commerciaux"
                            leftIcon={<FilterIcon />}
                            sx={{ pl: 2, backgroundColor: '#E4E7EB' }}
                          />
                </Collapse>
              </>
            }
            { isAdmin &&
              <Menu.Item
                to="/airports"
                primaryText="Aéroports"
                leftIcon={<ConnectingAirportsIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }
            { isAdmin &&
              <Menu.Item
                to="/cameras"
                primaryText="Caméras"
                leftIcon={<VideoCameraBackIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }
            { isAdmin &&
              <Menu.Item
                to="/flight_rules"
                primaryText="Règles de vol"
                leftIcon={<GavelIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }
            {/* @ts-ignore */}
            { (isDefined(client) && isDefined(client.hasPartners) && client.hasPartners) && isAdmin &&
              <Menu.Item
                to="/origines"
                primaryText="Partenaires"
                leftIcon={<StoreIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }
            {/* @ts-ignore */}
            { isSuperAdmin && (isDefined(client) && isDefined(client.hasOriginContact) && client.hasOriginContact) && 
              <Menu.Item
                    to="/contacts"
                    primaryText="Contacts"
                    leftIcon={<PermPhoneMsgIcon />}
                    sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                  />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/natures"
                  primaryText="Natures"
                  leftIcon={<CommentIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/qualifications"
                  primaryText="Qualifications"
                  leftIcon={<AdminPanelSettingsIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/clients"
                  primaryText="Client"
                  leftIcon={<PersonIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isAdmin &&
              <Menu.Item
                to="/members"
                primaryText="Membres"
                leftIcon={<PeopleIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }
            { isAdmin &&
              <Menu.Item
                to="/client_access_requests"
                primaryText="Demandes d'accès"
                leftIcon={<AssignmentIndIcon />}
                sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
              />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/country_codes"
                  primaryText="Codes pays"
                  leftIcon={<FlagIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/tax_rates"
                  primaryText="Taux de TVA"
                  leftIcon={<PercentIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/icao_references"
                  primaryText="Codes ICAO"
                  leftIcon={<RadarIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
            { isSuperAdmin &&
            <Menu.Item
                  to="/site-settings"
                  primaryText="Paramétrage SaaS"
                  leftIcon={<SettingsApplicationsIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            }
        </Collapse>
      }

      { isSuperAdmin &&
          <MenuItemLink
              to="#"
              onClick={ handleTarificationClick }
              primaryText="Tarification"
              leftIcon={<MonetizationOnIcon className="h-[24px] w-[24px]"/>}
              dense={ !openSidebar }
              sx={{ cursor: 'pointer', backgroundColor: tarificationOpen ? '#EFF2F5' : '#F9FAFB' }}
          >
          </MenuItemLink>
      }
      { isSuperAdmin &&
        <Collapse in={ tarificationOpen } timeout="auto" unmountOnExit>
            <Menu.Item
              to="/pricing-categories"
              primaryText="Grilles tarifaires"
              leftIcon={<CategoryIcon />}
              sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
            />
            <Menu.Item
              to="/pricing-tiers"
              primaryText="Paliers"
              leftIcon={<LayersIcon />}
              sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
            />
            <Menu.Item
              to="/module-packs"
              primaryText="Packs de modules"
              leftIcon={<ExtensionIcon />}
              sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
            />
            <Menu.Item
              to="/module-pack-prices"
              primaryText="Prix des packs"
              leftIcon={<PriceChangeIcon />}
              sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
            />
            <Menu.Item
              to="/subscriptions"
              primaryText="Abonnements"
              leftIcon={<SubscriptionsIcon />}
              sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
            />
        </Collapse>
      }

      <div style={{ flexGrow: 1 }} />
      <ClientSelector />
    </Menu>
  );
};

export default CustomMenu;
