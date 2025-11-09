import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alerts } from "@/data/dummyData";

export function AlertsTable() {
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
              <TableHead>Current Stock</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Suggested Order</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const isLow = alert.currentStock < alert.threshold * 0.5;
              return (
                <TableRow key={alert.id} className={isLow ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">{alert.productName}</TableCell>
                  <TableCell>
                    <span className={isLow ? "text-destructive font-semibold" : "text-warning font-semibold"}>
                      {alert.currentStock}
                    </span>
                  </TableCell>
                  <TableCell>{alert.threshold}</TableCell>
                  <TableCell className="font-semibold text-primary">{alert.suggestedOrder}</TableCell>
                  <TableCell>
                    <Badge variant={alert.status === "Pending" ? "destructive" : "default"}>
                      {alert.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
