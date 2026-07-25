import React from 'react';
import { Greeting } from '../components/Greeting';

export function FAQ() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <Greeting />
      <h1 className="text-4xl font-bold tracking-tight mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2">How can I place an order?</h3>
          <p className="text-zinc-600">Simply browse our products, add them to your cart, and proceed to checkout. For any assistance, contact us at +233557873784.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2">What payment methods do you accept?</h3>
          <p className="text-zinc-600">We currently collect your details to process payments manually or via local mobile money solutions. We will guide you during checkout.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2">How do I contact customer service?</h3>
          <p className="text-zinc-600">You can easily reach us via Call or WhatsApp at <strong>+233557873784</strong>.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2">Do you deliver nationwide?</h3>
          <p className="text-zinc-600">Yes, we provide delivery services across the region. Check our Delivery page for more info.</p>
        </div>
      </div>
    </div>
  );
}
