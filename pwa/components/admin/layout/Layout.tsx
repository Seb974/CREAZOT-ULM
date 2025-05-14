import { Layout, type LayoutProps } from "react-admin";
import AppBar from "./AppBar";
import Menu from "./Menu";
import { ClientProvider, useClient } from "../ClientProvider";
import GlobalLoader from './GlobalLoader';

const DefaultLayout = (props: React.JSX.IntrinsicAttributes & LayoutProps) => {

  const { client, loading, error } = useClient();

  if (loading) return <GlobalLoader />;

  return (
    <ClientProvider>
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
          }
      }}
      />
    </ClientProvider>
  );
}

const MyLayout = ({ children }) => {
  return (
    <ClientProvider>
      <DefaultLayout>{children}</DefaultLayout>
    </ClientProvider>
  );
};

export default MyLayout;
