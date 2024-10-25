import { AppBar, UserMenu, TitlePortal } from "react-admin";
import Logo from "../Logo";
import Logout from "./Logout";
import Image from "next/image";
import logo from "../../../public/api-platform/logo.png"
// import DocTypeMenuButton from "./DocTypeMenuButton";

const CustomAppBar = () => (
  <AppBar
    userMenu={
      <UserMenu>
        <Logout />
      </UserMenu>
    }
  >
    <TitlePortal />
    <div className="flex-1">
      {/* <Logo /> */}
      <Image
        alt="Planetair974"
        src={logo}
        width={60}
        height={60}
      />
      
    </div>
    {/* <DocTypeMenuButton /> */}
  </AppBar>
);

export default CustomAppBar;
