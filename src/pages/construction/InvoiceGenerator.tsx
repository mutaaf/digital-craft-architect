import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import { useDemoContext } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Printer,
  Download,
} from 'lucide-react';

interface LineItem {
  description: string;
  qty: number;
  rate: number;
}

const EMPTY_ITEM: LineItem = { description: '', qty: 1, rate: 0 };

const InvoiceGenerator = () => {
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';

  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);
  const [taxRate, setTaxRate] = useState(8.25);
  const [notes, setNotes] = useState('Payment due within 30 days of invoice date.');
  const [invoiceNumber] = useState(() => `INV-${Date.now().toString(36).toUpperCase().slice(-6)}`);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const reset = () => {
    setStep(1);
    setClientName('');
    setClientAddress('');
    setClientEmail('');
    setItems([{ ...EMPTY_ITEM }]);
    setTaxRate(8.25);
    setNotes('Payment due within 30 days of invoice date.');
  };

  const canAdvance = () => {
    if (step === 1) return clientName.length >= 2;
    if (step === 2) return items.some((i) => i.description && i.rate > 0);
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Invoice Generator Demo | {companyName} | DigitalCraft AI</title>
        <meta name="description" content={`Generate professional construction invoices branded for ${companyName}. Enter project details and line items to create a polished invoice instantly.`} />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> AI Invoice Tool
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Professional Invoice Generator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Enter client details and line items — get a polished, branded invoice ready to send.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Client', 'Line Items', 'Review'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i + 1 <= step ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i + 1 <= step ? 'text-primary font-medium' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className={`w-8 h-px ${i + 1 < step ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Construction LLC" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="123 Main St, Dallas, TX 75201" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Line Items</h2>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-5">
                  {idx === 0 && <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description</label>}
                  <Input value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Foundation work" />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  {idx === 0 && <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Qty</label>}
                  <Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(idx, 'qty', +e.target.value || 1)} />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  {idx === 0 && <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Rate ($)</label>}
                  <Input type="number" min={0} step={50} value={item.rate || ''} onChange={(e) => updateItem(idx, 'rate', +e.target.value || 0)} placeholder="0.00" />
                </div>
                <div className="col-span-3 sm:col-span-2 flex gap-1">
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
              <Plus size={14} className="mr-1" /> Add Item
            </Button>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tax Rate (%)</label>
                <Input type="number" min={0} max={20} step={0.25} value={taxRate} onChange={(e) => setTaxRate(+e.target.value || 0)} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Subtotal</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{fmt(subtotal)}</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden" id="invoice-preview">
              {/* Invoice Header */}
              <div className="bg-primary/5 dark:bg-primary/10 px-6 py-5 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{companyName}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Professional Construction Services</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">INVOICE</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{invoiceNumber}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
                <p className="font-semibold text-gray-900 dark:text-white">{clientName}</p>
                {clientAddress && <p className="text-sm text-gray-600 dark:text-gray-400">{clientAddress}</p>}
                {clientEmail && <p className="text-sm text-gray-600 dark:text-gray-400">{clientEmail}</p>}
              </div>

              {/* Line Items Table */}
              <div className="px-6 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Rate</th>
                      <th className="text-right py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter((i) => i.description).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50">
                        <td className="py-2.5 text-gray-900 dark:text-white">{item.description}</td>
                        <td className="py-2.5 text-right text-gray-600 dark:text-gray-400">{item.qty}</td>
                        <td className="py-2.5 text-right text-gray-600 dark:text-gray-400">{fmt(item.rate)}</td>
                        <td className="py-2.5 text-right font-medium text-gray-900 dark:text-white">{fmt(item.qty * item.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-end">
                  <div className="w-48 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span><span>{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax ({taxRate}%)</span><span>{fmt(tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>Total</span><span>{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} className="mr-2" /> Print / Save PDF
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={step === 1 ? reset : () => setStep((s) => s - 1)} disabled={step === 1}>
            {step === 1 ? <><RotateCcw size={16} className="mr-1" /> Reset</> : <><ArrowLeft size={16} className="mr-1" /> Back</>}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
              Next <ArrowRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button variant="outline" onClick={reset}>
              <RotateCcw size={16} className="mr-1" /> New Invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
