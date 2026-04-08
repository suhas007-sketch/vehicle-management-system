import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { profileService } from '../services/profileService';

export const getVehicles = async (onlyAvailable = false) => {
    if (onlyAvailable) return await vehicleService.getRecommended();
    return await vehicleService.getAll();
};

export const addVehicle = async (vehicleData) => {
    return await vehicleService.create(vehicleData);
};

export const updateVehicle = async (id, data) => {
    return await vehicleService.update(id, data);
};

export const deleteVehicle = async (id) => {
    return await vehicleService.delete(id);
};

export const bookVehicle = async (id, bookingData) => {
    return await bookingService.create(id, bookingData);
};

export const updateVehicleStatus = async (id, status) => {
    return await vehicleService.updateStatus(id, status);
};

export const getStats = async () => {
    return await vehicleService.getStats();
};

export const getBookings = async () => {
    return await bookingService.getAll();
};

export const getCustomers = async () => {
    const profiles = await profileService.getAll();
    return profiles.map(u => ({
        ...u,
        name: u.full_name || u.email,
        bookings: 0, // Should be calculated if needed
        status: 'Regular'
    }));
};

const api = {
    get: async (path) => {
        if (path === '/vehicles') return { data: await getVehicles() };
        if (path === '/vehicles?status=available') return { data: await getVehicles(true) };
        if (path === '/bookings') return { data: await getBookings() };
        if (path === '/customers') return { data: await getCustomers() };
        if (path === '/stats') return { data: await getStats() };
        throw new Error(`Path ${path} not implemented for Supabase`);
    },
    post: async (path, data) => {
        if (path === '/vehicles') return { data: await addVehicle(data) };
        throw new Error(`Path ${path} not implemented for Supabase`);
    },
    put: async (path, data) => {
        const statusMatch = path.match(/\/vehicles\/(.+)\/status/);
        if (statusMatch) return { data: await updateVehicleStatus(statusMatch[1], data.status) };
        
        const returnMatch = path.match(/\/vehicles\/(.+)\/return/);
        if (returnMatch) return { data: await updateVehicleStatus(returnMatch[1], 'available') };

        const bookMatch = path.match(/\/vehicles\/(.+)\/book/);
        if (bookMatch) return { data: await bookVehicle(bookMatch[1], data) };

        const vehicleMatch = path.match(/\/vehicles\/(.+)/);
        if (vehicleMatch) return { data: await updateVehicle(vehicleMatch[1], data) };

        throw new Error(`Path ${path} not implemented for Supabase`);
    },
    delete: async (path) => {
        const vehicleMatch = path.match(/\/vehicles\/(.+)/);
        if (vehicleMatch) return { data: await deleteVehicle(vehicleMatch[1]) };
        throw new Error(`Path ${path} not implemented for Supabase`);
    }
};

export default api;
