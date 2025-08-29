import { Zap, ShieldCheck, Gift } from 'lucide-react';

const WhyChooseUs = () => {
    const features = [
        {
            icon: <Zap className="h-10 w-10 text-white" />,
            title: "Instant Delivery",
            description: "No more waiting. Gifts are delivered instantly via email or text."
        },
        {
            icon: <ShieldCheck className="h-10 w-10 text-white" />,
            title: "Secure Payments",
            description: "Your transactions are safe with our industry-leading encryption."
        },
        {
            icon: <Gift className="h-10 w-10 text-white" />,
            title: "Wide Selection",
            description: "From retail to restaurants, find the perfect card for any occasion."
        }
    ];

    return (
        <section className="bg-indigo-700 text-white py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold mb-4">Why Choose Giftly?</h2>
                     <p className="text-indigo-200 max-w-2xl mx-auto">We provide a seamless, secure, and delightful gifting experience from start to finish.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-indigo-600 p-8 rounded-lg text-center shadow-lg">
                            <div className="flex justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-indigo-200">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default WhyChooseUs; 