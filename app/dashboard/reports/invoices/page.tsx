import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, DollarSign, Clock, CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export default async function InvoiceReportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Get date ranges
  const now = new Date();
  const currentMonthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const currentMonthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  // Get all invoices with place info
  let invoicesQuery = supabase
    .from("invoices")
    .select(`
      *,
      place:places(id, name, city, branch_id)
    `)
    .order("invoice_date", { ascending: false });

  const { data: allInvoices } = await invoicesQuery;

  // Filter by branch for branch_admin
  let invoices = allInvoices || [];
  if (profile.role === "branch_admin" && profile.branch_id) {
    invoices = invoices.filter(
      (inv) => (inv.place as { branch_id: string })?.branch_id === profile.branch_id
    );
  }

  // Calculate stats
  const currentMonthInvoices = invoices.filter(
    (inv) => inv.invoice_date >= currentMonthStart && inv.invoice_date <= currentMonthEnd
  );

  const totalInvoices = invoices.length;
  const draftCount = invoices.filter((i) => i.status === "draft").length;
  const sentCount = invoices.filter((i) => i.status === "sent").length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const totalBilled = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const totalPending = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const currentMonthBilled = currentMonthInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const currentMonthPaid = currentMonthInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.total || 0), 0);

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    sent: "secondary",
    paid: "default",
    overdue: "destructive",
    cancelled: "destructive",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get top clients by revenue
  const clientRevenue = invoices.reduce((acc, inv) => {
    const place = inv.place as { id: string; name: string; city: string } | null;
    if (place) {
      const key = place.id;
      if (!acc[key]) {
        acc[key] = { name: place.name, city: place.city, total: 0, paid: 0, count: 0 };
      }
      acc[key].total += inv.total || 0;
      if (inv.status === "paid") {
        acc[key].paid += inv.total || 0;
      }
      acc[key].count += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; city: string; total: number; paid: number; count: number }>);

  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Report</h1>
          <p className="text-muted-foreground">
            Summary of invoices and revenue
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBilled)}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoices} invoices total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {paidCount} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {sentCount + overdueCount} awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthBilled)}</div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Breakdown</CardTitle>
          <CardDescription>Distribution of invoices by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold">{draftCount}</div>
              <div className="text-sm text-muted-foreground">Draft</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{sentCount}</div>
              <div className="text-sm text-blue-600">Sent</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{paidCount}</div>
              <div className="text-sm text-green-600">Paid</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-sm text-red-600">Overdue</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{totalInvoices}</div>
              <div className="text-sm text-purple-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
          <CardDescription>Highest revenue generating clients</CardDescription>
        </CardHeader>
        <CardContent>
          {topClients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead className="text-right">Total Billed</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Collection Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.city}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{client.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(client.total)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(client.paid)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={client.total > 0 && client.paid / client.total >= 0.8 ? "default" : "secondary"}>
                        {client.total > 0 ? Math.round((client.paid / client.total) * 100) : 0}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No invoice data available yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest 10 invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 10).map((invoice) => {
                  const place = invoice.place as { name: string; city: string } | null;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link 
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{place?.name}</div>
                          <div className="text-xs text-muted-foreground">{place?.city}</div>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(invoice.invoice_date), "PP")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
