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
import { isDefined } from "../../../app/lib/utils";
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg';
import { useState } from 'react';
import { Collapse } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import FilterIcon from '@mui/icons-material/Filter';
import StoreIcon from '@mui/icons-material/Store';
import PersonIcon from '@mui/icons-material/Person';
import CollectionsIcon from '@mui/icons-material/Collections';

const CustomMenu = () => {

  const session = useSession();
  const user = session.data.user;
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
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
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
      <Menu.Item
        to="/passagers"
        primaryText="Passagers"
        leftIcon={<GroupIcon />}
      />
      {/* @ts-ignore */}
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
        <Menu.Item
          to="/cadeaux"
          primaryText="Bons cadeaux"
          leftIcon={<RedeemIcon />}
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
      { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") &&
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
            <Menu.Item
                  to="/natures"
                  primaryText="Natures"
                  leftIcon={<CommentIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
            <Menu.Item
                  to="/contacts"
                  primaryText="Contacts"
                  leftIcon={<PermPhoneMsgIcon />}
                  sx={{ pl: 3, backgroundColor: '#EFF2F5' }}
                />
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
