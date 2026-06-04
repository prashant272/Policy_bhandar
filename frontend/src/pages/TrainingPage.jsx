import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Play, ShieldAlert, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function TrainingPage() {
  const { user, fetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [plans, setPlans] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const settingsRes = await API.get('/settings');
        if (settingsRes.data.success) {
          setIsPublic(settingsRes.data.data.isTrainingPublic);
        }

        const catRes = await API.get('/trainings/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }

        const trainRes = await API.get('/trainings');
        if (trainRes.data.success) {
          setTrainings(trainRes.data.data);
        }

        const planRes = await API.get('/plans');
        if (planRes.data.success) {
          // Filter plans that actually give training access (not Free)
          const validPlans = planRes.data.data.filter(p => p.name !== 'Free' && p.isActive);
          setPlans(validPlans);
        }
      } catch (err) {
        console.error('Error fetching training data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasAccessToCategory = (catId) => {
    if (isPublic) return true; // Allow if Global Access is ON
    if (!user || !user.activePlan) return false;
    
    const plan = user.activePlan;
    // Strictly block 'Free' plan from accessing training videos
    if (plan.name === 'Free') return false;
    
    const allowed = plan.allowedTrainingCategories || [];
    return allowed.some(c => c === catId || c._id === catId);
  };

  const accessibleCategories = categories.filter(cat => hasAccessToCategory(cat._id));
  const accessibleTrainings = trainings.filter(t => t.categoryId && hasAccessToCategory(t.categoryId._id));

  const filteredTrainings = activeCategory
    ? accessibleTrainings.filter(t => t.categoryId && t.categoryId._id === activeCategory)
    : accessibleTrainings;

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <span className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></span>
      </div>
    );
  }

  const hasAnyAccess = isPublic || (user && user.activePlan && user.activePlan.name !== 'Free' && user.activePlan.allowedTrainingCategories?.length > 0);

  const handlePayment = async (plan) => {
    if (!user) {
      window.alert('Please login to purchase a plan.');
      navigate('/login');
      return;
    }

    setProcessingId(plan._id);
    try {
      const orderRes = await API.post('/payments/create-order', { planId: plan._id });
      if (!orderRes.data.success) throw new Error('Order creation failed');
      
      const { data: orderData, key } = orderRes.data;

      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Policybhandar',
        description: `Upgrade to ${plan.name}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await API.post('/payments/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id
            });

            if (verifyRes.data.success) {
              await fetchUser(); 
              window.alert('Payment Successful! Your plan is upgraded.');
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

  if (!hasAnyAccess) {
    return (
      <div className="relative min-h-screen pt-28 pb-20 px-4 flex flex-col items-center justify-center bg-slate-50">
        <div className="relative z-10 bg-white border border-slate-200 rounded-3xl p-8 md:p-12 max-w-4xl w-full text-center shadow-xl">
          
          <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
             <ShieldAlert size={36} className="text-orange-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Premium Training Locked
          </h2>
          
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto mb-10 font-medium">
            Elevate your insurance agency with our exclusive masterclasses. Upgrade your plan today to unlock high-converting strategies and expert video tutorials.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {plans.map(plan => (
              <div key={plan._id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="mb-6 flex-grow">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{plan.name} Plan</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-orange-500">₹{plan.price}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase">/ {plan.validityDays} Days</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePayment(plan)}
                  disabled={processingId === plan._id}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 py-3 rounded-xl font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 cursor-pointer"
                >
                  {processingId === plan._id ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Zap size={16} className="text-white" fill="currentColor" />
                  )}
                  <span className="tracking-wide">{processingId === plan._id ? 'Processing...' : `Upgrade to ${plan.name}`}</span>
                </button>
              </div>
            ))}
          </div>

          {!user && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-600">
                Already have a premium plan?{' '}
                <Link to="/login" className="text-orange-500 font-bold hover:underline">
                  Log in securely
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">
            <Play size={14} className="text-orange-500" fill="currentColor" /> Exclusive Content
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Agent Training Hub
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg font-medium">
            Enhance your skills with our curated video training sessions. Learn proven strategies to grow your agency and dominate the market.
          </p>
        </div>

        {/* Category Tabs */}
        {accessibleCategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                activeCategory === '' 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              All Modules
            </button>
            {accessibleCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                  activeCategory === cat._id 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Video Grid */}
        {filteredTrainings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrainings.map(training => (
              <div key={training._id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                
                {/* YouTube Embed Container */}
                <div className="relative aspect-video w-full bg-slate-100">
                  <iframe 
                    src={`https://www.youtube.com/embed/${training.youtubeVideoId}?rel=0&modestbranding=1&showinfo=0`}
                    title={training.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                </div>

                {/* Info Body */}
                <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-orange-50 text-[10px] text-orange-600 font-bold uppercase tracking-wide mb-3 border border-orange-100">
                      {training.categoryId?.name || 'General'}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                      {training.title}
                    </h3>
                    {training.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2 font-medium">
                        {training.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Play size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Modules Found</h3>
            <p className="text-slate-600 font-medium max-w-md mx-auto">There are currently no training videos available in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
}
