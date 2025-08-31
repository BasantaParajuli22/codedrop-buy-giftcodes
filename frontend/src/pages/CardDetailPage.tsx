import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // 1. Add state for quantity
  const [quantity, setQuantity] = useState(1);

  const { user } = useAuth();
  const navigate = useNavigate();

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
  
  const handleBuyNow = async () => {
    if (!user) {
        setError("Please sign in to complete your purchase."); 
        setTimeout(() => navigate('/login'), 2000);
        return;
    }
    
    // Ensure the requested quantity is not more than stock before proceeding
    if (product && quantity > product.stock) {
        setError("The requested quantity exceeds the available stock.");
        return;
    }
    
    setIsRedirecting(true);
    setError(null);

    try {
      // 2. Pass the selected quantity to the backend
      const response = await axios.post('http://localhost:5000/api/checkout/create-session', 
        {
          productId: product?.id,
          quantity: quantity, // Use the quantity from state
        }, 
        {
          withCredentials: true,
        }
      );

      const { url, success, message } = response.data;
      if (success && url) {
        window.location.href = url;
      } else {
        setError(message || "Could not proceed to checkout.");
        setIsRedirecting(false);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to create checkout session:", err);
      const errorMessage = err.response?.data?.message || "An unexpected error occurred. Please try again later.";
      setError(errorMessage);
      setIsRedirecting(false);
    }
  };

  // 3. Handlers to update the quantity
  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    // Clamp the value between 1 and the available stock
    const value = Math.max(1, Math.min(newQuantity, product.stock));
    setQuantity(value);
  };

  if (loading) return <LoadingSpinner />;
  // Display a more specific error if there is an error message
  if (error && !product) return <p className="text-center text-red-500 text-lg py-10">{error}</p>;
  if (!product) return <p className="text-center text-gray-500 py-10">Product not found.</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/gift-cards" className="text-indigo-600 hover:text-indigo-800 font-semibold">
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
          
          {/* Display any checkout-related errors here */}
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}

          <div className="mt-8">
            {/* 4. Add the quantity selector UI */}
            {product.stock > 0 && (
                <div className="mb-6">
                    <label htmlFor="quantity" className="block text-lg font-medium text-gray-800 mb-2">
                        Quantity
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg" style={{ maxWidth: '150px' }}>
                        <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="px-4 py-2 text-xl font-semibold text-gray-600 bg-gray-100 rounded-l-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={quantity}
                            readOnly // Make input read-only to force usage of buttons
                            className="w-full text-center font-semibold text-gray-800 border-x border-gray-300 focus:outline-none focus:ring-0"
                            aria-label="Product quantity"
                        />
                        <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="px-4 py-2 text-xl font-semibold text-gray-600 bg-gray-100 rounded-r-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{product.stock} cards in stock</p>
                </div>
            )}

            <button 
              onClick={handleBuyNow}
              disabled={isRedirecting || product.stock === 0}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {/* 5. Update button text based on stock and state */}
              {product.stock === 0 ? 'Out of Stock' : (isRedirecting ? 'Redirecting to payment...' : 'Buy Now')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;