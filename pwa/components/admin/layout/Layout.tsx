import { Layout, type LayoutProps } from "react-admin";
import AppBar from "./AppBar";
import Menu from "./Menu";

const MyLayout = (props: React.JSX.IntrinsicAttributes & LayoutProps) => (
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
);

export default MyLayout;
