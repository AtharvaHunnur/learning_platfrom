"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { api } from "@/lib/axios";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PaymentHistory {
  id: string;
  amount: string;
  transaction_id: string;
  status: string;
  created_at: string;
  subjects: { title: string };
}

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/payments/history");
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch payment history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Payment History</h1>
          <p className="text-muted-foreground text-sm">Review your previous course enrollments and transactions.</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Simulated Payments Enabled</span>
        </div>
      </div>

      <Card className="glass-card border-white/[0.06] overflow-hidden">
        {history.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No payment history found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/70">Course</TableHead>
                <TableHead className="text-white/70">Date</TableHead>
                <TableHead className="text-white/70">Transaction ID</TableHead>
                <TableHead className="text-white/70">Amount</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((payment) => (
                <TableRow key={payment.id} className="border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                  <TableCell className="font-medium text-white">{payment.subjects.title}</TableCell>
                  <TableCell className="text-white/70 text-sm">
                    {format(new Date(payment.created_at), 'dd MMM yyyy, HH:mm')}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-white/50">{payment.transaction_id}</TableCell>
                  <TableCell className="text-white font-bold">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
