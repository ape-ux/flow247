import { Users, Plus, Search, Filter, Mail, Phone, Building2, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCustomers } from '@/hooks/useXanoQuery';
import type { Customer } from '@/lib/xano';

export default function CustomersPage() {
  const { data, isLoading: loading, refetch } = useCustomers({ limit: 50 });
  const customers: Customer[] = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">Manage your customer relationships</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button className="gradient-primary glow-cyan">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Customers', value: loading ? '-' : String(customers.length), color: 'text-primary' },
          { label: 'With Email', value: loading ? '-' : String(customers.filter(c => c.email).length), color: 'text-green-400' },
          { label: 'With Company', value: loading ? '-' : String(customers.filter(c => c.company).length), color: 'text-purple-400' },
          { label: 'Recent (30d)', value: loading ? '-' : String(customers.filter(c => {
            if (!c.created_at) return false;
            const d = new Date(c.created_at);
            const ago = Date.now() - d.getTime();
            return ago < 30 * 24 * 60 * 60 * 1000;
          }).length), color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or ID..."
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl animate-slide-up">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer, i) => (
                <TableRow
                  key={customer.id}
                  className="animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${(i + 4) * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {customer.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {customer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email || '-'}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.company ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {customer.company}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
