import React from 'react';
import { Filter, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';

const vehiclesData = [
  { id: 1, name: 'Tesla Model S Plaid', type: 'Electric', price: '$150/day', status: 'Available', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'Porsche 911 GT3', type: 'Sports', price: '$250/day', status: 'Rented', image: 'https://images.unsplash.com/photo-1503376712349-80a5bf2b02fe?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'Mercedes G63 AMG', type: 'SUV', price: '$300/day', status: 'Available', image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'BMW M4 Competition', type: 'Sports', price: '$200/day', status: 'Maintenance', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop' },
  { id: 5, name: 'Audi RS6 Avant', type: 'Wagon', price: '$180/day', status: 'Available', image: 'https://images.unsplash.com/photo-1606131731422-b5e197d1b315?q=80&w=800&auto=format&fit=crop' },
  { id: 6, name: 'Range Rover Sport', type: 'SUV', price: '$190/day', status: 'Available', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop' },
];

export default function Vehicles() {
  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-textMuted mt-1">Manage your vehicles, pricing, and availability.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehiclesData.map((vehicle) => (
          <Card key={vehicle.id} hover className="group overflow-hidden flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute top-4 left-4 z-20">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  vehicle.status === 'Available' ? 'bg-green-400/20 text-green-400 border border-green-400/20' : 
                  vehicle.status === 'Rented' ? 'bg-primary/20 text-primary border border-primary/20' : 
                  'bg-red-400/20 text-red-400 border border-red-400/20'
                }`}>
                  {vehicle.status}
                </span>
              </div>
            </div>
            
            <CardContent className="p-5 flex-1 flex flex-col relative z-20 -mt-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-textMain group-hover:text-primary transition-colors">{vehicle.name}</h3>
              </div>
              <p className="text-sm text-textMuted mb-4">{vehicle.type}</p>
              
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/50">
                <span className="text-lg font-bold text-textMain">{vehicle.price}</span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTransition>
  );
}
