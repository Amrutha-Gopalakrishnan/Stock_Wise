import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/supabaseClient";

export function AlertsTable() {
  const [alerts, setAlerts] = useState([]);
  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("id, alert_type, status, created_at, products(name)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading alerts:", error);
      return;
    }
    setAlerts(data || []);
  };

  useEffect(() => {
    fetchAlerts();

    const sub = supabase
      .channel("alerts_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        (payload) => {
          // console.log("alerts change", payload);
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reorder Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts && alerts.length > 0 ? (
              alerts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.products?.name ?? "Unknown"}</TableCell>
                  <TableCell className="capitalize">{a.alert_type}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "active" ? "destructive" : "secondary"}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">No active alerts</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
