// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// // import { Badge } from "@/components/ui/badge";
// // import { transactions } from "@/data/dummyData";

// // export function TransactionsTable() {
// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle>Recent Transactions</CardTitle>
// //       </CardHeader>
// //       <CardContent>
// //         <Table>
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead>Product</TableHead>
// //               <TableHead>Quantity</TableHead>
// //               <TableHead>Reason</TableHead>
// //               <TableHead>Date</TableHead>
// //               <TableHead>User</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {transactions.slice(0, 5).map((transaction) => (
// //               <TableRow key={transaction.id}>
// //                 <TableCell className="font-medium">{transaction.productName}</TableCell>
// //                 <TableCell>
// //                   <span className={transaction.quantity > 0 ? "text-success" : "text-foreground"}>
// //                     {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
// //                   </span>
// //                 </TableCell>
// //                 <TableCell>
// //                   <Badge
// //                     variant={
// //                       transaction.reason === "Purchase"
// //                         ? "default"
// //                         : transaction.reason === "Sale"
// //                         ? "secondary"
// //                         : "destructive"
// //                     }
// //                   >
// //                     {transaction.reason}
// //                   </Badge>
// //                 </TableCell>
// //                 <TableCell>{transaction.date}</TableCell>
// //                 <TableCell>{transaction.user}</TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       </CardContent>
// //     </Card>
// //   );
// // }

// // src/components/dashboard/TransactionsTable.jsx
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { supabase } from "@/supabaseClient";

// export function TransactionsTable() {
//   const [transactions, setTransactions] = useState([]);

//   const fetchTransactions = async () => {
//     const { data, error } = await supabase
//       .from("stock_transactions")
//       .select("id, transaction_type, quantity, reason, created_at, products(name), users(full_name)")
//       .order("created_at", { ascending: false })
//       .limit(10);

//     if (error) {
//       console.error("Error loading transactions:", error);
//       return;
//     }
//     setTransactions(data || []);
//   };

//   useEffect(() => {
//     fetchTransactions();

//     const sub = supabase
//       .channel("transactions_realtime")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "stock_transactions" },
//         () => fetchTransactions()
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(sub);
//     };
//   }, []);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Recent Transactions</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Product</TableHead>
//               <TableHead>Quantity</TableHead>
//               <TableHead>Reason</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>User</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {transactions && transactions.length > 0 ? (
//               transactions.map((t) => (
//                 <TableRow key={t.id}>
//                   <TableCell>{t.products?.name ?? "Unknown"}</TableCell>
//                   <TableCell>{t.quantity}</TableCell>
//                   <TableCell>{t.reason ?? "-"}</TableCell>
//                   <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
//                   <TableCell>{t.users?.full_name ?? "Unknown"}</TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-muted-foreground">No transactions yet</TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   );
// }

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase, getCurrentUserId } from "@/supabaseClient";
import { toast } from "sonner";

// Utility function to record stock transaction via Supabase
async function recordStockTransaction({ product_id, type, quantity, reason, logged_by }) {
  const { data, error } = await supabase
    .from("stock_transactions")
    .insert([{
      product_id,
      transaction_type: type,
      quantity,
      reason,
      logged_by,
    }])
    .select("id as transaction_id")
    .single();
  return { data, error };
}

export function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("stock_transactions")
      .select("id, transaction_type, quantity, reason, created_at, products(name), users(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error loading transactions:", error);
      return;
    }
    setTransactions(data || []);
  };

  useEffect(() => {
    fetchTransactions();

    const sub = supabase
      .channel("transactions_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_transactions" },
        () => fetchTransactions()
      )
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.products?.name ?? "Unknown"}</TableCell>
                  <TableCell>
                    <span className={t.quantity > 0 ? "text-success" : "text-foreground"}>
                      {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.reason === "Purchase"
                          ? "default"
                          : t.reason === "Sale"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {t.reason ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                  <TableCell>{t.users?.full_name ?? "Unknown"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No transactions yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function TransactionForm({ selectedProductId, onSuccess }) {
  const [transactionType, setTransactionType] = useState("in"); // 'in' | 'out' | 'adjustment'
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  async function handleSubmitTransaction(e) {
    e.preventDefault();
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn("No user signed in. Using fallback user id if needed.");
      }
      const { data, error } = await recordStockTransaction({
        product_id: selectedProductId,
        type: transactionType,
        quantity: parseInt(quantity, 10),
        reason: reason || null,
        logged_by: userId || "FALLBACK_USER_UUID", // Replace FALLBACK_USER_UUID as needed
      });

      if (error) throw error;

      toast.success("Transaction recorded successfully!");
      setQuantity("");
      setReason("");

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error("Transaction submit error:", err);
      toast.error("Failed to record transaction.");
    }
  }

  return (
    <form onSubmit={handleSubmitTransaction} className="space-y-4 max-w-md">
      <label>
        Transaction Type:
        <select value={transactionType} onChange={e => setTransactionType(e.target.value)} required className="block w-full border rounded p-2">
          <option value="in">In</option>
          <option value="out">Out</option>
          <option value="adjustment">Adjustment</option>
        </select>
      </label>
      <label>
        Quantity:
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          required
          className="block w-full border rounded p-2"
        />
      </label>
      <label>
        Reason:
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="block w-full border rounded p-2"
          placeholder="Optional"
        />
      </label>
      <Button type="submit">Submit Transaction</Button>
    </form>
  );
}
