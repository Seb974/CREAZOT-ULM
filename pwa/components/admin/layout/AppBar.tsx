import { AppBar, UserMenu, TitlePortal } from "react-admin";
import Logout from "./Logout";
import Flight from "./Flight";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Link } from 'react-router-dom';
import logo from "../../../public/api-platform/logo.png";
import Reservation from "./Reservation";
import { isDefined } from "../../../app/lib/utils";
import { useClient } from '../../admin/ClientProvider';
import GlobalLoader from "../../admin/layout/GlobalLoader";
import { useEffect } from "react";

const CustomAppBar = () => {

  const session = useSession();
  const user = session.data.user;
  const { client, loading } = useClient();

  const logoSrc = client.logo ? `${client.logo}?v=${Date.now()}` : "/images/logo.png";

  useEffect(() => console.log(client), [client]);

  return loading ? <GlobalLoader/> : 
    isDefined(client) && (
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
              alt={ "logo " + client.name }
              src={ logoSrc || "/images/logo.png"}
              width={60}
              height={60}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/logo.png";
              }}
            />
          </Link>
          
        </div>
      </AppBar>
    )
};

export default CustomAppBar;
