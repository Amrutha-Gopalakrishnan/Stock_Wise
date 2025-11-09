import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions } from "@/data/dummyData";

export default function StaffActivity() {
  const userTransactions = transactions.filter((t) => t.user !== "Admin");

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Staff Activity</h1>
      <p className="text-muted-foreground mb-6">
        View your transaction history
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
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.action === "add" ? "primary" : "destructive"}>
                      {transaction.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
