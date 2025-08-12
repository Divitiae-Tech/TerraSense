// components/finance/ManualTransactionForm.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { SecureDataHandler } from '@/lib/secureDataHandler';

interface ManualTransactionFormProps {
  onAddTransaction: (transaction: any) => void;
}

const ManualTransactionForm = ({ onAddTransaction }: ManualTransactionFormProps) => {
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    crop: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.type || !formData.amount || !formData.category || !formData.date || !formData.description) {
      setError('All fields are required.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    // ✅ Sanitize input (DB Dev Comment: This will be validated server-side later)
    const sanitizedDescription = SecureDataHandler.sanitizeInput(formData.description);
    const sanitizedNotes = SecureDataHandler.sanitizeInput(formData.notes);

    const newTransaction = {
      type: formData.type,
      amount,
      crop: formData.crop || 'General',
      category: formData.category,
      date: formData.date,
      description: sanitizedDescription,
      paymentMethod: formData.paymentMethod || 'cash',
      notes: sanitizedNotes,
      status: 'completed', // Could be 'pending' for approvals
    };

    // ✅ Pass to parent (in-memory storage)
    onAddTransaction(newTransaction);

    // Reset form
    setFormData({
      type: '',
      amount: '',
      crop: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: '',
      notes: '',
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <Select name="type" value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <Input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Crop</label>
            <Input name="crop" value={formData.crop} onChange={handleChange} placeholder="e.g. Maize" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <Input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Sales, Fertilizer" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <Input name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Input name="description" value={formData.description} onChange={handleChange} placeholder="e.g. Sold maize to market" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <Select name="paymentMethod" value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile-money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Internal notes..." rows={2} />
          </div>

          <Button type="submit" className="w-full">
            Record Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualTransactionForm;