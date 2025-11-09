import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions } from "@/data/dummyData";

export function TransactionsTable() {
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
            {transactions.slice(0, 5).map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.productName}</TableCell>
                <TableCell>
                  <span className={transaction.quantity > 0 ? "text-success" : "text-foreground"}>
                    {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.reason === "Purchase"
                        ? "default"
                        : transaction.reason === "Sale"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {transaction.reason}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
