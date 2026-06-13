import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'user-accounts', title: '2. User Accounts' },
  { id: 'projects', title: '3. Projects & Milestones' },
  { id: 'payments', title: '4. Payments & Fees' },
  { id: 'disputes', title: '5. Disputes & Resolution' },
  { id: 'termination', title: '6. Termination' },
];

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const handleScroll = () => {
      let current = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8">
      {/* Sticky ToC Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-24">
          <h2 className="font-display font-bold text-xl mb-4">Contents</h2>
          <nav className="flex flex-col space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-display font-bold mb-4">Terms and Conditions</h1>
          <p className="text-text-muted mb-12">Last updated: June 12, 2026</p>

          <div className="space-y-12 text-text-primary/90 leading-relaxed">
            <section id="introduction" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">Welcome to TaskLance. By accessing or using our platform, you agree to be bound by these Terms and Conditions. TaskLance provides a freelance marketplace connecting clients with talent.</p>
              <p>You must be at least 18 years old to use our services. If you are accepting these terms on behalf of an entity, you represent that you have the authority to do so.</p>
            </section>

            <section id="user-accounts" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-semibold mb-4">2. User Accounts</h2>
              <p className="mb-4">To use certain features, you must register for an account. You agree to provide accurate information and keep it updated. You are responsible for safeguarding your password and for all activities that occur under your account.</p>
            </section>

            <section id="projects" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-semibold mb-4">3. Projects & Milestones</h2>
              <p className="mb-4">Clients may post projects and Freelancers may submit proposals. A contract is formed directly between the Client and Freelancer. TaskLance is not a party to this contract but facilitates the payment via Escrow.</p>
            </section>

            <section id="payments" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-semibold mb-4">4. Payments & Fees</h2>
              <p className="mb-4">Clients are charged upfront for milestones. Funds are held securely and released upon approval of the deliverables. TaskLance deducts a platform fee from the Freelancer's earnings as specified on our Pricing page.</p>
            </section>

            <section id="disputes" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-semibold mb-4">5. Disputes & Resolution</h2>
              <p className="mb-4">In the event of a disagreement, parties must first attempt to resolve it directly. If unresolved, TaskLance offers a dispute resolution service which will make a final, binding decision regarding the release of funds.</p>
            </section>

            <section id="termination" className="scroll-mt-24">
              <h2 className="text-2xl font-display font-semibold mb-4">6. Termination</h2>
              <p className="mb-4">We reserve the right to suspend or terminate your account at any time for violations of these terms, fraud, or abuse of the platform, without prior notice.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
