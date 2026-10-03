import React from 'react';
import { Download, FileText, CheckCircle2, Clock } from 'lucide-react';

interface InvoiceTableProps {
  invoices: any[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices }) => {
  return (
    <div className="bg-[#fdfdfc] border border-[#e2dfd5] rounded shadow-xs overflow-hidden">
      <div className="p-4 border-b border-[#e7e5dc] flex items-center justify-between bg-[#faf9f6]">
        <div>
          <h3 className="font-serif-editorial text-lg font-semibold text-[#1e2321]">
            Practice Ledger & Invoices
          </h3>
          <p className="text-xs text-[#636f68] mt-0.5">
            Compliant receipts generated and linked to verified payments.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#e7e5dc] bg-[#f5f3ec] text-[#637068] font-semibold">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Issue Date</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeebe3]">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-[#717b75]">
                  No invoices generated yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id || inv.id} className="hover:bg-[#f8f7f2] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#1e2321]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#27322b]">
                    {inv.clientName}
                  </td>
                  <td className="py-3.5 px-4 text-[#526057]">
                    {inv.issueDate}
                  </td>
                  <td className="py-3.5 px-4 text-[#526057]">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1e2321]">
                    ${inv.amount} {inv.currency}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'issued'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {inv.status === 'paid' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      <span>{inv.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 text-[11px] text-[#4f5c53] hover:text-[#1e2321] font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
