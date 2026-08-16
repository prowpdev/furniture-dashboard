import React from 'react';
import { X, Printer, Shield, Truck, Store } from 'lucide-react';

export const InvoiceModal = ({
  isOpen,
  onClose,
  order,
  profile,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-stone-200 relative my-8 max-h-[90vh] overflow-y-auto print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Floating Action Buttons */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-200 print:hidden mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900 uppercase tracking-wider">
              Official Sales Order & Delivery Manifest
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE DOCUMENT BODY */}
        <div className="space-y-6 text-stone-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b-2 border-stone-800">
            <div>
              <div className="flex items-center space-x-2">
                <Store className="w-6 h-6 text-amber-700" />
                <h1 className="font-serif font-bold text-2xl text-stone-950 tracking-tight">
                  {profile.storeName}
                </h1>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-sm">{profile.tagline}</p>
              <p className="text-xs text-stone-500 mt-0.5">{profile.address}</p>
              <p className="text-xs text-stone-500">{profile.phone} • {profile.email}</p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs uppercase tracking-widest text-stone-400 font-bold">Sales Order</div>
              <div className="font-mono text-xl font-bold text-stone-900 mt-0.5">{order.orderNumber}</div>
              <div className="text-xs text-stone-600 mt-1">
                Order Date: {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-xs text-stone-600">
                Scheduled Delivery: <strong className="text-stone-900">{order.deliveryDate}</strong>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div>
              <span className="font-bold text-stone-500 uppercase tracking-wider block mb-1">Billed & Sold To:</span>
              <div className="font-bold text-sm text-stone-900">{order.customer.name}</div>
              <div className="text-stone-600 mt-0.5">Phone: {order.customer.phone}</div>
              <div className="text-stone-600">Email: {order.customer.email}</div>
            </div>

            <div>
              <span className="font-bold text-stone-500 uppercase tracking-wider block mb-1">Delivery Destination & Plan:</span>
              <div className="font-semibold text-stone-900">{order.customer.deliveryAddress}</div>
              <div className="text-stone-600">{order.customer.city}, {order.customer.postalCode}</div>
              <div className="mt-1 flex items-center space-x-1 font-medium text-amber-900">
                <Truck className="w-3.5 h-3.5" />
                <span>Service: {order.deliveryType === 'white_glove' ? 'White Glove Delivery & In-Room Assembly' : order.deliveryType === 'standard' ? 'Standard Curbside Freight' : 'Showroom Self-Pickup'}</span>
              </div>
              {order.customer.deliveryNotes && (
                <div className="mt-1 text-stone-500 italic">Notes: "{order.customer.deliveryNotes}"</div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Item & Specifications</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-stone-500">{item.material}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-500">{item.sku}</td>
                    <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">{profile.currency}{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      {profile.currency}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            {/* Warranty Notice */}
            <div className="max-w-xs space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center space-x-1.5 text-stone-800 font-semibold">
                <Shield className="w-4 h-4 text-amber-700" />
                <span>5-Year Solid Wood & Structural Guarantee</span>
              </div>
              <p>
                All timber frames, hand-joinery, and upholstery cushions are warranted against manufacturing defects for 5 years from date of delivery.
              </p>
            </div>

            {/* Financial Summary Box */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">{profile.currency}{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Store Courtesy Discount:</span>
                  <span className="font-mono">-{profile.currency}{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Fulfillment & Handling:</span>
                <span className="font-mono">{profile.currency}{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax ({(order.taxRate * 100).toFixed(1)}%):</span>
                <span className="font-mono">{profile.currency}{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-base text-stone-950 pt-2 border-t border-stone-300">
                <span>Grand Total:</span>
                <span>{profile.currency}{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[11px] text-stone-500 text-right pt-1">
                Payment: <span className="font-semibold capitalize text-stone-800">{order.paymentMethod.replace('_', ' ')} (Paid)</span>
              </div>
            </div>
          </div>

          {/* Delivery & Inspection Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-stone-300 text-xs">
            <div>
              <div className="border-b border-stone-400 pb-8 text-stone-400">Authorized Furniture Associate</div>
              <span className="text-[10px] text-stone-500 uppercase mt-1 block">Staff Signature & Date</span>
            </div>
            <div>
              <div className="border-b border-stone-400 pb-8 text-stone-400">Customer Acceptance Upon Inspection</div>
              <span className="text-[10px] text-stone-500 uppercase mt-1 block">Client Signature Upon Assembly/Pickup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
