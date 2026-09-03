import React, { useState } from 'react';
import { 
  CreditCard, Smartphone, CheckCircle2, AlertCircle, ArrowRight, 
  Sparkles, Download, Printer, ShieldCheck, RefreshCw, X, DollarSign
} from 'lucide-react';
import apiClient from '../api/client';

export default function MoMoPaymentModal({ isOpen, onClose, initialCampaign = null, onPaymentSuccess }) {
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'receipt'
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [category, setCategory] = useState(initialCampaign?.category || 'dues'); // 'dues' | 'levy' | 'fundraising'
  const [campaignTitle, setCampaignTitle] = useState(initialCampaign?.title || 'August 2026 Monthly Youth Dues');
  const [amount, setAmount] = useState(initialCampaign?.defaultAmount || '50');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const networks = [
    { id: 'MTN', name: 'MTN MoMo', color: 'border-amber-400 bg-amber-50 text-amber-900', badge: 'bg-amber-400 text-slate-950' },
    { id: 'Telecel', name: 'Telecel / Vodafone', color: 'border-rose-400 bg-rose-50 text-rose-900', badge: 'bg-rose-500 text-white' },
    { id: 'AT', name: 'AT / AirtelTigo', color: 'border-blue-400 bg-blue-50 text-blue-900', badge: 'bg-blue-600 text-white' },
    { id: 'Card', name: 'Bank Card / Hubtel', color: 'border-purple-400 bg-purple-50 text-purple-900', badge: 'bg-purple-600 text-white' },
  ];

  const predefinedCampaigns = [
    { category: 'dues', title: 'Monthly Youth Dues (GHS 50.00)', amount: '50' },
    { category: 'levy', title: 'Mountain Retreat 2026 Camp Levy (GHS 200.00)', amount: '200' },
    { category: 'fundraising', title: 'Youth Instruments & Digital Sound Fund', amount: '100' },
    { category: 'fundraising', title: 'Community Food Drive & Welfare Mission', amount: '50' },
  ];

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!payerName || !payerPhone || !amount) {
      setError('Please provide your name, phone number, and amount.');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const payload = {
        payer_name: payerName,
        payer_phone: payerPhone,
        network,
        category,
        campaign_title: campaignTitle,
        amount: parseFloat(amount),
        currency: 'GHS',
      };

      const res = await apiClient.post('/payments/momo', payload);
      setReceipt(res.data.receipt);
      setStep('receipt');
      if (onPaymentSuccess) onPaymentSuccess(res.data.receipt);
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment simulation encountered an issue.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* STEP 1: PAYMENT FORM */}
        {/* ========================================================================= */}
        {step === 'form' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl">
                  Mobile Money & Digital Payment
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Global Evangelical Church Youth (Kasoa Branch) • Hubtel MoMo Gateway
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {/* Select Payment Purpose */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Payment Purpose / Campaign *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { id: 'dues', label: 'Monthly Dues' },
                    { id: 'levy', label: 'Camp Levy' },
                    { id: 'fundraising', label: 'Fundraising' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id);
                        if (cat.id === 'dues') setCampaignTitle('Monthly Youth Dues');
                        else if (cat.id === 'levy') setCampaignTitle('Mountain Retreat 2026 Camp Levy');
                        else setCampaignTitle('Youth Instruments & Sound Equipment Project');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        category === cat.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="Enter specific campaign title or project name..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              {/* Select Network */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Mobile Money Network *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {networks.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setNetwork(net.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        network === net.id
                          ? `border-slate-900 bg-slate-900 text-white shadow-md`
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block">{net.id}</span>
                      <span className="text-[9px] opacity-75">{net.name.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="e.g. Kwesi Mensah"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    MoMo Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="024 XXX XXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Amount in Ghana Cedis (GHS) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    GHS
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 mt-2"
              >
                <span>Authorize GHS {parseFloat(amount || 0).toFixed(2)} on {network}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Secured by Global Evangelical Church Hubtel Payment Gateway
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PROCESSING / USSD SIMULATION */}
        {/* ========================================================================= */}
        {step === 'processing' && (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center mx-auto animate-pulse">
              <Smartphone className="w-10 h-10 text-amber-600 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">MoMo Prompt Sent to {payerPhone}</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please check your mobile phone and enter your <strong>{network} MoMo PIN</strong> to approve the payment of GHS {amount}.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              <span>Simulating Hubtel Gateway Authorization...</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DIGITAL PAYMENT RECEIPT */}
        {/* ========================================================================= */}
        {step === 'receipt' && receipt && (
          <div className="space-y-6">
            <div className="text-center space-y-1 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Payment Received & Verified!</h3>
              <p className="text-xs text-slate-500">Official Church Youth Digital Receipt</p>
            </div>

            {/* Receipt Card */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-sans">Church:</span>
                <span className="font-bold text-slate-900 text-right font-sans">Global Evangelical Church Youth (Kasoa)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Receipt Ref:</span>
                <span className="font-bold text-slate-800">{receipt.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payer:</span>
                <span className="font-bold text-slate-800">{receipt.payer} ({receipt.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Purpose:</span>
                <span className="font-bold text-slate-800 font-sans">{receipt.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Network:</span>
                <span className="font-bold text-slate-800">{receipt.network} MoMo</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-black text-emerald-700">
                <span className="font-sans">Total Paid:</span>
                <span>GHS {receipt.amount}</span>
              </div>
              <div className="text-[10px] text-slate-400 text-center pt-2">
                Status: <span className="text-emerald-600 font-bold">● VERIFIED IN DATABASE LEDGER</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
