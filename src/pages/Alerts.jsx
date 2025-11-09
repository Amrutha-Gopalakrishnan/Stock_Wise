import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alerts } from "@/data/dummyData";
import { toast } from "sonner";

export default function Alerts() {
  const handleResolve = (alertId) => {
    toast.success("Alert marked as resolved!");
    // You can add further alert-resolving logic here
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Alerts</h1>
      <p className="text-muted-foreground mb-6">
        Monitor and manage low stock alerts
      </p>
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
              {alerts.map(alert => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.id}</TableCell>
                  <TableCell>{alert.product}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{alert.status}</Badge>
                  </TableCell>
                  <TableCell>{alert.stock}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                      Mark as resolved
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
