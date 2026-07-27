import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
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
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('direct'); // 'trial' or 'direct'
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedPlanForConfirmation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPlanForConfirmation]);

  useEffect(() => {
    const fetchPlansAndCategories = async () => {
      try {
        const [plansRes, catRes, subcatRes] = await Promise.all([
          API.get('/plans'),
          API.get('/materials/categories'),
          API.get('/materials/subcategories')
        ]);
        if (plansRes.data.success) {
          setPlans(plansRes.data.data.filter(p => p.isActive && p.name !== 'All Free'));
        }
        
        let addonItems = [];
        if (catRes.data.success) {
           addonItems = [...addonItems, ...catRes.data.data.filter(c => c.isLeaderCategory)];
        }
        if (subcatRes.data.success) {
          // Only show Main Subcategories for selection
          addonItems = [...addonItems, ...subcatRes.data.data.filter(s => s.isMainSubcategory)];
        }
        setAvailableCategories(addonItems);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlansAndCategories();
  }, []);

  const handleCategoryToggle = (catId, isLeaderCat, addonPrice) => {
    if (!selectedPlanForConfirmation) return;
    const plan = selectedPlanForConfirmation;
    
    // Check if it's already selected as base or addon
    const isBaseSelected = selectedCategories.includes(catId);
    const isAddonSelected = selectedAddons.includes(catId);
    
    if (isBaseSelected) {
      setSelectedCategories(prev => prev.filter(id => id !== catId));
    } else if (isAddonSelected) {
      setSelectedAddons(prev => prev.filter(id => id !== catId));
    } else {
      // Trying to select a new category
      
      // If it's a leader category and plan doesn't include leader, they can't select it as base, it MUST be an addon.
      if (isLeaderCat && !plan.isLeaderIncluded) {
         setSelectedAddons(prev => [...prev, catId]);
         return;
      }

      if (selectedCategories.length < plan.categoryCount) {
        setSelectedCategories(prev => [...prev, catId]);
      } else {
        // Exceeded base categories, goes to addons
        setSelectedAddons(prev => [...prev, catId]);
      }
    }
  };

  const calculateTotal = () => {
    if (!selectedPlanForConfirmation) return 0;
    let base = selectedPlanForConfirmation.price;
    let addonsTotal = 0;
    selectedAddons.forEach(id => {
      const cat = availableCategories.find(c => c._id === id);
      if (cat) addonsTotal += (cat.addonPrice || 1499);
    });
    
    let subtotal = base + addonsTotal;
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }
      if (discount > subtotal) discount = subtotal;
    }
    
    subtotal = subtotal - discount;
    return Math.round(subtotal * 1.18);
  };
  
  const calculateGST = () => {
    if (!selectedPlanForConfirmation) return 0;
    let base = selectedPlanForConfirmation.price;
    let addonsTotal = 0;
    selectedAddons.forEach(id => {
      const cat = availableCategories.find(c => c._id === id);
      if (cat) addonsTotal += (cat.addonPrice || 1499);
    });
    
    let subtotal = base + addonsTotal;
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }
      if (discount > subtotal) discount = subtotal;
    }
    
    subtotal = subtotal - discount;
    return Math.round(subtotal * 0.18);
  };
  
  const calculateDiscount = () => {
    if (!selectedPlanForConfirmation || !appliedCoupon) return 0;
    let base = selectedPlanForConfirmation.price;
    let addonsTotal = 0;
    selectedAddons.forEach(id => {
      const cat = availableCategories.find(c => c._id === id);
      if (cat) addonsTotal += (cat.addonPrice || 1499);
    });
    
    let subtotal = base + addonsTotal;
    let discount = 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discount = appliedCoupon.discountValue;
    }
    if (discount > subtotal) discount = subtotal;
    return discount;
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponInput) return;
    try {
      const res = await API.post('/payments/validate-coupon', { code: couponInput });
      if (res.data.success) {
        setAppliedCoupon(res.data.data);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.error || 'Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };


  const handlePaymentClick = (plan, mode) => {
    if (!user) {
      window.alert('Please login to purchase a plan.');
      navigate('/login');
      return;
    }
    setSelectedPlanForConfirmation(plan);
    setSelectedPaymentMode(mode);
  };

  const processTrialPayment = async (plan) => {
    if (selectedCategories.length < plan.categoryCount && availableCategories.length >= plan.categoryCount) {
       if(!window.confirm(`You haven't selected all your ${plan.categoryCount} free categories. Proceed anyway?`)) {
           return;
       }
    }

    const finalPlan = selectedPlanForConfirmation;
    const catsToSubmit = selectedCategories;
    const addonsToSubmit = selectedAddons;
    
    setSelectedPlanForConfirmation(null);
    setProcessingId(plan._id);
    try {
      // 1. Create Subscription
      const subRes = await API.post('/payments/create-subscription', { 
        planId: plan._id,
        selectedAddons: addonsToSubmit,
        couponCode: appliedCoupon?.code
      });
      if (!subRes.data.success) throw new Error('Subscription creation failed');
      
      const { data: subData, key } = subRes.data;

      // 2. Open Razorpay Checkout for Autopay
      const options = {
        key: key,
        subscription_id: subData.id,
        name: 'Policybhandar',
        description: `${plan.name} - 15 Days Free Trial`,
        handler: async function (response) {
          try {
            // 3. Verify Subscription
            const verifyRes = await API.post('/payments/verify-subscription', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
              selectedCategories: catsToSubmit,
              selectedAddons: addonsToSubmit,
              couponCode: appliedCoupon?.code
            });

            if (verifyRes.data.success) {
              await fetchUser(); // refresh user data to get new activePlan
              window.alert('Autopay & subscription activated! 15 days free trial started.');
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

  const processDirectPayment = async (plan) => {
    if (selectedCategories.length < plan.categoryCount && availableCategories.length >= plan.categoryCount) {
       if(!window.confirm(`You haven't selected all your ${plan.categoryCount} free categories. Proceed anyway?`)) {
           return;
       }
    }

    const catsToSubmit = selectedCategories;
    const addonsToSubmit = selectedAddons;
    
    setSelectedPlanForConfirmation(null);
    setProcessingId(plan._id);
    try {
      // 1. Create Direct Order
      const orderRes = await API.post('/payments/create-order', { 
        planId: plan._id,
        selectedAddons: addonsToSubmit,
        couponCode: appliedCoupon?.code
      });
      if (!orderRes.data.success) throw new Error('Order creation failed');
      
      const { data: orderData, key } = orderRes.data;

      // 2. Open Razorpay Checkout for Immediate Payment
      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Policybhandar',
        description: `${plan.name} - Buy Now`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id,
              selectedCategories: catsToSubmit,
              selectedAddons: addonsToSubmit,
              couponCode: appliedCoupon?.code
            });

            if (verifyRes.data.success) {
              await fetchUser();
              window.alert('Payment successful! Plan upgraded.');
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
        window.alert('Payment gateway failed to load.');
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

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-16 lg:gap-12 lg:gap-y-20 items-stretch relative z-10">
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

              <div className="flex flex-col gap-3 relative z-10 w-full mt-auto">
                <button 
                  onClick={() => handlePaymentClick(plan, 'trial')}
                  disabled={processingId === plan._id}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer border-2 ${
                    isPopular 
                      ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  } disabled:opacity-70`}
                >
                  <Zap size={14} fill="currentColor" /> Free Trial
                </button>
                
                <button 
                  onClick={() => handlePaymentClick(plan, 'direct')}
                  disabled={processingId === plan._id}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPopular 
                      ? 'bg-gradient-premium hover:bg-gradient-premium-hover text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30' 
                      : 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30'
                  } disabled:opacity-70`}
                >
                  <Zap size={14} fill="currentColor" /> Buy Now
                </button>
              </div>
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
      {selectedPlanForConfirmation && createPortal(
        <div className="fixed inset-0 p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative mt-24 mb-10 h-fit">
            <button 
              onClick={() => {
                setSelectedPlanForConfirmation(null);
                setSelectedCategories([]);
                setSelectedAddons([]);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-slate-900 mb-2 text-center">Customize Your Subscription</h3>
            <p className="text-sm text-slate-500 text-center mb-6">You can select up to {selectedPlanForConfirmation.categoryCount} categories. Additional selections will be charged as add-ons.</p>
            
            <div className="mb-6">
              <h4 className="font-bold text-slate-700 mb-3">Select Categories:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCategories.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-full">No Main Subcategories found. Please configure them in the Admin Panel.</p>
                )}
                {availableCategories.map(cat => {
                   const isBase = selectedCategories.includes(cat._id);
                   const isAddon = selectedAddons.includes(cat._id);
                   const isSelected = isBase || isAddon;
                   
                   return (
                     <div 
                       key={cat._id}
                       onClick={() => handleCategoryToggle(cat._id, cat.isLeaderCategory, cat.addonPrice)}
                       className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                         isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'
                       }`}
                     >
                       <div className="flex justify-between items-center">
                         <span className={`font-bold ${isSelected ? 'text-orange-700' : 'text-slate-700'}`}>{cat.name}</span>
                         {isBase && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Included</span>}
                         {isAddon && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">+₹{cat.addonPrice || 1499}</span>}
                         {!isSelected && cat.isLeaderCategory && <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Leader</span>}
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Have a coupon code?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold uppercase text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
                {!appliedCoupon ? (
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={!couponInput || !!appliedCoupon}
                    className="bg-orange-500 text-white px-5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                ) : (
                  <button 
                    onClick={removeCoupon}
                    className="bg-red-50 text-red-600 px-5 rounded-xl font-bold text-sm hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponError && <p className="text-red-500 text-xs font-bold mt-2">{couponError}</p>}
              {appliedCoupon && <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center gap-1"><Check size={14}/> Coupon applied successfully!</p>}
            </div>

            <div className="space-y-3 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>{selectedPlanForConfirmation.name} Plan:</span>
                <span>₹{selectedPlanForConfirmation.price}</span>
              </div>
              {selectedAddons.length > 0 && (
                <div className="flex justify-between text-purple-600 font-medium">
                  <span>Add-ons ({selectedAddons.length}):</span>
                  <span>+₹{
                     selectedAddons.reduce((sum, id) => {
                       const cat = availableCategories.find(c => c._id === id);
                       return sum + (cat ? (cat.addonPrice || 1499) : 0);
                     }, 0)
                  }</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-₹{calculateDiscount()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium pb-4 border-b border-slate-200">
                <span>GST (18%):</span>
                <span>₹{calculateGST()}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-slate-900">
                <span>Total Amount:</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => selectedPaymentMode === 'trial' ? processTrialPayment(selectedPlanForConfirmation) : processDirectPayment(selectedPlanForConfirmation)}
                disabled={processingId === selectedPlanForConfirmation._id}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedPaymentMode === 'trial'
                    ? 'text-orange-600 bg-orange-50 border-2 border-orange-200 hover:bg-orange-100'
                    : 'text-white bg-gradient-premium hover:bg-gradient-premium-hover shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30'
                } disabled:opacity-70`}
              >
                {processingId === selectedPlanForConfirmation._id ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Zap size={18} fill="currentColor" />
                )}
                {processingId === selectedPlanForConfirmation._id 
                  ? 'Processing...' 
                  : selectedPaymentMode === 'trial' ? 'Start 15 Days Free Trial (Auto-pay)' : 'Confirm & Buy Now'
                }
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
