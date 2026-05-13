
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Package, Users, AlertCircle, ChevronLeft, Download } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const ACTIVITY_DATA = [
  { time: '08:00', borrowings: 12 },
  { time: '10:00', borrowings: 45 },
  { time: '12:00', borrowings: 32 },
  { time: '14:00', borrowings: 56 },
  { time: '16:00', borrowings: 28 },
];

const RECENT_LOGS = [
  { id: 'TX001', user: 'Alex Johnson', items: '2x Beaker, 1x Stirrer', time: '10:45 AM', status: 'Active', deadline: 'Today 5PM' },
  { id: 'TX002', user: 'Sarah Miller', items: '1x Microscope', time: '09:30 AM', status: 'Returned', deadline: '-' },
  { id: 'TX003', user: 'David Chen', items: '3x Flasks, 1x Rack', time: '09:15 AM', status: 'Active', deadline: 'Today 5PM' },
  { id: 'TX004', user: 'Emily White', items: '1x Bunsen Burner', time: 'Yesterday', status: 'Late', deadline: 'Yesterday 5PM' },
];

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-full" onClick={() => router.push('/')}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Activity Ledger</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button className="orange-gradient border-none font-bold">Manage Inventory</Button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Borrows', value: '42', icon: Activity, color: 'text-primary' },
          { label: 'Total Items', value: '840', icon: Package, color: 'text-secondary' },
          { label: 'Enrolled Users', value: '1,248', icon: Users, color: 'text-blue-500' },
          { label: 'Late Returns', value: '3', icon: AlertCircle, color: 'text-orange-500' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 bg-slate-100 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Borrowing Trends (Today)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="borrowings" stroke="#2D46B9" strokeWidth={4} dot={{ r: 6, fill: '#2D46B9' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Glass', val: 400 },
                  { name: 'Heat', val: 120 },
                  { name: 'Tools', val: 300 },
                  { name: 'Optics', val: 80 },
                ]}>
                  <XAxis dataKey="name" />
                  <Bar dataKey="val" fill="#2DB2B9" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cloud Transaction Ledger</CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Live Sync Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Transaction ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Apparatus</TableHead>
                <TableHead>Borrowed At</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_LOGS.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-xs font-bold">{log.id}</TableCell>
                  <TableCell className="font-semibold">{log.user}</TableCell>
                  <TableCell className="text-slate-500">{log.items}</TableCell>
                  <TableCell>{log.time}</TableCell>
                  <TableCell>{log.deadline}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        log.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                        log.status === 'Returned' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }
                    >
                      {log.status}
                    </Badge>
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
