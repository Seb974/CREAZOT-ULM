import { useWatch } from 'react-hook-form';
import { BooleanInput } from 'react-admin';

export const SendEmailInput = () => {
  const isGift = useWatch({ name: 'gift' });

  if (!isGift) return null;

  return <BooleanInput source="sendEmail" label="Envoi du bon cadeau par email" />
};