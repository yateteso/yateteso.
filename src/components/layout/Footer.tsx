import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white pt-12 pb-8 mt-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold tracking-tighter mb-4">yateteso.</h3>
            <p className="text-zinc-500 text-sm">Premium electronics for the modern world. Laptops, phones, and more.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/products?category=Phones" className="hover:text-black">Phones (iPhone, Samsung)</Link></li>
              <li><Link to="/products?category=Laptops" className="hover:text-black">Laptops (HP, Dell)</Link></li>
              <li><Link to="/products?category=Phone Accessories" className="hover:text-black">Phone Accessories</Link></li>
              <li><Link to="/products?category=Laptop Accessories" className="hover:text-black">Laptop Accessories</Link></li>
              <li><Link to="/products" className="hover:text-black">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/contact" className="hover:text-black">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-black">FAQ</Link></li>
              <li><Link to="/delivery" className="hover:text-black">Delivery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><Link to="/terms" className="hover:text-black">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-black">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-100 pt-8 flex justify-between items-center flex-col sm:flex-row text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} yateteso. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
