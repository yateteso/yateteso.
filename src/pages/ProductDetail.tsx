import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { ArrowLeft, Check, Heart, ShoppingBag } from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          
          // Save category to recent categories
          try {
            const recentStr = localStorage.getItem('recentCategories');
            let recent: string[] = recentStr ? JSON.parse(recentStr) : [];
            recent = [data.category, ...recent.filter(c => c !== data.category)].slice(0, 3);
            localStorage.setItem('recentCategories', JSON.stringify(recent));
          } catch (e) {
            console.error('Error saving recent categories:', e);
          }
          
          // Pre-select first option for each variant
          const initialVariants: Record<string, string> = {};
          data.variants?.forEach(v => {
            if (v.options.length > 0) {
              initialVariants[v.name] = v.options[0];
            }
          });
          setSelectedVariants(initialVariants);
        }

        // Fetch reviews
        const q = query(collection(db, 'reviews'), where('productId', '==', id));
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(reviewsData);

      } catch (error) {
        console.error('Error fetching product or reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview = {
        productId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([{ id: docRef.id, ...newReview } as Review, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      productId: product.id,
      quantity,
      selectedVariants
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-24 text-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-zinc-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
      </button>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Product Image */}
        <div className="w-full md:w-1/2 bg-zinc-100 rounded-3xl p-12 flex items-center justify-center">
          <img 
            referrerPolicy="no-referrer"
            src={product.imageUrl || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'} 
            alt={product.name} 
            className="w-full h-auto object-contain mix-blend-multiply drop-shadow-2xl"
          />
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="mb-2 text-sm font-bold tracking-widest text-zinc-400 uppercase">{product.category}</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
          <div className="text-3xl font-light mb-6">{formatPrice(product.price)}</div>
          
          <p className="text-zinc-600 mb-8 text-lg leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants?.map((variant, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{variant.name}</h3>
              <div className="flex flex-wrap gap-3">
                {variant.options.map(option => (
                  <button
                    key={option}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedVariants[variant.name] === option
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-zinc-100">
            <div className="flex items-center border border-zinc-200 rounded-xl bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-zinc-500 hover:text-black transition-colors"
              >-</button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-zinc-500 hover:text-black transition-colors"
              >+</button>
            </div>
            
            <Button 
              size="lg" 
              className="flex-1 rounded-xl h-12 text-base font-bold shadow-lg shadow-black/10 transition-all hover:shadow-black/20"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {added ? (
                <><Check className="mr-2 h-5 w-5" /> Added to Cart</>
              ) : (
                <><ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart</>
              )}
            </Button>
            
            {currentUser && (
              <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {product.stock <= 0 && (
            <p className="text-red-500 text-sm mt-4 font-medium">Out of stock</p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 max-w-4xl">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Customer Reviews</h2>
        
        {/* Write a Review */}
        {currentUser ? (
          <div className="bg-white rounded-2xl p-8 border border-zinc-200 mb-12">
            <h3 className="text-lg font-bold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                        reviewRating >= star 
                          ? 'bg-black text-white' 
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 resize-y"
                  placeholder="Share your thoughts about this product..."
                />
              </div>
              <Button type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200 mb-12 text-center">
            <p className="text-zinc-600 mb-4">Please log in to leave a review.</p>
            <Button onClick={() => navigate('/login')} variant="outline">Log In to Review</Button>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 border border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 uppercase">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{review.userName}</div>
                      <div className="text-sm text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`text-sm ${review.rating >= star ? 'text-black font-bold' : 'text-zinc-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-zinc-700">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-zinc-500 italic">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
    </div>
  );
}
