import { useRecordContext } from 'react-admin';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';

const disabledStyle = {
  pointerEvents: 'none',
  color: 'gray',
  opacity: 0.6,
  textDecoration: 'none',
  cursor: 'default'
};

const enabledStyle = {
  textDecoration: 'none',
  // color: 'primary'
}

export const ConversionLink = () => {
  // @ts-ignore
  const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const record = useRecordContext();

  const onClick = e => {
    if (record.used)
      e.preventDefault();
  };
  
  if (!record || !record.originId) return null;

  return  <Link to={`/convert/${ record.originId }`} style={record.used ? disabledStyle : enabledStyle} onClick={e => onClick(e)} className="text-zinc-600">
              <BackupIcon/> 
          </Link>
};