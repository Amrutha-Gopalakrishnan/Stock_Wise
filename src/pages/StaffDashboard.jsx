import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase, isSupabaseMock } from "@/supabaseClient";
import { localDb } from "@/lib/localDb";
import { toast } from "sonner";

export default function StaffDashboard() {
  const uuidPattern = useMemo(() => {
    if (isSupabaseMock) return /.*/;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  }, [isSupabaseMock]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [defaultStaffId, setDefaultStaffId] = useState("");
  const [productInput, setProductInput] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transactionType, setTransactionType] = useState("out");
  const [note, setNote] = useState("");
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const refreshProductOptions = () => {
    const lookup = localDb.getProducts();
    const formatted = lookup.map((product) => ({
      id: product.id,
      name: product.name,
    }));
    setProducts(formatted);
  };

  const fetchProducts = async () => {
    refreshProductOptions();
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .order("name");
    if (error) {
      console.error("Error loading products:", error);
      toast.warning("Using locally saved products (Supabase unavailable)");
    } else {
      localDb.saveProducts((data || []).map((item) => ({ id: item.id, name: item.name })));
    }
    refreshProductOptions();
  };

  const refreshTransactionsFromLocal = () => {
    const productLookup = new Map(localDb.getProducts().map((product) => [product.id, product.name]));
    const formatted = localDb
      .getStockTransactions()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        product_name: productLookup.get(item.product_id) ?? "Unknown product",
        quantity: item.quantity,
        reason: item.transaction_type,
        created_at: item.created_at,
        note: item.reason ?? "",
      }));
    setTransactions(formatted);
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    refreshTransactionsFromLocal();
    const { data, error } = await supabase
      .from("stock_transactions")
      .select(
        `
          id,
          product_id,
          transaction_type,
          quantity,
          reason,
          created_at,
          logged_by,
          products (
            name
          )
        `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading transactions:", error);
      toast.warning("Showing saved transactions");
    } else {
      localDb.saveStockTransactions(
        (data || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          transaction_type: item.transaction_type,
          quantity: item.quantity,
          reason: item.reason ?? null,
          logged_by: item.logged_by ?? null,
          created_at: item.created_at,
        })),
      );
    }
    refreshTransactionsFromLocal();
    setLoadingTransactions(false);
  };

  const fetchStaffUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "staff")
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Error loading staff user:", error);
      const fallbackUser = localDb.getStaffUser();
      if (fallbackUser?.id) {
        setDefaultStaffId(fallbackUser.id);
      } else {
        toast.error("Failed to load staff user");
      }
      return;
    }
    if (data?.id) {
      setDefaultStaffId(data.id);
      localDb.upsertUser({ id: data.id, full_name: data.full_name ?? "Staff User", role: "staff" });
    } else {
      const fallbackUser = localDb.getStaffUser();
      if (fallbackUser?.id) {
        setDefaultStaffId(fallbackUser.id);
      } else {
        toast.error("No staff user available");
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
    fetchStaffUser();

    const channel = supabase
      .channel("staff_transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_transactions" },
        () => {
          fetchTransactions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productInput || !quantity || !transactionType) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!selectedProductId || !uuidPattern.test(selectedProductId.trim())) {
      toast.error("Please pick a valid product from the list");
      return;
    }

    const parsedQty = parseInt(quantity, 10,);
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    if (!defaultStaffId) {
      toast.error("Unable to log stock without a staff user");
      return;
    }

    try {
      const issues = [];
      let newStock = null;
      let remoteTransactionId = null;

      try {
        const { data, error } = await supabase.rpc("fn_record_stock_transaction", {
          p_product_id: selectedProductId,
          p_transaction_type: transactionType,
          p_quantity: parsedQty,
          p_reason: note,
          p_logged_by: defaultStaffId,
        });

        if (error) {
          issues.push(error);
        } else if (Array.isArray(data) && data[0]) {
          newStock = data[0].new_stock ?? null;
          remoteTransactionId = data[0].transaction_id ?? null;
        }
      } catch (err) {
        issues.push(err);
      }

      const { newStock: localStock } = localDb.addStockTransaction({
        id: remoteTransactionId ?? undefined,
        product_id: selectedProductId,
        transaction_type: transactionType,
        quantity: parsedQty,
        reason: note,
        logged_by: defaultStaffId,
      });

      if (newStock === null && typeof localStock === "number") {
        newStock = localStock;
      }

      if (newStock !== null) {
        localDb.setStockLevel(selectedProductId, newStock);
      }

      await fetchTransactions();
      refreshProductOptions();

      toast.success(
        issues.length === 0
          ? "Transaction logged successfully!"
          : "Transaction saved",
      );
      setProductInput("");
      setSelectedProductId("");
      setQuantity("");
      setTransactionType("out");
      setNote("");
    } catch (err) {
      console.error("Error logging transaction:", err);
      toast.error(err?.message || "Failed to log transaction");
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Staff Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Record sales, purchases, or damages
      </p>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Log Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Label htmlFor="product">Product</Label>
            <input
              id="product"
              type="text"
              list="product-options"
              className="block w-full border rounded p-2"
              placeholder="Search product"
              value={productInput}
              onChange={(e) => {
                const value = e.target.value;
                setProductInput(value);
                const match = products.find(
                  (product) => product.name.toLowerCase() === value.toLowerCase(),
                );
                setSelectedProductId(match?.id || "");
              }}
              required
            />
            <datalist id="product-options">
              {products.map((product) => (
                <option key={product.id} value={product.name}>
                  {product.name} — {product.id}
                </option>
              ))}
            </datalist>
            <Label htmlFor="quantity" className="mt-4">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              className="mb-2"
            />
            <Label htmlFor="transactionType" className="mt-4">Transaction Type</Label>
            <select
              id="transactionType"
              className="block w-full border rounded p-2 mb-2"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              required
            >
              <option value="out">Stock Out</option>
              <option value="in">Stock In</option>
              <option value="adjustment">Adjustment</option>
            </select>
            <Label htmlFor="note" className="mt-4">Note</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional reason"
              className="mb-4"
            />
            <Button type="submit">Log Transaction</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {loadingTransactions ? "Loading transactions..." : "No transactions available"}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{transaction.product_name}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.reason === "in" ? "primary" : transaction.reason === "out" ? "destructive" : "secondary"}>
                        {transaction.reason}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                    <TableCell>{transaction.note}</TableCell>
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
