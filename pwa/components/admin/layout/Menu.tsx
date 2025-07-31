import { Menu, MenuItemLink, useSidebarState } from "react-admin";
import CommentIcon from "@mui/icons-material/Comment";
import GroupIcon from '@mui/icons-material/Group';
import FlightIcon from '@mui/icons-material/Flight';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import BadgeIcon from '@mui/icons-material/Badge';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PublicIcon from '@mui/icons-material/Public';
import BuildIcon from '@mui/icons-material/Build';
import RedeemIcon from '@mui/icons-material/Redeem';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import { useSession } from "next-auth/react";
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

const CustomMenu = () => {

  const session = useSession();
  const user = session.data.user;
  const { client, loading } = useClient();
  const [superAdminOpen, setSuperAdminOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [openSidebar] = useSidebarState();

  const handleSuperAdminClick = e => {
    e.preventDefault();
    setSuperAdminOpen(!superAdminOpen);
  };
  const handleOptionsClick = e => {
    e.preventDefault();
    setOptionsOpen(!optionsOpen);
  };

  return (
    <Menu>
      <Menu.DashboardItem />
      {/* @ts-ignore */}
      { (isDefined(client) && isDefined(client.hasReservation) && client.hasReservation) && isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/reservations"
          primaryText="Réservations"
          leftIcon={<EditCalendarIcon />}
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
      { (isDefined(client) && isDefined(client.hasLandingManagement) && client.hasLandingManagement) && isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/landings"
          primaryText="Atterrissages"
          leftIcon={<FlightLandIcon />}
        />
      }
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") && isDefined(client) && isDefined(client.hasPaymentManagement) && client.hasPaymentManagement &&
        <Menu.Item
          to="/payments"
          primaryText="Paiements"
          leftIcon={<PointOfSaleIcon />}
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
      { (isDefined(client) && isDefined(client.hasGifts) && client.hasGifts) && isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/cadeaux"
          primaryText="Prépaiements"
          leftIcon={<CreditScoreIcon />}
        />
      }
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/entretiens"
          primaryText="Maintenance"
          leftIcon={<BuildIcon />}
        />
      }
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/aeronefs"
          primaryText="Aéronefs"
          leftIcon={<FlightIcon />}
        />
      }
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/circuits"
          primaryText="Circuits"
          leftIcon={<PublicIcon />}
        />
      }
      {/* @ts-ignore */}
      { (isDefined(client) && isDefined(client.hasPartners) && client.hasPartners) && isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/origines"
          primaryText="Pouvoyeurs"
          leftIcon={<StoreIcon />}
        />
      }
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          // to="/users"
          to="/profil_pilotes"
          primaryText="Pilotes"
          leftIcon={<BadgeIcon />}
        />
      }

      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "super_admin") &&
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
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "super_admin") &&
        <Collapse in={ superAdminOpen } timeout="auto" unmountOnExit>
            <Menu.Item
                  to="/qualifications"
                  primaryText="Qualifications"
                  leftIcon={<AdminPanelSettingsIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            { isDefined(client) && isDefined(client.hasOptions) && client.hasOptions && 
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
            <Menu.Item
                  to="/natures"
                  primaryText="Natures"
                  leftIcon={<CommentIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            { (isDefined(client) && isDefined(client.hasOriginContact) && client.hasOriginContact) && 
              <Menu.Item
                    to="/contacts"
                    primaryText="Contacts"
                    leftIcon={<PermPhoneMsgIcon />}
                    sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                  />
            }
            <Menu.Item
                  to="/clients"
                  primaryText="Client"
                  leftIcon={<PersonIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
        </Collapse>
      }
    </Menu>
  );
};

export default CustomMenu;
