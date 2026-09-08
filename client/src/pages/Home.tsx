import ContactSection from '@/components/common/ContactSection';
import HeroSection from '@/features/home/components/HeroSection';
import ProductExploreSection from '@/features/home/components/ProductExploreSection';
import BuyingGuidesSection from '@/features/home/components/BuyingGuidesSection';
import AboutSection from '@/features/home/components/AboutSection';

const Home = () => {
    return (
        <div className="bg-[#070913] text-slate-100 min-h-screen">
            <HeroSection />
            <ProductExploreSection />
            <BuyingGuidesSection />
            <AboutSection />
            <ContactSection />
        </div>
    );
};

export default Home;