import PublicWrapper from '../wrapper';
import TermsClient from './TermsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Datavex AI',
  description: 'Terms and Conditions for Datavex AI Pvt. Ltd.',
};

export default function TermsPage() {
  return (
    <PublicWrapper>
      <TermsClient />
    </PublicWrapper>
  );
}
