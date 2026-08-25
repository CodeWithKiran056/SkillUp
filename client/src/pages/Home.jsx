import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import WhyChoose from "../components/WhyChoose";
import HowItWorks from "../components/HowItWorks";
import DashboardPreview from "../components/DashboardPreview";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white">
      <Navbar />

      <Hero />

      <About />

      <WhyChoose />

      <HowItWorks />

      <DashboardPreview />

      <CTA />

      <Footer />
    </main>
  );
}

export default Home;