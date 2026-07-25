import React from 'react';

export function Greeting() {
  const hour = new Date().getHours();
  let greeting = '';

  if (hour >= 0 && hour < 12) {
    greeting = 'Me ma wo akye (Good morning)';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Me ma wo aha (Good afternoon)';
  } else {
    greeting = 'Me ma wo adwo (Good evening)';
  }

  return (
    <div className="bg-zinc-100 text-center py-4 mb-8 rounded-2xl">
      <p className="text-lg font-medium text-zinc-700">{greeting}, welcome to yateteso!</p>
    </div>
  );
}
