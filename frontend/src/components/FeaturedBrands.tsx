const FeaturedBrands = () => {
  const brands = [
    'https://via.placeholder.com/150x60?text=Brand+A',
    'https://via.placeholder.com/150x60?text=Brand+B',
    'https://via.placeholder.com/150x60?text=Brand+C',
    'https://via.placeholder.com/150x60?text=Brand+D',
    'https://via.placeholder.com/150x60?text=Brand+E',
    'https://via.placeholder.com/150x60?text=Brand+F',
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop Top Brands</h2>
        <p className="text-gray-600 mb-12">We partner with the brands you know and love.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
          {brands.map((brandUrl, index) => (
            <img 
              key={index}
              src={brandUrl} 
              alt={`Brand ${index + 1}`} 
              className="mx-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;
