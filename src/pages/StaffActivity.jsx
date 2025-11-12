import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

export default function StaffActivity() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [staffUserName, setStaffUserName] = useState("Staff User");
  const [staffUserId, setStaffUserId] = useState("");

  const fetchTransactions = async (userId) => {
    if (!userId) return;
    setLoadingTransactions(true);
    const { data, error } = await supabase
      .from("stock_transactions")
      .select(
        `
          id,
          transaction_type,
          quantity,
          reason,
          created_at,
          products ( name )
        `
      )
      .eq("logged_by", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading staff transactions:", error);
      toast.error("Failed to load your activity");
      setTransactions([]);
    } else {
      const formatted = (data || []).map((item) => ({
        id: item.id,
        transaction_type: item.transaction_type,
        product_name: item?.products?.name ?? "Unknown product",
        created_at: item.created_at,
        reason: item.reason ?? "",
        quantity: item.quantity,
      }));
      setTransactions(formatted);
    }
    setLoadingTransactions(false);
  };

  useEffect(() => {
    let channel;
    const load = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("role", "staff")
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error("Error loading staff user:", error);
        toast.error("Failed to load staff user");
        return;
      }
      if (data?.id) {
        setStaffUserId(data.id);
        setStaffUserName(data.full_name || "Staff User");
        await fetchTransactions(data.id);
        channel = supabase
          .channel("staff_activity")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "stock_transactions",
              filter: `logged_by=eq.${data.id}`,
            },
            () => {
              fetchTransactions(data.id);
            },
          )
          .subscribe();
      } else {
        toast.error("No staff user found in Supabase");
      }
    };

    load();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Staff Activity</h1>
      <p className="text-muted-foreground mb-6">
        Recent transactions for {staffUserName}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {loadingTransactions ? "Loading activity..." : "No activity yet"}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === "in" ? "primary" : transaction.transaction_type === "out" ? "destructive" : "secondary"}>
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.product_name}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                    <TableCell>{transaction.reason}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
