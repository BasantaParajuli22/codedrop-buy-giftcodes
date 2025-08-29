import { Search, PenSquare, Send } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-12 w-12 text-indigo-600" />,
      title: 'Choose a Card',
      description: 'Find the perfect gift card from our extensive collection of top brands.'
    },
    {
      icon: <PenSquare className="h-12 w-12 text-indigo-600" />,
      title: 'Personalize It',
      description: 'Add your own message and choose a design to make it special.'
    },
    {
      icon: <Send className="h-12 w-12 text-indigo-600" />,
      title: 'Send Instantly',
      description: 'Deliver it via email or text, scheduled for the perfect moment.'
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Sending the perfect gift has never been easier. Follow these three simple steps.</p>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-indigo-100 p-6 rounded-full mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;