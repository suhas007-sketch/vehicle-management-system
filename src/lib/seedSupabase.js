import { supabase } from "./supabase";

const carsData = [
    { name: "Scorpio N", brand: "Mahindra", category: "Car", subtype: "SUV", price_per_day: 3500, image_url: "https://images.unsplash.com/photo-1695713437537-8846c4f0b094", fuel_type: "Diesel", transmission: "Auto", booking_count: 450 },
    { name: "Harrier", brand: "Tata", category: "Car", subtype: "SUV", price_per_day: 3200, image_url: "https://images.unsplash.com/photo-1627451296061-042898491c9f", fuel_type: "Diesel", transmission: "Manual", booking_count: 280 },
    { name: "Creta", brand: "Hyundai", category: "Car", subtype: "SUV", price_per_day: 2800, image_url: "https://images.unsplash.com/photo-1663189914902-6cdd9493f0b2", fuel_type: "Petrol", transmission: "Auto", booking_count: 320 },
    { name: "Fortuner", brand: "Toyota", category: "Car", subtype: "SUV", price_per_day: 6500, image_url: "https://images.unsplash.com/photo-1618015525501-16d5be9b1585", fuel_type: "Diesel", transmission: "Auto", booking_count: 150 },
    { name: "Thar", brand: "Mahindra", category: "Car", subtype: "SUV", price_per_day: 3000, image_url: "https://images.unsplash.com/photo-1613941459207-68041530e70b", fuel_type: "Petrol", transmission: "Manual", booking_count: 500 },
    { name: "XUV700", brand: "Mahindra", category: "Car", subtype: "SUV", price_per_day: 4000, image_url: "https://images.unsplash.com/photo-1692348573428-66d5af94c489", fuel_type: "Petrol", transmission: "Auto", booking_count: 380 },
    { name: "City", brand: "Honda", category: "Car", subtype: "Sedan", price_per_day: 2500, image_url: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9", fuel_type: "Petrol", transmission: "Auto", booking_count: 210 },
    { name: "Swift", brand: "Maruti Suzuki", category: "Car", subtype: "Hatchback", price_per_day: 1500, image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7", fuel_type: "Petrol", transmission: "Manual", booking_count: 620 },
    { name: "3 Series", brand: "BMW", category: "Car", subtype: "Luxury", price_per_day: 9500, image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e", fuel_type: "Petrol", transmission: "Auto", booking_count: 85 }
];

const bikesData = [
    { name: "Himalayan 450", brand: "Royal Enfield", category: "Bike", subtype: "Adventure", price_per_day: 1500, image_url: "https://images.unsplash.com/photo-1606558485292-67853173d15a", fuel_type: "Petrol", transmission: "Manual", booking_count: 410 },
    { name: "Classic 350", brand: "Royal Enfield", category: "Bike", subtype: "Cruiser", price_per_day: 1200, image_url: "https://images.unsplash.com/photo-1635073908865-ec754859a5d4", fuel_type: "Petrol", transmission: "Manual", booking_count: 580 },
    { name: "Duke 390", brand: "KTM", category: "Bike", subtype: "Sports", price_per_day: 1800, image_url: "https://images.unsplash.com/photo-1615172282427-9a57ef2d142e", fuel_type: "Petrol", transmission: "Manual", booking_count: 340 }
];

const scootiesData = [
    { name: "Activa 6G", brand: "Honda", category: "Scooty", subtype: "Family", price_per_day: 700, image_url: "https://images.unsplash.com/photo-1632313364951-8e5033c467a3", fuel_type: "Petrol", transmission: "Manual", booking_count: 850 },
    { name: "S1 Pro", brand: "Ola Electric", category: "Scooty", subtype: "Electric", price_per_day: 800, image_url: "https://images.unsplash.com/photo-1662993098380-60b81f18fc69", fuel_type: "Electric", transmission: "Auto", booking_count: 420 }
];

export const seedSupabase = async () => {
    try {
        console.log("Starting Supabase Seeding...");
        
        // 1. Check if vehicles exist
        const { count, error: checkError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true });
        
        if (checkError) {
             console.warn("Could not check vehicles (maybe table doesn't exist yet):", checkError);
             return;
        }

        if (count && count > 10) {
            console.log("Supabase already seeded.");
            return;
        }


        const allTemplates = [...carsData, ...bikesData, ...scootiesData];
        const toInsert = [];

        allTemplates.forEach(template => {
            for(let i=0; i<2; i++) {
                toInsert.push({
                    ...template,
                    status: Math.random() > 0.8 ? 'rented' : 'available',
                    price_per_day: template.price_per_day + (Math.random() * 200 - 100),
                    booking_count: template.booking_count + Math.floor(Math.random() * 50),
                    created_at: new Date().toISOString()
                });
            }
        });

        const { error: insertError } = await supabase
            .from('vehicles')
            .insert(toInsert);

        if (insertError) throw insertError;
        
        console.log("Supabase Seeding Complete!");
        return true;
    } catch (error) {
        console.error("Supabase Seeding Failed:", error);
        return false;
    }
};
