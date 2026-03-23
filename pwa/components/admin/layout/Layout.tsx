import { Layout, type LayoutProps } from "react-admin";
import AppBar from "./AppBar";
import Menu from "./Menu";
import { useClient } from "../ClientProvider";
import GlobalLoader from './GlobalLoader';

const DefaultLayout = (props: React.JSX.IntrinsicAttributes & LayoutProps) => {

  const { loading } = useClient();

  if (loading) return <GlobalLoader />;

  return (
      <Layout 
        {...props} 
        appBar={AppBar} 
        menu={Menu}
        sx={{
          '& .RaLayout-appFrame': {
            width: '100%',
            maxWidth: '100vw',
          },
          '& .RaLayout-content': {
            '@media (max-width: 768px)': {
              maxWidth: '100vw',
              overflowX: 'hidden',
            }
          },
          '& .RaSidebar-fixed': {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 48px)',
          },
          '& .MuiDrawer-paper': {
            display: 'flex',
            flexDirection: 'column',
          },
          '& .RaMenu-open': {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          },
      }}
      />
  );
}

const MyLayout = ({ children }) => {
  return <DefaultLayout>{children}</DefaultLayout>
};

export default MyLayout;
