import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Smartphone, Laptop } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { currentUser, userProfile } = useAuth();
  const userName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black text-white pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550009158-9ebf6d1736eb?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl">
            Welcome to yateteso.
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10">
            Our shop is always open. Discover premium laptops and phones designed for those who demand the best in performance, design, and innovation.
          </p>
          <div className="flex gap-4">
            <Link to="/products">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200">
                Shop Now
              </Button>
            </Link>
            <Link to="/products?category=Laptops">
              <Button size="lg" variant="outline" className="border-zinc-700 text-black hover:bg-white/10 hover:text-white">
                View Laptops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/products?category=Phones" className="group relative overflow-hidden rounded-2xl aspect-[16/9] bg-zinc-100 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80" alt="Phones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="relative z-20 flex flex-col items-center text-white mt-auto w-full text-left p-6">
              <Smartphone className="h-10 w-10 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Smartphones</h3>
              <p className="text-zinc-200 mb-4">Capture the moment with pro-grade cameras.</p>
              <span className="flex items-center text-sm font-medium">Browse Phones <ArrowRight className="ml-2 h-4 w-4" /></span>
            </div>
          </Link>
          
          <Link to="/products?category=Laptops" className="group relative overflow-hidden rounded-2xl aspect-[16/9] bg-zinc-100 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80" alt="Laptops" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="relative z-20 flex flex-col items-center text-white mt-auto w-full text-left p-6">
              <Laptop className="h-10 w-10 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Laptops</h3>
              <p className="text-zinc-200 mb-4">Power your workflow with next-gen processors.</p>
              <span className="flex items-center text-sm font-medium">Browse Laptops <ArrowRight className="ml-2 h-4 w-4" /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Promo */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="bg-zinc-900 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden relative">
            <div className="z-10 max-w-lg mb-8 md:mb-0">
               <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Yateteso Pro Series</h2>
               <p className="text-zinc-400 text-lg mb-8">Experience raw power and refined elegance. The new Pro Series redefines what's possible in mobile computing.</p>
               <Link to="/products">
                 <Button className="bg-white text-black hover:bg-zinc-200">Pre-order Now</Button>
               </Link>
            </div>
            <div className="z-10 w-full md:w-1/2 flex justify-center">
               <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600" alt="Pro Series" className="rounded-xl shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500 max-w-[250px] md:max-w-md" />
            </div>
         </div>
      </section>
    </div>
  );
}
