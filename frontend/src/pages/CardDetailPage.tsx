import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth hook

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);

const CardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false); // 2. State for button loading

  const { user } = useAuth(); // 3. Get user from auth context
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/product/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Gift card not found.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  // 4. Implement the Buy Now handler function
  const handleBuyNow = async () => {
    if (!user) {
        // You could also set an error message to prompt login
        setError("Please sign in to complete your purchase."); 
        setTimeout(() => navigate('/login'), 2000); // Give user time to read
        return;
    }
    
    setIsRedirecting(true);
    setError(null); // Clear previous errors

    try {
        const response = await axios.post('http://localhost:5000/api/checkout/create-session', 
            {
                productId: product?.id,
                quantity: 1,
            }, 
            {
                withCredentials: true,
            }
        );

        const { url, success, message } = response.data;
        if (success && url) {
            window.location.href = url;
        } else {
            // Set error from backend if available
            setError(message || "Could not proceed to checkout.");
            setIsRedirecting(false);
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Failed to create checkout session:", err);
        // Set error from caught exception
        const errorMessage = err.response?.data?.message || "An unexpected error occurred. Please try again later.";
        setError(errorMessage);
        setIsRedirecting(false); // Re-enable the button on failure
    }
};


  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-500 text-lg py-10">{error}</p>;
  if (!product) return <p className="text-center text-gray-500 py-10">Product not found.</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/cards" className="text-indigo-600 hover:text-indigo-800 font-semibold">
          &larr; Back to All Cards
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src={product.imageUrl || 'https://via.placeholder.com/800x600'}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-indigo-600">${product.price}</p>
          <p className="mt-6 text-gray-700 leading-relaxed">{product.description}</p>

          <div className="mt-8">
            {/* 5. Update the button */}
            <button 
              onClick={handleBuyNow}
              disabled={isRedirecting || product.stock === 0} // Disable if redirecting or out of stock
              className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : (isRedirecting ? 'Redirecting to payment...' : 'Buy Now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;