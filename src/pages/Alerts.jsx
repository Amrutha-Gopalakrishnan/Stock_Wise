import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase, getCurrentUserId } from "@/supabaseClient"; // adjust path as needed

// Sample alerts data - replace with fetching from Supabase
export default function Alerts() {
  const uuidPattern = useMemo(
    () =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    []
  );
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [products, setProducts] = useState([]);

  // Form state for creating an alert
  const [alertProductId, setAlertProductId] = useState("");
  const [alertType, setAlertType] = useState("low_stock"); // can be low_stock, out_of_stock, reorder

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    const { data, error } = await supabase
      .from("alerts")
      .select(
        `
          id,
          alert_type,
          status,
          created_at,
          products (
            id,
            name
          )
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading alerts:", error);
      toast.error("Failed to load alerts");
      setAlerts([]);
    } else {
      const formatted = (data || []).map((alert) => ({
        id: alert.id,
        product_id: alert?.products?.id ?? null,
        product_name: alert?.products?.name ?? "Unknown product",
        status: alert.status,
        alert_type: alert.alert_type,
        created_at: alert.created_at,
      }));
      setAlerts(formatted);
    }
    setLoadingAlerts(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .order("name");
    if (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setProducts([]);
      return;
    }
    setProducts(data || []);
  };

  useEffect(() => {
    fetchAlerts();
    fetchProducts();
  }, []);

  // Create alert handler
  async function handleCreateAlert(e) {
    e.preventDefault();

    if (!uuidPattern.test(alertProductId.trim())) {
      toast.error("Product ID must be a valid UUID");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("alerts")
        .insert([{
          product_id: alertProductId,
          alert_type: alertType,
          status: "active"
        }])
        .select("id")
        .single();

      if (error) throw error;

      const userId = await getCurrentUserId();
      await supabase.from("audit_logs").insert([{
        user_id: userId,
        action: "create_alert",
        entity_type: "alerts",
        entity_id: data.id,
        changes: { product_id: alertProductId, alert_type: alertType }
      }]);

      toast.success("Alert created successfully!");

      await fetchAlerts();

      // Clear form fields
      setAlertProductId("");
      setAlertType("low_stock");

    } catch (err) {
      console.error("Create alert error:", err);
      toast.error("Failed to create alert.");
    }
  }

  // Handler to mark alert as resolved (update status)
  const handleResolve = async (alertId) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ status: "resolved" })
        .eq("id", alertId);

      if (error) throw error;

      toast.success("Alert marked as resolved!");

      // Update local state to reflect resolved alert
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status: "resolved" } : alert,
        ),
      );
    } catch (err) {
      console.error("Error resolving alert:", err);
      toast.error("Failed to mark alert as resolved.");
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Alerts</h1>
      <p className="text-muted-foreground mb-6">Monitor and manage low stock alerts</p>

      {/* Create Alert Form */}
      <form onSubmit={handleCreateAlert} className="mb-6 space-y-4 max-w-md">
        <label>
          Product ID:
          <input
            className="block w-full border rounded p-2"
            list="product-options"
            value={alertProductId}
            onChange={(e) => setAlertProductId(e.target.value)}
            required
          />
          <datalist id="product-options">
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {product.id}
              </option>
            ))}
          </datalist>
        </label>
        <label>
          Alert Type:
          <select
            className="block w-full border rounded p-2"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            required
          >
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="reorder">Reorder</option>
          </select>
        </label>
        <Button type="submit">Create Alert</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {loadingAlerts ? "Loading alerts..." : "No alerts available"}
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.id}</TableCell>
                    <TableCell>{alert.product_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alert.status === "active" ? "destructive" : "secondary"
                        }
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.alert_type}</TableCell>
                    <TableCell>
                      {alert.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Mark as resolved
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Resolved
                        </span>
                      )}
                    </TableCell>
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
