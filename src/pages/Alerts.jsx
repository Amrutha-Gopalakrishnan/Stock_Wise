// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { alerts } from "@/data/dummyData";
// import { toast } from "sonner";

// export default function Alerts() {
//   const handleResolve = (alertId) => {
//     toast.success("Alert marked as resolved!");
//     // You can add further alert-resolving logic here
//   };

//   return (
//     <div>
//       <h1 className="text-4xl font-bold mb-2">Alerts</h1>
//       <p className="text-muted-foreground mb-6">
//         Monitor and manage low stock alerts
//       </p>
//       <Card>
//         <CardHeader>
//           <CardTitle>Active Alerts</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>ID</TableHead>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Stock</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {alerts.map(alert => (
//                 <TableRow key={alert.id}>
//                   <TableCell>{alert.id}</TableCell>
//                   <TableCell>{alert.product}</TableCell>
//                   <TableCell>
//                     <Badge variant="destructive">{alert.status}</Badge>
//                   </TableCell>
//                   <TableCell>{alert.stock}</TableCell>
//                   <TableCell>
//                     <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
//                       Mark as resolved
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase, getCurrentUserId } from "@/supabaseClient"; // adjust path as needed

// Sample alerts data - replace with fetching from Supabase
const dummyAlerts = [
  // Example alert objects
  {
    id: 1,
    product: "Product A",
    status: "active",
    stock: 5,
  },
  {
    id: 2,
    product: "Product B",
    status: "active",
    stock: 0,
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(dummyAlerts);

  // Form state for creating an alert
  const [alertProductId, setAlertProductId] = useState("");
  const [alertType, setAlertType] = useState("low_stock"); // can be low_stock, out_of_stock, reorder

  // Create alert handler
  async function handleCreateAlert(e) {
    e.preventDefault();
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

      // Optionally refresh alerts list here (fetchAlerts)

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
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, status: "resolved" } : alert
        )
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
            type="text"
            value={alertProductId}
            onChange={e => setAlertProductId(e.target.value)}
            required
          />
        </label>
        <label>
          Alert Type:
          <select
            className="block w-full border rounded p-2"
            value={alertType}
            onChange={e => setAlertType(e.target.value)}
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
                    No alerts available
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map(alert => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.id}</TableCell>
                    <TableCell>{alert.product}</TableCell>
                    <TableCell>
                      <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.stock}</TableCell>
                    <TableCell>
                      {alert.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                          Mark as resolved
                        </Button>
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
