import { Menu, usePermissions } from "react-admin";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CommentIcon from "@mui/icons-material/Comment";
import GroupIcon from '@mui/icons-material/Group';
import FlightIcon from '@mui/icons-material/Flight';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import BadgeIcon from '@mui/icons-material/Badge';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AirlinesIcon from '@mui/icons-material/Airlines';
import PublicIcon from '@mui/icons-material/Public';
import BuildIcon from '@mui/icons-material/Build';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import EventIcon from '@mui/icons-material/Event';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import authProvider from "../authProvider";
import { useSession } from "next-auth/react";
import { isDefined } from "../../../app/lib/utils";

const CustomMenu = () => {

  const session = useSession();
  const user = session.data.user;

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
          to="/users"
          primaryText="Pilotes"
          leftIcon={<BadgeIcon />}
        />
      }
      {/* <Menu.Item
            to="/options"
            primaryText="Options"
            leftIcon={<AddAPhotoIcon />}
          /> */}
      {/* <Menu.Item
        to="/books"
        primaryText="Test"
        leftIcon={<AirplaneTicketIcon />}
      /> */}
    </Menu>
  );
};

export default CustomMenu;
