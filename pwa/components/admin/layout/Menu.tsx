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
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

const CustomMenu = () => {

  return (
    <Menu>
      <Menu.DashboardItem />
      <Menu.Item
        to="/prestations"
        primaryText="Carnets de vols"
        leftIcon={<FlightTakeoffIcon />}
      />
      <Menu.Item
        to="/vols"
        primaryText="Vols"
        leftIcon={<AirplaneTicketIcon />}
      />
      <Menu.Item
        to="/passagers"
        primaryText="Passagers"
        leftIcon={<GroupIcon />}
      />
      <Menu.Item
        to="/aeronefs"
        primaryText="Aéronefs"
        leftIcon={<FlightIcon />}
      />
      <Menu.Item
        to="/circuits"
        primaryText="Circuits"
        leftIcon={<PublicIcon />}
      />
      {/* <Menu.Item
        to="/options"
        primaryText="Options"
        leftIcon={<AddAPhotoIcon />}
      /> */}
      <Menu.Item
        to="/users"
        primaryText="Pilotes"
        leftIcon={<BadgeIcon />}
      />
      {/* <Menu.Item
        to="/books"
        primaryText="Test"
        leftIcon={<AirplaneTicketIcon />}
      /> */}
    </Menu>
  );
};

export default CustomMenu;
