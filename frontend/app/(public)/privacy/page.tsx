import PublicWrapper from '../wrapper';
import PrivacyClient from './PrivacyClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Datavex AI',
  description: 'Privacy Policy for Datavex AI Pvt. Ltd. Learn how we handle your information when you visit our website.',
};

export default function PrivacyPolicyPage() {
  return (
    <PublicWrapper>
      <PrivacyClient />
    </PublicWrapper>
  );
}
