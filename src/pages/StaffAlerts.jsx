import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

export default function StaffAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

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
        product_name: alert?.products?.name ?? "Unknown product",
        status: alert.status,
        alert_type: alert.alert_type,
        created_at: alert.created_at,
      }));
      setAlerts(formatted);
    }
    setLoadingAlerts(false);
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("staff_alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          fetchAlerts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Staff Alerts</h1>
      <p className="text-muted-foreground mb-6">
        Current low stock alerts
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
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
                alerts.map(alert => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.id}</TableCell>
                    <TableCell>{alert.product_name}</TableCell>
                    <TableCell>
                      <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.alert_type}</TableCell>
                    <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
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
