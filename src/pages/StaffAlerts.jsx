import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { alerts } from "@/data/dummyData";

export default function StaffAlerts() {
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
                <TableHead>Stock</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
