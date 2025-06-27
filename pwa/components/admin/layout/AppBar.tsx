import { AppBar, UserMenu, TitlePortal } from "react-admin";
import { useDataProvider } from "react-admin";
import Logout from "./Logout";
import Flight from "./Flight";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Link } from 'react-router-dom';
import Reservation from "./Reservation";
import { isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useClient } from '../../admin/ClientProvider';
import GlobalLoader from "../../admin/layout/GlobalLoader";
import Oidc from "./Oidc";
import { useEffect, useState } from "react";
import Payment from "./Payment";

const CustomAppBar = () => {

  const session = useSession();
  const user = session.data.user;
  const dataProvider = useDataProvider();
  const { client, loading } = useClient();
  const authorizedProfiles = ['pro', 'instructeur', 'secretariat'];
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [fallback, setFallback] = useState(false);

  const logoSrc = isDefined(client) && isDefined(client.logo) ? `${client.logo}?v=${Date.now()}` : "/images/logo.png";

  useEffect(() => getProfile(), []);

  const getProfile = () => {
    if (isDefined(user)) {
      setProfileLoading(true);
      // @ts-ignore
      dataProvider.getList('profil_pilotes',{ filter: { 'pilote.email': user.email }, sort: {id: 'ASC' } })
                  .then(({ data }) => {
                    setProfile(data[0]);
                    setProfileLoading(false);
                  });

    }
  };

  const isAuthorized = profile => {
    if (isDefined(profile)) {
      const { qualifications } = profile;
      if (isDefinedAndNotVoid(qualifications)) {
        const authorizedSet = new Set(authorizedProfiles);
        return qualifications.map(q => q.slug).some(item => authorizedSet.has(item));
      }
    }
    return false;
  };
  

  return loading || profileLoading ? <GlobalLoader/> : 
    isDefined(client) && (
      <AppBar
        // color={"error"}
        sx={{ backgroundColor: client.color || 'primary' }}
        userMenu={
          <UserMenu>
            {/* @ts-ignore  */}
            { (isDefined(client) && isDefined(client.hasReservation) && client.hasReservation) && isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") && <Reservation /> }
            <Flight />
            {/* @ts-ignore  */}
            { (isDefined(client) && isDefined(client.hasPaymentManagement) && client.hasPaymentManagement) && ((isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin")) || (isDefined(profile) && isAuthorized(profile))) && <Payment /> }
            {/* @ts-ignore  */}
            { (isDefined(client) && isDefined(client.hasReservation) && client.hasReservation) && isDefined(session) && isDefined(user) && user.roles.find(r => r === "admin") && <Oidc /> }
            <Logout />
          </UserMenu>
        }
      >
        <TitlePortal />
        <div className="flex-1">
          <Link to="/">
            <div style={{ position: "relative", width: 50, height: 50 }}>
              <Image
                alt={"logo " + client.name}
                src={fallback ? "/images/logo.png" : (logoSrc || "/images/logo.png")}
                fill
                sizes="50px" 
                onError={() => setFallback(true)}
                className="object-contain"
              />
            </div>

          </Link>
          
        </div>
      </AppBar>
    )
};

export default CustomAppBar;
