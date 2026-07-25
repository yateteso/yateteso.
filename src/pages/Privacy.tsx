import React from 'react';
import { Greeting } from '../components/Greeting';

export function Privacy() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <Greeting />
      <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      <div className="prose prose-zinc max-w-none">
        <p>At yateteso, accessible from our website, one of our main priorities is the privacy of our visitors.</p>
        <h3>1. Information We Collect</h3>
        <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
        <p>If you contact us directly via +233557873784, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect in various ways, including to:</p>
        <ul>
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
        </ul>
      </div>
    </div>
  );
}
