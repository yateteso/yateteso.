import React from 'react';
import { Greeting } from '../components/Greeting';

export function Delivery() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <Greeting />
      <h1 className="text-4xl font-bold tracking-tight mb-8">Delivery Information</h1>
      <div className="prose prose-zinc max-w-none">
        <p>At yateteso., we ensure that your premium electronics reach you safely and on time.</p>
        <h3>1. Delivery Options</h3>
        <p>We offer standard and express delivery options across Ghana. Delivery times and costs may vary depending on your specific location.</p>
        <h3>2. Tracking Your Order</h3>
        <p>Once your order is dispatched, you will receive a confirmation message with tracking details.</p>
        <h3>3. Customer Support</h3>
        <p>If you have any questions about your delivery, please reach out to us at <strong>+233557873784</strong> via Call or WhatsApp.</p>
      </div>
    </div>
  );
}
