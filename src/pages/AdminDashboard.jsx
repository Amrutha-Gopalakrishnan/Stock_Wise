
import React, { useEffect, useState } from "react";
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
import { supabase } from "@/supabaseClient";
import { localDb } from "@/lib/localDb";
import { categoryData, alerts as dummyAlerts } from "@/data/dummyData";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState(dummyAlerts); // You can replace with fetched alerts later

  // Load products and subscribe to realtime updates from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
            id,
            name,
            sku,
            unit_price,
            stock_levels (
              current_quantity
            )
          `
        )
        .order("name");
      if (error) {
        console.error("Error loading products:", error);
      } else {
        const normalised = (data || []).map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          unit_price: product.unit_price,
          category_name: product?.categories?.name ?? "—",
          supplier_name: product?.suppliers?.name ?? "—",
          current_quantity: product?.stock_levels?.current_quantity ?? 0,
        }));
        localDb.saveProducts(normalised);
      }
      setProducts(
        localDb.getProducts().map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          unit_price: product.unit_price,
          current_quantity: product?.current_quantity ?? 0,
        })),
      );
    };

    loadProducts();

    const sub = supabase
      .channel("products_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        loadProducts
      )
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  // Compute dashboard stats using loaded products and alerts
  const totalProducts = products.length;
  const totalStockValue = products.reduce((sum, p) => {
    const quantity = p.current_quantity ?? 0;
    return sum + (p.unit_price || 0) * quantity;
  }, 0);
  const activeAlerts = alerts.length;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Monitor your inventory and alerts
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Products" value={totalProducts} icon={Package} />
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
