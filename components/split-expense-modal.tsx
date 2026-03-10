'use client'

import { useState } from 'react'
import { Share2, Copy, MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Expense } from '@/lib/types'
import { toast } from 'sonner'

interface SplitExpenseModalProps {
  expense: Expense | null
  onClose: () => void
}

export function SplitExpenseModal({ expense, onClose }: SplitExpenseModalProps) {
  const [splitAmount, setSplitAmount] = useState(expense ? (expense.amount / 2).toFixed(2) : '0.00')
  const [copied, setCopied] = useState(false)

  if (!expense) return null

  const splitText = `Hey! I split an expense with you. ${expense.description} - Your share: ₹${splitAmount}`
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(splitText)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(splitText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={!!expense} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Split Expense</DialogTitle>
          <DialogDescription>Share this expense with a friend</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Expense</Label>
            <p className="font-semibold">{expense.description}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Total Amount</Label>
            <p className="text-2xl font-bold text-primary">₹{expense.amount.toFixed(2)}</p>
          </div>

          <div>
            <Label htmlFor="split-amount">Your Friend's Share (₹)</Label>
            <Input
              id="split-amount"
              type="number"
              value={splitAmount}
              onChange={(e) => setSplitAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Share message:</p>
            <p className="text-sm mt-2 font-medium">{splitText}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCopy} className="flex-1 bg-transparent" variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Message'}
            </Button>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
