"use client";

import { useState, useEffect } from "react";

// Icons
const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const XIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

// Feature icons
const ShieldIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChatIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Header Component
function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-dark/95 backdrop-blur-sm border-b border-white/10 header-texture' : 'bg-transparent border-b border-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-white font-bold text-xl">Recall</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
                        <a href="#industries" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Industries</a>
                        <a href="#security" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Security</a>
                        <a href="#faq" className="text-white/80 hover:text-white transition-colors text-sm font-medium">FAQ</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <a href="/login" className="border border-white/30 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors">Try Recall</a>
                    </div>

                    <button
                        type="button"
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <nav className="flex flex-col gap-4">
                            <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
                            <a href="#industries" className="text-white/80 hover:text-white transition-colors">Industries</a>
                            <a href="#security" className="text-white/80 hover:text-white transition-colors">Security</a>
                            <a href="#faq" className="text-white/80 hover:text-white transition-colors">FAQ</a>
                            <a href="/login" className="border border-white/30 text-white text-center px-5 py-2 rounded-md text-sm font-medium mt-2">Try Recall</a>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

// Hero Section
function HeroSection() {
    return (
        <section className="relative min-h-screen bg-gradient-wave pt-24 pb-16 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-coral/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-navy-light/50 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-left">
                        <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">
                            AI Knowledge Assistant
                        </p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight mb-6">
                            Your Organization's Knowledge,{" "}
                            <span className="text-coral italic">Instantly</span> Accessible
                        </h1>
                        <p className="text-lg text-white/70 mb-8 max-w-xl">
                            With Secure, Private, and Accurate{" "}
                            <span className="text-coral">RAG-Powered AI</span> at Scale.
                            Trusted by Law Firms, Healthcare Providers, and Enterprise Organizations.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="#demo" className="btn-coral inline-flex items-center gap-2">
                                Schedule Your Demo
                                <ArrowRightIcon />
                            </a>
                            <a href="#features" className="btn-outline-light inline-flex items-center gap-2">
                                Explore Features
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-navy-medium/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 shadow-2xl">
                            <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe
                                    src="https://www.loom.com/embed/9a3ad794db784f98bdf30a6945054385"
                                    frameBorder="0"
                                    allowFullScreen
                                    className="w-full h-full"
                                    title="Recall Demo Video"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Problem Section
function ProblemSection() {
    const problems = [
        "Your legal team wastes hours searching for precedent cases",
        "Healthcare providers delay treatment while locating patient histories",
        "New restaurant staff struggle to find the right recipe or procedure",
        "Support teams put customers on hold while hunting for product manuals",
        "Critical information sits locked away when it's needed most urgently",
    ];

    return (
        <section className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">The Problem</p>
                    <h2 className="text-3xl sm:text-4xl font-light text-navy-dark mb-6">Stop Searching. Start Finding.</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Your organization has accumulated years of valuable knowledge: case files, medical records,
                        training manuals, product documentation, policy guidelines. It's all there—buried in hundreds
                        or thousands of documents.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {problems.map((problem, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-500 font-bold text-sm">!</span>
                                </div>
                                <p className="text-gray-700">{problem}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-navy-dark rounded-2xl p-8 text-center">
                    <p className="text-white/80 text-lg mb-4">
                        <strong className="text-coral">The cost?</strong> Lost billable hours. Delayed patient care.
                        Inconsistent service. Frustrated customers. Burned-out employees.
                    </p>
                    <p className="text-xl text-white font-medium">
                        What if every answer your team needs was just one question away?
                    </p>
                </div>
            </div>
        </section>
    );
}

// Features Section
function FeaturesSection() {
    const features = [
        {
            icon: <ShieldIcon />,
            title: "90% Reduction in AI Hallucinations",
            description: "Our RAG-powered system eliminates 70-90% of factual errors by grounding every answer in your verified, internal knowledge base.",
            highlight: "Every response is based on your actual documents, policies, and records.",
        },
        {
            icon: <DocumentIcon />,
            title: "Verifiable Answers with Source Citations",
            description: "Every answer includes clickable source citations. Your team can instantly verify which specific document, page, or section the AI used.",
            highlight: "Meet regulatory compliance requirements with full audit trails.",
        },
        {
            icon: <LockIcon />,
            title: "Role-Based Security You Can Trust",
            description: "Intelligently controls who can access what information based on their role and clearance level.",
            highlight: "Granular permissions ensure sensitive data stays protected.",
        },
        {
            icon: <ClockIcon />,
            title: "Massive Cost Savings",
            description: "Simply update the index—no expensive retraining needed. Save 10-30% on maintenance costs while keeping information current.",
            highlight: "Reduce information search time by 45-65%.",
        },
    ];

    return (
        <section id="features" className="py-20 bg-gradient-wave">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">Why RAG Technology</p>
                    <h2 className="text-3xl sm:text-4xl font-light text-white mb-6">Why RAG Technology Changes Everything</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-navy-medium/50 backdrop-blur-sm rounded-xl border border-white/10 p-8 card-hover">
                            <div className="text-coral mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-medium text-white mb-3">{feature.title}</h3>
                            <p className="text-white/70 mb-4">{feature.description}</p>
                            <p className="text-coral text-sm font-medium">{feature.highlight}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Industries Section
function IndustriesSection() {
    const industries = [
        {
            title: "Law Firms",
            image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            description: "Transform decades of case files into instant precedent research.",
            advantage: "Every legal reference includes the exact source document and page number.",
        },
        {
            title: "Healthcare Providers",
            image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
            description: "Patient records, treatment protocols, and clinical research at your fingertips.",
            advantage: "Summarize the latest treatment guidelines in real-time with full provenance.",
        },
        {
            title: "Multi-Location Restaurants",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
            description: "Standardize training across all locations. New staff access recipes, plating guides, health protocols, and procedures instantly.",
            advantage: "Every recipe and procedure links back to your approved documentation.",
        },
        {
            title: "Rehabilitation Centers",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
            description: "Provide patients with 24/7 access to their personalized recovery guidance and progress tracking.",
            advantage: "Patients get answers based on their specific care plan, not generic advice.",
        },
        {
            title: "Manufacturing & Product Support",
            image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80",
            description: "Give technicians instant access to technical machine manuals and maintenance logs right on the factory floor.",
            advantage: "Technicians get the exact manual section with diagrams and specifications.",
        },
    ];

    return (
        <section id="industries" className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">Industries</p>
                    <h2 className="text-3xl sm:text-4xl font-light text-navy-dark mb-6">Built for Industries Where Every Second Counts</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {industries.map((industry, index) => (
                        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 card-hover">
                            <div className="h-48 relative overflow-hidden">
                                <img src={industry.image} alt={industry.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent" />
                                <h3 className="absolute bottom-4 left-4 text-xl font-medium text-white">{industry.title}</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">{industry.description}</p>
                                <div className="flex items-start gap-2">
                                    <CheckIcon />
                                    <p className="text-sm text-coral font-medium">{industry.advantage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Mobile Section
function MobileSection() {
    return (
        <section className="py-20 bg-gradient-wave">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">Mobile First</p>
                        <h2 className="text-3xl sm:text-4xl font-light text-white mb-6">
                            Why Mobile? Because Your Team Isn't Always at a Desk
                        </h2>
                        <p className="text-white/70 mb-8">
                            Knowledge needs to travel with your team. Your custom AI assistant is accessible
                            anytime, anywhere—right in their pocket.
                        </p>
                        <ul className="space-y-4">
                            {["Lawyers meeting clients off-site", "Healthcare providers moving between patient rooms", "Restaurant staff on the kitchen floor", "Technicians in the field"].map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-white/80">
                                    <CheckIcon />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-64 h-[500px] bg-navy-medium rounded-[3rem] border-4 border-white/20 p-4 shadow-2xl">
                            <div className="w-full h-full bg-navy-dark rounded-[2.5rem] overflow-hidden">
                                <div className="p-6 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center">
                                            <ChatIcon />
                                        </div>
                                        <span className="text-white font-medium">Recall</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-navy-light/50 rounded-lg p-3">
                                            <p className="text-white/70 text-sm">What's the dosage for patient #4521?</p>
                                        </div>
                                        <div className="bg-coral/20 rounded-lg p-3 ml-8">
                                            <p className="text-white text-sm">Based on patient records, the prescribed dosage is 50mg twice daily.</p>
                                            <p className="text-coral text-xs mt-2">Source: Patient Record #4521, p.3</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-navy-light/30 rounded-full p-3 flex items-center gap-2">
                                        <SearchIcon />
                                        <span className="text-white/50 text-sm">Ask anything...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Security Section
function SecuritySection() {
    const securityFeatures = [
        { category: "Access Control", items: ["Only registered users from your organization can access", "Role-based permissions ensure team members only see what they're authorized to view", "Granular control over sensitive information"] },
        { category: "Data Protection", items: ["Your data is isolated and never shared", "No generic knowledge base—your assistant serves only your organization", "Your data never gets used to train public AI models"] },
        { category: "Audit and Compliance", items: ["Complete audit trails show who asked what", "Source citations enable regulatory compliance verification", "Provenance tracking meets documentation requirements"] },
    ];

    return (
        <section id="security" className="py-20 bg-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">Security</p>
                    <h2 className="text-3xl sm:text-4xl font-light text-navy-dark mb-6">Enterprise-Grade Security. Your Data Stays Yours.</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {securityFeatures.map((section, index) => (
                        <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-medium text-navy-dark mb-6 flex items-center gap-3">
                                <LockIcon />
                                {section.category}
                            </h3>
                            <ul className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-3">
                                        <CheckIcon />
                                        <span className="text-gray-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// FAQ Section
function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        { question: "How is this different from ChatGPT?", answer: "Generic AI models generate answers based on patterns, often leading to 'hallucinations.' Our RAG-powered system retrieves answers directly from your verified documents, reducing errors by 70-90%." },
        { question: "How long does implementation take?", answer: "Most organizations are up and running within 2-4 weeks depending on data volume and format." },
        { question: "What types of data can be integrated?", answer: "Documents (PDFs, Word files), spreadsheets, databases, case management systems, electronic health records, knowledge bases, and more." },
        { question: "Is my data secure?", answer: "Absolutely. Your data is encrypted, isolated, never used to train public AI models, and accessible only to users you authorize." },
    ];

    return (
        <section id="faq" className="py-20 bg-cream">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-coral uppercase tracking-widest text-sm font-medium mb-4">FAQ</p>
                    <h2 className="text-3xl sm:text-4xl font-light text-navy-dark mb-6">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <button
                                type="button"
                                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className="text-lg font-medium text-navy-dark">{faq.question}</span>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center transform transition-transform duration-200 ${openIndex === index ? 'rotate-180 bg-coral/20' : ''}`}>
                                    <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-5 border-t border-gray-100">
                                    <p className="text-gray-600 text-base leading-relaxed pt-4">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// CTA Section
function CTASection() {
    return (
        <section id="demo" className="py-20 bg-gradient-wave">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-navy-medium/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
                    <h2 className="text-3xl sm:text-4xl font-light text-white mb-6">
                        Ready to Transform How Your Organization Accesses Knowledge?
                    </h2>
                    <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                        Your competitors are still searching through folders. Your team could be getting instant, verified answers.
                    </p>
                    <a href="https://wa.me/2349162235619" target="_blank" rel="noopener noreferrer" className="btn-coral inline-flex items-center gap-2 text-lg px-8 py-4">
                        Schedule Your Demo
                        <ArrowRightIcon />
                    </a>
                </div>
            </div>
        </section>
    );
}

// Footer
function Footer() {
    return (
        <footer className="bg-navy-dark border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-xl">Recall</span>
                    </div>
                    <p className="text-white/40 text-sm">© 2026 Recall. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

// Main Page Component
export default function Home() {
    return (
        <main className="min-h-screen">
            <Header />
            <HeroSection />
            <ProblemSection />
            <FeaturesSection />
            <IndustriesSection />
            <MobileSection />
            <SecuritySection />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    );
}
