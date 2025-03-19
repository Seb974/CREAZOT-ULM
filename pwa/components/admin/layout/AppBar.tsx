import { AppBar, UserMenu, TitlePortal } from "react-admin";
import Logout from "./Logout";
import Flight from "./Flight";
import Image from "next/image";
import logo from "../../../public/api-platform/logo.png"

const CustomAppBar = () => (
  <AppBar
    color="error"
    userMenu={
      <UserMenu>
        <Flight />
        <Logout />
      </UserMenu>
    }
  >
    <TitlePortal />
    <div className="flex-1">
      <Image
        alt="Planetair974"
        src={logo}
        width={60}
        height={60}
      />
      
    </div>
  </AppBar>
);

export default CustomAppBar;
