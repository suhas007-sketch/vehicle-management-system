import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Car, CreditCard, CalendarRange, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';

const data = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const kpiData = [
  { title: 'Total Vehicles', value: '142', icon: Car, trend: '+12%' },
  { title: 'Active Rentals', value: '89', icon: CalendarRange, trend: '+5%' },
  { title: 'Revenue', value: '$24,500', icon: CreditCard, trend: '+18%' },
  { title: 'Availability', value: '92%', icon: TrendingUp, trend: '+2%' },
];

const recentBookings = [
  { id: 'BK-1024', customer: 'Alex Johnson', vehicle: 'Tesla Model S', date: 'Oct 12', status: 'Active' },
  { id: 'BK-1025', customer: 'Sarah Connor', vehicle: 'Porsche 911', date: 'Oct 14', status: 'Pending' },
  { id: 'BK-1026', customer: 'John Smith', vehicle: 'BMW M4', date: 'Oct 15', status: 'Active' },
  { id: 'BK-1027', customer: 'Emma Watson', vehicle: 'Mercedes G-Class', date: 'Oct 10', status: 'Completed' },
];

export default function Dashboard() {
  return (
    <PageTransition className="space-y-8">
      {/* Hero / Welcome */}
      <div className="relative rounded-3xl overflow-hidden glass p-10 mt-2">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Good morning, Admin.</h1>
          <p className="text-textMuted max-w-xl text-lg mb-6">Here is what's happening with your fleet today. Revenue is up 18% from last week, keep it up!</p>
          <div className="flex gap-4">
            <Button>Add Vehicle</Button>
            <Button variant="outline">New Booking</Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, i) => (
          <Card key={i} hover>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-surface rounded-xl flex items-center justify-center">
                  <kpi.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-full">{kpi.trend}</span>
              </div>
              <p className="text-textMuted text-sm font-medium">{kpi.title}</p>
              <h4 className="text-3xl font-bold mt-1 text-textMain">{kpi.value}</h4>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-5 flex justify-between items-center hover:bg-surface/50 transition-colors cursor-pointer">
                  <div>
                    <h5 className="font-medium text-textMain">{booking.customer}</h5>
                    <p className="text-sm text-textMuted">{booking.vehicle}</p>
                  </div>
                  <div className="text-right flex flex-col justify-end items-end">
                    <p className="text-sm text-textMuted mb-1">{booking.date}</p>
                    <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                      booking.status === 'Active' ? 'bg-primary/10 text-primary' : 
                      booking.status === 'Pending' ? 'bg-amberLight/10 text-amberLight' : 
                      'bg-green-400/10 text-green-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
