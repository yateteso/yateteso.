import React from 'react';
import { Greeting } from '../components/Greeting';

export function Terms() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <Greeting />
      <h1 className="text-4xl font-bold tracking-tight mb-8">Terms and Conditions</h1>
      <div className="prose prose-zinc max-w-none">
        <p>Welcome to yateteso.!</p>
        <p>These terms and conditions outline the rules and regulations for the use of our website.</p>
        <h3>1. General</h3>
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use yateteso. if you do not agree to take all of the terms and conditions stated on this page.</p>
        <h3>2. Products and Services</h3>
        <p>We reserve the right to modify or discontinue any product at any time without notice. We are not liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the service.</p>
        <h3>3. Contact Information</h3>
        <p>If you have any queries regarding any of our terms, please contact us at +233557873784 via Call or WhatsApp.</p>
      </div>
    </div>
  );
}
