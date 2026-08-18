import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TemplateCard from './components/TemplateCard';
import PersonalizationForm from './components/PersonalizationForm';
import OrderReview from './components/OrderReview';
import PaymentModal from './components/PaymentModal';
import ProcessingStatus from './components/ProcessingStatus';
import VideoReady from './components/VideoReady';
import { fetchTemplates, createOrder, verifyPayment } from './services/api';
import { Film, Sparkles, Zap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('GALLERY'); // GALLERY, PERSONALIZE, REVIEW, PAYMENT_MODAL, PROCESSING, READY

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customerData, setCustomerData] = useState({});
  const [currentOrder, setCurrentOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates()
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load templates:', err);
        setError('Failed to connect to backend server. Make sure server is running.');
        setLoading(false);
      });
  }, []);

  const handleSelectTemplate = (template) => {
    if (template.status !== 'ACTIVE') return;
    setSelectedTemplate(template);
    setStep('PERSONALIZE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePersonalizationSubmit = (data) => {
    setCustomerData(data);
    setStep('REVIEW');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = async (confirmed) => {
    const orderData = await createOrder(selectedTemplate.template_id, customerData, confirmed);
    setCurrentOrder(orderData);
    setStep('PAYMENT_MODAL');
  };

  const handlePaymentComplete = async (orderId, paymentId) => {
    const verifiedOrder = await verifyPayment(orderId, paymentId);
    setStep('PROCESSING');
  };

  const handleVideoReady = (orderData) => {
    setCurrentOrder(orderData);
    setStep('READY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setCustomerData({});
    setCurrentOrder(null);
    setStep('GALLERY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 selection:bg-amber-500 selection:text-black">
      <Navbar />

      <main className="flex-grow">
        {step === 'GALLERY' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500/10">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-gray-950 to-gray-950 pointer-events-none" />
              <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Personalized Festival Invitation Platform
                </span>

                <h1 className="font-cinzel text-4xl sm:text-6xl font-extrabold tracking-tight gold-gradient-text leading-tight">
                  Create Your Cinematic Ganesh Invitation Video
                </h1>

                <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Select a template, enter your event details, confirm, and automatically receive a high-resolution 4K vertical MP4 video for your celebration.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#templates"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Browse Templates</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Trust Metrics */}
                <div className="pt-10 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center border-t border-gray-800/80 text-xs">
                  <div>
                    <span className="font-cinzel text-xl font-bold text-amber-400 block">4K HD</span>
                    <span className="text-gray-500">2160x3840 Output</span>
                  </div>
                  <div>
                    <span className="font-cinzel text-xl font-bold text-amber-400 block">100% Clean</span>
                    <span className="text-gray-500">Pristine Master Video</span>
                  </div>
                  <div>
                    <span className="font-cinzel text-xl font-bold text-amber-400 block">₹499</span>
                    <span className="text-gray-500">Flat Special Price</span>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 px-4 max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Simple Process</span>
                <h2 className="font-cinzel text-3xl font-bold text-gray-100 mt-1">How It Works</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-bold font-cinzel text-xl flex items-center justify-center mx-auto border border-amber-500/20">1</div>
                  <h3 className="font-cinzel font-bold text-gray-200">Select Template</h3>
                  <p className="text-xs text-gray-400">Choose between Ganesh Aagman or Ganesh Visarjan invitation templates.</p>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-bold font-cinzel text-xl flex items-center justify-center mx-auto border border-amber-500/20">2</div>
                  <h3 className="font-cinzel font-bold text-gray-200">Personalize & Confirm</h3>
                  <p className="text-xs text-gray-400">Enter Mandal Name, Date, Time, and Location. Review & confirm your details.</p>
                </div>

                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 font-bold font-cinzel text-xl flex items-center justify-center mx-auto border border-amber-500/20">3</div>
                  <h3 className="font-cinzel font-bold text-gray-200">Download 4K Video</h3>
                  <p className="text-xs text-gray-400">Pay securely and immediately download your 4K ready-to-share vertical MP4 video.</p>
                </div>
              </div>
            </section>

            {/* Template Gallery Section */}
            <section id="templates" className="py-16 px-4 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Cinematic Collection</span>
                  <h2 className="font-cinzel text-3xl font-bold text-gray-100">Select Invitation Template</h2>
                </div>
                <span className="text-xs text-gray-400">2 Active Templates • 8 Coming Soon</span>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-xs text-gray-400">Loading templates...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {templates.map(template => (
                    <TemplateCard
                      key={template.template_id}
                      template={template}
                      onSelect={handleSelectTemplate}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Step 1: Personalization */}
        {step === 'PERSONALIZE' && selectedTemplate && (
          <section className="py-12 px-4">
            <PersonalizationForm
              template={selectedTemplate}
              initialData={customerData}
              onSubmit={handlePersonalizationSubmit}
              onBack={() => setStep('GALLERY')}
            />
          </section>
        )}

        {/* Step 2: Order Review */}
        {step === 'REVIEW' && selectedTemplate && (
          <section className="py-12 px-4">
            <OrderReview
              template={selectedTemplate}
              customerData={customerData}
              onConfirm={handleConfirmOrder}
              onEdit={() => setStep('PERSONALIZE')}
            />
          </section>
        )}

        {/* Step 3: Payment Checkout Modal */}
        {step === 'PAYMENT_MODAL' && currentOrder && (
          <PaymentModal
            order={currentOrder}
            onPaymentComplete={handlePaymentComplete}
            onClose={() => setStep('REVIEW')}
          />
        )}

        {/* Step 4: Render Processing Status */}
        {step === 'PROCESSING' && currentOrder && (
          <section className="py-12 px-4">
            <ProcessingStatus
              orderId={currentOrder.order_id}
              onReady={handleVideoReady}
            />
          </section>
        )}

        {/* Step 5: Final Video Ready & Download */}
        {step === 'READY' && currentOrder && (
          <section className="py-12 px-4">
            <VideoReady
              order={currentOrder}
              onReset={handleReset}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
