const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        {/* Brand and Description Column */}
        <div>
          <h3 className="text-lg font-bold mb-4">CodeDrop -Buy Gift Codes</h3>
          <p className="text-gray-400">Instantly send digital gift codes for games and more.</p>
        </div>

        {/* Links Column */}
        <div className="md:justify-self-end">
          <h4 className="font-semibold mb-4">Support & Legal</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white">Contact Support</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-6 py-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} CodeDrop. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;