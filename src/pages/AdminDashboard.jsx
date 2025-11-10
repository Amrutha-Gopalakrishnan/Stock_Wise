import { Package, DollarSign, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsTable } from "@/components/dashboard/AlertsTable";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { products, alerts, categoryData } from "@/data/dummyData";

export default function AdminDashboard() {
  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const activeAlerts = alerts.length;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Monitor your inventory and alerts
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
        />
        <StatCard
          title="Stock Value"
          value={
            <span>
              ₹{totalStockValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          }
          icon={DollarSign}
          iconClassName="text-green-500"
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts}
          icon={AlertTriangle}
          iconClassName="text-destructive"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#6366f1" name="Stock" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsTable data={alerts.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
