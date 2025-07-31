import { useWatch } from 'react-hook-form';
import { TextInput } from 'react-admin';

export const MessageInput = () => {
  const isGift = useWatch({ name: 'gift' });

  if (!isGift) return null;

  return <TextInput source="message" label="Message" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
};