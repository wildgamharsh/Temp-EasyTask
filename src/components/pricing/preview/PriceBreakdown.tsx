import React from 'react';
import { PricingResult } from '@/types/pricing';
import { AlertCircle, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';

interface Props {
  result: PricingResult;
  quantity: number;
}

export const PriceBreakdown: React.FC<Props> = ({ result, quantity }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden sticky top-6">
      {/* Header with Gradient */}
      <div className="p-6 border-b-2 border-blue-100 bg-linear-to-r from-blue-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
            <DollarSign size={20} className="text-white" />
          </div>
          <h2 className="font-bold text-slate-900 text-xl">Price Quote</h2>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Validation Status */}
        {!result.isValid ? (
          <div className="p-4 bg-linear-to-r from-red-50 to-orange-50 text-red-700 rounded-xl text-sm flex items-start gap-3 border-2 border-red-200 shadow-sm">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-bold">Configuration Incomplete</p>
              <ul className="list-disc pl-5 text-xs space-y-1 opacity-90">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl text-sm flex items-center gap-3 border-2 border-green-200 shadow-sm">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="font-bold">Valid Configuration</span>
          </div>
        )}

        {/* Line Items */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Breakdown</div>
          {result.breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm group p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
              <div className="flex flex-col gap-1">
                <span className="text-slate-700 font-semibold">{item.label}</span>
                {item.ruleApplied && (
                  <span className="text-xs text-amber-600 italic flex items-center gap-1">
                    <Sparkles size={12} />
                    {item.ruleApplied}
                  </span>
                )}
                {item.basePrice !== item.finalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    Original: ${item.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-slate-900 text-base">
                ${item.finalPrice.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Subtotal Section */}
        <div className="border-t-2 border-slate-100 pt-4 space-y-2">
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span className="font-medium">Unit Price</span>
            <span className="font-mono font-semibold">${result.unitPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span className="font-medium">Quantity</span>
            <span className="font-mono font-semibold">× {quantity}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-blue-100 pt-5 flex justify-between items-center bg-linear-to-r from-blue-50/50 to-blue-50/50 -mx-6 px-6 py-5 -mb-6">
          <span className="text-lg font-bold text-slate-900">Total</span>
          <div className="text-right">
            <div className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ${result.totalPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
