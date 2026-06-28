import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, DownloadCloud, Star } from 'lucide-react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function PricingPage() {
  const { user, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedPlanForConfirmation, setSelectedPlanForConfirmation] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.get('/plans');
        if (res.data.success) {
          setPlans(res.data.data.filter(p => p.isActive));
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePaymentClick = (plan) => {
    if (!user) {
      window.alert('Please login to purchase a plan.');
      navigate('/login');
      return;
    }
    setSelectedPlanForConfirmation(plan);
  };

  const processPayment = async (plan) => {
    setSelectedPlanForConfirmation(null);
    setProcessingId(plan._id);
    try {
      // 1. Create order
      const orderRes = await API.post('/payments/create-order', { planId: plan._id });
      if (!orderRes.data.success) throw new Error('Order creation failed');
      
      const { data: orderData, key } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Policybhandar',
        description: `Upgrade to ${plan.name}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await API.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id
            });

            if (verifyRes.data.success) {
              await fetchUser(); // refresh user data to get new activePlan
              window.alert('Payment Successful! Your plan is upgraded.');
              navigate('/category/all');
            }
          } catch (err) {
            console.error('Verification error:', err);
            window.alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile || '9999999999'
        },
        theme: {
          color: '#f97316'
        }
      };

      if (!window.Razorpay) {
        window.alert('Payment gateway failed to load. Please check your internet connection or disable AdBlocker.');
        return;
      }

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        console.error(response.error);
        window.alert('Payment Failed: ' + response.error.description);
      });
      rzp1.open();

    } catch (err) {
      console.error('Payment error:', err);
      window.alert('Could not initiate payment. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden z-0 bg-slate-50">
      
      {/* Light Premium Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-400/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto text-center space-y-5 mb-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200 text-xs font-bold text-orange-600 mb-2 shadow-sm shadow-orange-500/10">
          <Zap size={14} className="text-orange-500" fill="currentColor" /> Simple, Transparent Pricing
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Choose Your <span className="text-gradient font-black">Superpower</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg md:text-xl font-medium">
          Unlock premium marketing materials, exclusive categories, and unlimited downloads to supercharge your insurance agency.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 items-center relative z-10">
        {plans.map((plan, index) => {
          const isPopular = index === 1 || plan.price > 1000;
          return (
            <div 
              key={plan._id} 
              className={`relative rounded-[2.5rem] p-8 sm:p-10 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 ${
                isPopular 
                  ? 'bg-white shadow-[0_20px_50px_-12px_rgba(234,88,12,0.15)] border-2 border-orange-200 scale-100 lg:scale-105 z-10' 
                  : 'bg-white shadow-xl shadow-slate-200/50 border border-slate-200 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100'
              }`}
            >
              {isPopular && (
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent rounded-[2.5rem] pointer-events-none"></div>
              )}

              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-premium text-white px-6 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg shadow-orange-500/30 uppercase tracking-widest z-20">
                  <Star size={12} fill="currentColor" /> Most Popular
                </div>
              )}

              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-wide">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-slate-900">₹{plan.price}</span>
                  <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">/ {plan.validityDays} Days</span>
                </div>
              </div>

              <div className="space-y-6 flex-grow mb-10 relative z-10">
                <div className={`flex items-center gap-3 text-sm font-bold p-4 rounded-2xl border ${isPopular ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                  <DownloadCloud className={isPopular ? 'text-orange-500' : 'text-slate-500'} size={20} />
                  {plan.dailyDownloadLimit === -1 ? 'Unlimited Daily Downloads' : `${plan.dailyDownloadLimit} Downloads per day`}
                </div>
                
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                        <Check className="text-emerald-600" size={12} strokeWidth={3} />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {(plan.allowedCategories.length > 0 || plan.allowedSubcategories.length > 0 || plan.allowedTrainingCategories?.length > 0) && (
                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Premium Access Unlocked:</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.allowedCategories.map(cat => (
                        <span key={cat._id} className="text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-xl">
                          {cat.name}
                        </span>
                      ))}
                      {plan.allowedSubcategories.map(sub => (
                         <span key={sub._id} className="text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1.5 rounded-xl">
                         {sub.name}
                       </span>
                      ))}
                      {plan.allowedTrainingCategories?.map(train => (
                         <span key={train._id} className="text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                         <span className="text-[10px]">▶</span> {train.name}
                       </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handlePaymentClick(plan)}
                disabled={processingId === plan._id}
                className={`relative z-10 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isPopular 
                  ? 'bg-gradient-premium hover:bg-gradient-premium-hover text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02]' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              } disabled:opacity-70 disabled:scale-100`}>
                <span className="relative z-10 flex items-center gap-2">
                  {processingId === plan._id ? (
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Zap size={16} className={isPopular ? "text-amber-300" : "text-slate-500"} fill={isPopular ? "currentColor" : "none"} />
                  )}
                  {processingId === plan._id ? 'Processing...' : 'Get Started Now'}
                </span>
              </button>
            </div>
          );
        })}

        {plans.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 text-slate-500">
            No pricing plans available at the moment. Please check back later.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedPlanForConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setSelectedPlanForConfirmation(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-6 text-center">Confirm Payment</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Plan Price:</span>
                <span>₹{selectedPlanForConfirmation.price}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-100">
                <span>GST (18%):</span>
                <span>₹{Math.round(selectedPlanForConfirmation.price * 0.18)}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900">
                <span>Total Amount:</span>
                <span>₹{Math.round(selectedPlanForConfirmation.price * 1.18)}</span>
              </div>
            </div>

            <button 
              onClick={() => processPayment(selectedPlanForConfirmation)}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white bg-gradient-premium hover:bg-gradient-premium-hover shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
