import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Filter, Plus, Edit3, Trash2, LayoutGrid, List, Flame, Search as SearchIcon, IndianRupee, Hammer, RotateCcw, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';
import VehicleModal from '../components/ui/VehicleModal';
import BookingModal from '../components/ui/BookingModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { VehicleCardSkeleton } from '../components/ui/SkeletonLoaders';
import { EmptyState } from '../components/ui/EmptyState';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import toast from 'react-hot-toast';
import { vehicleService } from '../services/vehicleService';
import { formatINR } from '../lib/formatters';


const CATEGORIES = {
    'Car': ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury', 'Electric', 'Sports'],
    'Bike': ['Standard', 'Sports', 'Cruiser', 'Commuter', 'Adventure', 'Electric'],
    'Scooty': ['Standard', 'Electric', 'Performance', 'Family']
};

export default function Vehicles() {
  const [vehiclesData, setVehiclesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState(null);
  
  const [viewMode, setViewMode] = useState('grid');
  
  // Confirm Dialog State
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [subtypeFilter, setSubtypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });


  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll();
      setVehiclesData(data);
    } catch (error) {
      console.error('Error fetching vehicles', error);
      toast.error('Failed to load Indian fleet');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setIsDeleting(true);
    try {
        await vehicleService.delete(confirmDelete.id);
        toast.success('Vehicle removed from fleet');
        fetchVehicles();
        setConfirmDelete({ isOpen: false, id: null });
    } catch (err) {
        toast.error('Could not delete vehicle');
    } finally {
        setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
      const loadingToast = toast.loading(`Updating status to ${status}...`);
      try {
          await vehicleService.updateStatus(id, status);
          toast.success(`Vehicle marked as ${status}`, { id: loadingToast });
          fetchVehicles();
      } catch (err) {
          toast.error('Failed to update status', { id: loadingToast });
      }
  };

  const handleReturnAction = async (id) => {
    const loadingToast = toast.loading('Processing vehicle return...');
    try {
        await vehicleService.updateStatus(id, 'available');
        toast.success('Vehicle successfully returned to fleet', { id: loadingToast });
        fetchVehicles();
    } catch (err) {
        toast.error('Failed to return vehicle', { id: loadingToast });
    }
  };


  const openBooking = (vehicle) => {
      setSelectedVehicleForBooking(vehicle);
      setIsBookingModalOpen(true);
  };

  const handleEdit = (vehicle) => {
      setEditingVehicle(vehicle);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingVehicle(null);
  };

  // Advanced Frontend Filtering Logic
  const filteredVehicles = useMemo(() => {
    return vehiclesData.filter(v => {
      const name = v.name || '';
      const brand = v.brand || '';
      const matchesSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
      const matchesSubtype = subtypeFilter === 'All' || v.subtype === subtypeFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      
      const val = v.price_per_day;
      const matchesMin = priceRange.min === '' || val >= Number(priceRange.min);
      const matchesMax = priceRange.max === '' || val <= Number(priceRange.max);
      
      return matchesSearch && matchesCategory && matchesSubtype && matchesStatus && matchesMin && matchesMax;
    });
  }, [vehiclesData, searchTerm, categoryFilter, subtypeFilter, statusFilter, priceRange]);

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-textMain">Indian <span className="text-primary">Fleet</span></h1>
          <p className="text-textMuted mt-1 text-xs font-bold uppercase tracking-widest">Managing {vehiclesData.length} active machines across the country.</p>
        </div>
        <div className="flex gap-2 items-center">
            <Button className="h-12 px-6 rounded-2xl shadow-glow gap-2" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5" /> <span className="font-extrabold italic uppercase tracking-wider">Add Vehicle</span>
            </Button>
        </div>
      </div>


      {/* Advanced Filter Panel */}
      <div className="glass rounded-[32px] p-8 border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Filter className="w-32 h-32" />
          </div>

          <div className="flex flex-wrap gap-6 items-center">
              <div className="relative group flex-1 min-w-[300px]">
                  <input 
                      type="text" 
                      placeholder="Search by brand or model (e.g. Thar, Interceptor)..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all pl-14 font-bold"
                  />
                  <SearchIcon className="w-6 h-6 text-textMuted absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              </div>
              
              <div className="flex gap-2 items-center bg-surface border border-white/10 rounded-2xl p-1.5 shadow-inner">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-glow' : 'text-textMuted hover:text-textMain hover:bg-white/5'}`}><LayoutGrid className="w-5 h-5"/></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-glow' : 'text-textMuted hover:text-textMain hover:bg-white/5'}`}><List className="w-5 h-5"/></button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-end border-t border-white/5 pt-8 pl-4 pr-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted ml-1">Fleet Category</label>
                <select 
                    value={categoryFilter} 
                    onChange={e => {setCategoryFilter(e.target.value); setSubtypeFilter('All');}}
                    className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-all cursor-pointer font-bold appearance-none"
                >
                    <option value="All">All Categories</option>
                    {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted ml-1">Machine Subtype</label>
                    <select 
                        value={subtypeFilter} 
                        onChange={e => setSubtypeFilter(e.target.value)}
                        disabled={categoryFilter === 'All'}
                        className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-all cursor-pointer font-bold appearance-none disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <option value="All">All {categoryFilter !== 'All' ? categoryFilter : ''} Subtypes</option>
                        {categoryFilter !== 'All' && CATEGORIES[categoryFilter].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
              </div>

              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted ml-1">Price Bracket (₹)</label>
                  <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" value={priceRange.min} onChange={e=>setPriceRange({...priceRange, min: e.target.value})} className="flex-1 min-w-0 w-full bg-surface border border-white/10 rounded-2xl px-4 py-3 text-xs text-textMain placeholder:text-textMuted/30 focus:outline-none focus:border-primary font-bold" />
                      <span className="text-textMuted text-xs font-black">TO</span>
                      <input type="number" placeholder="Max" value={priceRange.max} onChange={e=>setPriceRange({...priceRange, max: e.target.value})} className="flex-1 min-w-0 w-full bg-surface border border-white/10 rounded-2xl px-4 py-3 text-xs text-textMain placeholder:text-textMuted/30 focus:outline-none focus:border-primary font-bold" />
                  </div>
              </div>

              <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted ml-1">Operational Status</label>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-all cursor-pointer font-bold appearance-none"
                    >
                        <option value="All">Any Status</option>
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
              </div>
          </div>
          
          <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" className="text-[10px] text-textMuted font-black uppercase tracking-[0.2em] hover:text-primary" onClick={() => {
                  setCategoryFilter('All'); setSubtypeFilter('All'); setStatusFilter('All'); setPriceRange({min:'', max:''}); setSearchTerm('');
              }}>Reset Logistics</Button>
          </div>
      </div>


      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
            ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <EmptyState 
            title="Operational Vacuum"
            description="No machines match your current deployment filters. Try broader search parameters."
            buttonText="Reset All Filters"
            onButtonClick={() => {setCategoryFilter('All'); setSubtypeFilter('All'); setStatusFilter('All'); setPriceRange({min:'', max:''}); setSearchTerm('');}}
            icon={Filter}
        />
      ) : (

        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" : "space-y-4"}>
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} hover={viewMode === 'grid'} className={`group overflow-hidden flex flex-col h-full border-white/5 bg-surface-dark/40 rounded-[32px] ${viewMode === 'list' && "md:flex-row md:h-36"}`}>
              <div className={`relative overflow-hidden ${viewMode === 'grid' ? "h-52 w-full" : "w-full md:w-80 h-full border-r border-white/5"}`}>
                <ImageWithFallback 
                  src={vehicle.image_url} 
                  alt={vehicle.name} 
                  className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-[0.1em] border shadow-2xl backdrop-blur-xl ${
                    vehicle.status === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    vehicle.status === 'rented' ? 'bg-primary/10 text-primary border-primary/20' : 
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
              </div>
              
              <CardContent className={`relative z-20 flex-1 flex flex-col justify-between ${viewMode === 'grid' ? "p-6" : "p-8 flex-row items-center w-full"}`}>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] text-textMuted uppercase font-black tracking-[0.2em] mb-1">{vehicle.brand}</p>
                        <h3 className="font-black text-xl text-textMain group-hover:text-primary transition-colors line-clamp-1 italic tracking-tight">{vehicle.name}</h3>
                    </div>
                    {viewMode === 'grid' && (
                        <div className="text-right">
                            <p className="text-xl font-black text-textMain italic leading-none">{formatINR(vehicle.price_per_day)}</p>
                            <p className="text-[10px] text-textMuted uppercase font-black mt-1 opacity-40">PER DAY</p>
                        </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <p className="text-[10px] text-textMuted uppercase font-black tracking-widest">{vehicle.subtype}</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
                          <p className="text-[10px] text-textMuted uppercase font-black tracking-widest">{vehicle.fuel_type}</p>
                      </div>
                  </div>
                </div>
                
                {viewMode === 'list' && (
                     <div className="text-center px-12 shrink-0 border-x border-white/5">
                        <p className="text-3xl font-black text-textMain italic leading-none">{formatINR(vehicle.price_per_day)}</p>
                        <p className="text-[10px] text-textMuted uppercase font-black mt-2 tracking-widest opacity-40">DAILY RATE</p>
                    </div>
                )}

                <div className={`flex items-center gap-3 ${viewMode === 'grid' ? "mt-8 pt-6 border-t border-white/5" : "pl-12"}`}>
                    <div className="flex-1 flex gap-2">
                        {vehicle.status === 'available' ? (
                            <Button size="sm" className="flex-1 h-11 rounded-2xl gap-2 shadow-glow" onClick={() => openBooking(vehicle)}>
                                <CalendarCheck className="w-4 h-4" /> <span className="font-extrabold italic uppercase tracking-wider">Book Now</span>
                            </Button>
                        ) : vehicle.status === 'rented' ? (
                            <Button size="sm" variant="outline" className="flex-1 h-11 rounded-2xl gap-2 border-primary/20 text-primary hover:bg-primary/10" onClick={() => handleReturnAction(vehicle.id)}>
                                <RotateCcw className="w-4 h-4" /> <span className="font-extrabold italic uppercase tracking-wider">Process Return</span>
                            </Button>
                        ) : (
                            <Button size="sm" variant="ghost" className="flex-1 h-11 rounded-2xl gap-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" onClick={() => handleUpdateStatus(vehicle.id, 'available')}>
                                <span className="font-extrabold italic uppercase tracking-wider">Restore Service</span>
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="w-11 h-11 p-0 text-textMuted hover:text-textMain hover:bg-white/5 border border-white/10 rounded-2xl transition-all" onClick={() => handleEdit(vehicle)} title="Edit Machine Specs">
                            <Edit3 className="w-4 h-4" />
                        </Button>
                        {vehicle.status === 'available' && (
                            <Button variant="ghost" size="sm" className="w-11 h-11 p-0 text-textMuted hover:text-amber-500 hover:bg-amber-500/5 border border-white/10 rounded-2xl transition-all" onClick={() => handleUpdateStatus(vehicle.id, 'maintenance')} title="Send to Maintenance">
                                <Hammer className="w-4 h-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="w-11 h-11 p-0 text-textMuted hover:text-red-500 hover:bg-red-500/10 border border-white/10 rounded-2xl transition-all" onClick={() => setConfirmDelete({ isOpen: true, id: vehicle.id })} title="Decommission Machine">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals & Dialogs */}
      <ConfirmDialog 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Decommission Machine"
        message="Are you sure you want to permanently remove this machine from the active Indian fleet? This action is tracked and cannot be undone."
        confirmText="Confirm Deletion"
      />

      
      {selectedVehicleForBooking && (
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => {setIsBookingModalOpen(false); setSelectedVehicleForBooking(null);}}
            onBookingAdded={fetchVehicles}
            preSelectedVehicle={selectedVehicleForBooking}
          />
      )}

      {isModalOpen && (
          <VehicleModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            vehicleToEdit={editingVehicle}
            onVehicleAdded={fetchVehicles}
            onVehicleUpdated={fetchVehicles}
          />
      )}
    </PageTransition>
  );
}
