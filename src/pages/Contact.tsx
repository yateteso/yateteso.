import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Greeting } from '../components/Greeting';

export function Contact() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <Greeting />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-zinc-500">We'd love to hear from you. Please fill out the form below or reach out directly.</p>
        <p className="text-lg font-bold text-zinc-800 mt-4">Call or WhatsApp: +233557873784</p>
      </div>
      
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-zinc-200 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input type="email" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea 
              className="flex min-h-[150px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 resize-y"
              required
            ></textarea>
          </div>
          <Button type="submit" size="lg" className="w-full">Send Message</Button>
        </form>
      </div>
    </div>
  );
}
