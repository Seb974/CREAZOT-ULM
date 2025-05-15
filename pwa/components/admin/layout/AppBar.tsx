import { AppBar, UserMenu, TitlePortal } from "react-admin";
import Logout from "./Logout";
import Flight from "./Flight";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Link } from 'react-router-dom';
import logo from "../../../public/api-platform/logo.png";
// import logo from ''
import Reservation from "./Reservation";
import { isDefined } from "../../../app/lib/utils";

const CustomAppBar = () => {

  const session = useSession();
  const user = session.data.user;

  return (
    <AppBar
      color="error"
      userMenu={
        <UserMenu>
          {/* @ts-ignore  */}
          { isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") && <Reservation /> }
          <Flight />
          <Logout />
        </UserMenu>
      }
    >
      <TitlePortal />
      <div className="flex-1">
        <Link to="/">
          <Image
            alt="Planetair974"
            src={logo}
            width={60}
            height={60}
          />
        </Link>
        
      </div>
    </AppBar>
  )
};

export default CustomAppBar;
