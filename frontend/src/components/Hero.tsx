
const Hero = () => {
  return (
    <section 
      className="relative bg-cover bg-center text-white py-20 md:py-32" 
      style={{ backgroundImage: `url('https://ocohjxbhun.ufs.sh/f/tusHOP3SRakyc8FLA65voD3SOBrVwQq1d6LJjy9GW8T5bnHF')` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Instant Gifts, Lasting Smiles
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          The fastest way to buy digital codes for yourself. Purchase keys for top games and services and get them delivered instantly to your inbox.
        </p>
        <a 
          href="/gift-cards" 
          className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-lg"
        >
          Browse Gift Cards
        </a>
      </div>
    </section>
  );
};

export default Hero;