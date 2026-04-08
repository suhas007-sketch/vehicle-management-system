from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, origins="*")

# Always resolve DB path relative to this file, regardless of cwd
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, 'vrms.db')

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # To start fresh with the new schema (Brand, Fuel, etc.), we'll wipe the old DB if needed
    # (Or just check if the columns exist, but a wipe is cleaner for this overhaul)
    # os.remove(DB_NAME) if os.path.exists(DB_NAME) else None
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Vehicles Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            category TEXT NOT NULL,
            subtype TEXT NOT NULL,
            price_per_day REAL NOT NULL,
            image_url TEXT NOT NULL,
            status TEXT DEFAULT 'available',
            booking_count INTEGER DEFAULT 0,
            fuel_type TEXT DEFAULT 'Petrol',
            transmission TEXT DEFAULT 'Manual',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Bookings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            vehicle_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
        )
    ''')
    
    # User Profile Sync
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            uid TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            role TEXT DEFAULT 'user'
        )
    ''')

    # Seed 120+ Vehicles if empty or schema updated
    cursor.execute('SELECT COUNT(*) FROM vehicles')
    count = cursor.fetchone()[0]
    if count < 100: 
        print("Initializing high-density Indian vehicle fleet...")
        cursor.execute('BEGIN TRANSACTION')
        cursor.execute('DELETE FROM vehicles')
        cursor.execute('DELETE FROM bookings')
        seed_vehicles(cursor)
        cursor.execute('COMMIT')
        print("Fleet successfully deployed.")
        
    conn.commit()
    conn.close()

def seed_vehicles(cursor):
    # Realistic Indian Vehicle Dataset
    # Each Tuple: (Name, Brand, Category, Subtype, BasePrice, ImageURL, Fuel, Transmission)
    
    cars_data = [
        # SUVs
        ("Scorpio N", "Mahindra", "Car", "SUV", 3500, "https://images.unsplash.com/photo-1695713437537-8846c4f0b094", "Diesel", "Auto"),
        ("Harrier", "Tata", "Car", "SUV", 3200, "https://images.unsplash.com/photo-1627451296061-042898491c9f", "Diesel", "Manual"),
        ("Creta", "Hyundai", "Car", "SUV", 2800, "https://images.unsplash.com/photo-1663189914902-6cdd9493f0b2", "Petrol", "Auto"),
        ("Fortuner", "Toyota", "Car", "SUV", 6500, "https://images.unsplash.com/photo-1618015525501-16d5be9b1585", "Diesel", "Auto"),
        ("Thar", "Mahindra", "Car", "SUV", 3000, "https://images.unsplash.com/photo-1613941459207-68041530e70b", "Petrol", "Manual"),
        ("XUV700", "Mahindra", "Car", "SUV", 4000, "https://images.unsplash.com/photo-1692348573428-66d5af94c489", "Petrol", "Auto"),
        ("Nexon", "Tata", "Car", "SUV", 2200, "https://images.unsplash.com/photo-1634645228549-b02447953ff1", "Petrol", "Manual"),
        
        # Sedans
        ("City", "Honda", "Car", "Sedan", 2500, "https://images.unsplash.com/photo-1596733430284-f7437764b1a9", "Petrol", "Auto"),
        ("Verna", "Hyundai", "Car", "Sedan", 2400, "https://images.unsplash.com/photo-1632245889027-e4368c14dc3b", "Petrol", "Manual"),
        ("Virtus", "Volkswagen", "Car", "Sedan", 2600, "https://images.unsplash.com/photo-1692881077717-3bf91bf194f2", "Petrol", "Auto"),
        ("Octavia", "Skoda", "Car", "Sedan", 4500, "https://images.unsplash.com/photo-1631248055158-edec7a3c072b", "Petrol", "Auto"),
        
        # Hatchbacks
        ("Swift", "Maruti Suzuki", "Car", "Hatchback", 1500, "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7", "Petrol", "Manual"),
        ("Altroz", "Tata", "Car", "Hatchback", 1600, "https://images.unsplash.com/photo-1625217527288-93919c99650a", "Petrol", "Manual"),
        ("i20", "Hyundai", "Car", "Hatchback", 1700, "https://images.unsplash.com/photo-1647424911765-689366f64245", "Petrol", "Auto"),
        ("Baleno", "Maruti Suzuki", "Car", "Hatchback", 1650, "https://images.unsplash.com/photo-1648011210665-69f886f3458d", "Petrol", "Auto"),
        
        # Luxury
        ("3 Series", "BMW", "Car", "Luxury", 9500, "https://images.unsplash.com/photo-1555215695-3004980ad54e", "Petrol", "Auto"),
        ("A4", "Audi", "Car", "Luxury", 8500, "https://images.unsplash.com/photo-1606155906705-dc9d4e7b9f19", "Petrol", "Auto"),
        ("C-Class", "Mercedes", "Car", "Luxury", 10500, "https://images.unsplash.com/photo-1111111111111", "Diesel", "Auto"), # Fallback testing
    ]
    
    bikes_data = [
        ("Himalayan 450", "Royal Enfield", "Bike", "Adventure", 1500, "https://images.unsplash.com/photo-1606558485292-67853173d15a", "Petrol", "Manual"),
        ("Classic 350", "Royal Enfield", "Bike", "Cruiser", 1200, "https://images.unsplash.com/photo-1635073908865-ec754859a5d4", "Petrol", "Manual"),
        ("Duke 390", "KTM", "Bike", "Sports", 1800, "https://images.unsplash.com/photo-1615172282427-9a57ef2d142e", "Petrol", "Manual"),
        ("Ninja 300", "Kawasaki", "Bike", "Sports", 3500, "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838", "Petrol", "Manual"),
        ("Pulsar NS200", "Bajaj", "Bike", "Commuter", 1000, "https://images.unsplash.com/photo-1649931757884-601e88849646", "Petrol", "Manual"),
        ("Splendor Plus", "Hero", "Bike", "Commuter", 600, "https://images.unsplash.com/photo-1632313364951-8e5033c467a3", "Petrol", "Manual"),
        ("R15 V4", "Yamaha", "Bike", "Sports", 1400, "https://images.unsplash.com/photo-1626245914510-c44d7768d712", "Petrol", "Manual"),
    ]
    
    scooties_data = [
        ("Activa 6G", "Honda", "Scooty", "Family", 700, "https://images.unsplash.com/photo-1632313364951-8e5033c467a3", "Petrol", "Manual"),
        ("Jupiter 125", "TVS", "Scooty", "Family", 650, "https://images.unsplash.com/photo-1616422894586-ef92cf88470a", "Petrol", "Manual"),
        ("S1 Pro", "Ola Electric", "Scooty", "Electric", 800, "https://images.unsplash.com/photo-1662993098380-60b81f18fc69", "Electric", "Auto"),
        ("450X", "Ather", "Scooty", "Performance", 850, "https://images.unsplash.com/photo-1645063084348-152e9f16e3c8", "Electric", "Auto"),
        ("Chetak", "Bajaj", "Scooty", "Electric", 750, "https://images.unsplash.com/photo-1632313364951-8e5033c467a3", "Electric", "Auto"),
    ]

    # Combine and multiply with randomization to hit 120-150 vehicles
    total_added = 0
    all_templates = cars_data + bikes_data + scooties_data
    
    # We want structured variety, so we repeat templates with status variations
    for template in all_templates:
        name, brand, category, subtype, base_price, img, fuel, trans = template
        # Add 3 variants of each model with different status and stats
        for i in range(3):
            price = base_price + random.randint(-100, 300)
            booking_count = random.randint(5, 600)
            status = random.choice(['available', 'available', 'available', 'rented', 'maintenance'])
            
            cursor.execute(
                'INSERT INTO vehicles (name, brand, category, subtype, price_per_day, image_url, status, booking_count, fuel_type, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                (name, brand, category, subtype, float(price), img, status, booking_count, fuel, trans)
            )
            total_added += 1

    # Fill rest with random duplicates to ensure list is long
    while total_added < 130:
        template = random.choice(all_templates)
        name, brand, category, subtype, base_price, img, fuel, trans = template
        price = base_price + random.randint(-200, 400)
        status = random.choice(['available', 'available', 'rented'])
        booking_count = random.randint(0, 450)
        cursor.execute(
            'INSERT INTO vehicles (name, brand, category, subtype, price_per_day, image_url, status, booking_count, fuel_type, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (name, brand, category, subtype, float(price), img, status, booking_count, fuel, trans)
        )
        total_added += 1

    # Seed 15+ Mock Bookings
    mock_users = ["uid_1", "uid_2", "uid_3", "uid_4", "uid_5"]
    cursor.execute('SELECT id, price_per_day FROM vehicles WHERE status = "rented" LIMIT 10')
    rented_vehicles = cursor.fetchall()
    
    for v_id, p_day in rented_vehicles:
        days = random.randint(2, 7)
        cursor.execute(
            'INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
            (random.choice(mock_users), v_id, "2024-03-20", "2024-03-25", p_day * days, "Active")
        )

    # Add some completed ones too
    cursor.execute('SELECT id, price_per_day FROM vehicles LIMIT 5')
    other_vehicles = cursor.fetchall()
    for v_id, p_day in other_vehicles:
        cursor.execute(
            'INSERT INTO bookings (user_id, vehicle_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
            ("uid_legacy", v_id, "2024-02-01", "2024-02-05", p_day * 4, "Completed")
        )

# --- Routes ---

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    category = request.args.get('category')
    subtype = request.args.get('subtype')
    search = request.args.get('search')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    status = request.args.get('status')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM vehicles WHERE 1=1"
    params = []
    
    if category and category != 'All':
        query += " AND category = ?"
        params.append(category)
    if subtype and subtype != 'All':
        query += " AND subtype = ?"
        params.append(subtype)
    if search:
        query += " AND (name LIKE ? OR brand LIKE ?)"
        params.append(f'%{search}%')
        params.append(f'%{search}%')
    if min_price:
        query += " AND price_per_day >= ?"
        params.append(float(min_price))
    if max_price:
        query += " AND price_per_day <= ?"
        params.append(float(max_price))
    if status and status != 'All':
        query += " AND status = ?"
        params.append(status)
        
    query += " ORDER BY booking_count DESC"
    
    cursor.execute(query, params)
    vehicles = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(vehicles)

@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO vehicles (name, brand, category, subtype, price_per_day, image_url, status, booking_count, fuel_type, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        (data['name'], data['brand'], data['category'], data['subtype'], float(data['price_per_day']), data['image_url'], data.get('status', 'available'), 0, data.get('fuel_type', 'Petrol'), data.get('transmission', 'Manual'))
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.execute('SELECT * FROM vehicles WHERE id = ?', (new_id,))
    vehicle = dict(cursor.fetchone())
    conn.close()
    return jsonify(vehicle), 201

@app.route('/api/vehicles/<int:id>', methods=['PUT', 'DELETE'])
def manage_vehicle(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if request.method == 'DELETE':
        cursor.execute('DELETE FROM vehicles WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Vehicle deleted"})
    
    if request.method == 'PUT':
        data = request.json
        cursor.execute('''
            UPDATE vehicles 
            SET name = ?, brand = ?, category = ?, subtype = ?, price_per_day = ?, image_url = ?, fuel_type = ?, transmission = ?, status = ?
            WHERE id = ?
        ''', (data['name'], data['brand'], data['category'], data['subtype'], float(data['price_per_day']), data['image_url'], data['fuel_type'], data['transmission'], data['status'], id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Vehicle updated"})

@app.route('/api/vehicles/<int:id>/status', methods=['PUT'])
def update_status(id):
    status = request.json.get('status')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE vehicles SET status = ? WHERE id = ?', (status, id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated successfully"})

@app.route('/api/vehicles/<int:id>/book', methods=['PUT'])
def book_vehicle(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE vehicles SET status = "rented", booking_count = booking_count + 1 WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle booked successfully"})

@app.route('/api/vehicles/<int:id>/return', methods=['PUT'])
def return_vehicle(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE vehicles SET status = "available" WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle returned successfully"})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM vehicles')
    total_vehicles = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM vehicles WHERE status = "rented"')
    active_rentals = cursor.fetchone()[0]
    
    cursor.execute('SELECT SUM(price_per_day) FROM vehicles WHERE status = "rented"')
    revenue = cursor.fetchone()[0] or 0
    # Add simulation for historic revenue based on booking count
    cursor.execute('SELECT SUM(price_per_day * booking_count) * 0.1 FROM vehicles')
    historic_revenue = cursor.fetchone()[0] or 0
    
    conn.close()
    return jsonify({
        "totalVehicles": total_vehicles,
        "activeRentals": active_rentals,
        "revenue": int(revenue + historic_revenue), 
        "availability": int(((total_vehicles - active_rentals) / total_vehicles) * 100) if total_vehicles > 0 else 0
    })

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT b.*, v.name as vehicle_name, v.brand as vehicle_brand, v.image_url as vehicle_image
        FROM bookings b 
        JOIN vehicles v ON b.vehicle_id = v.id 
        ORDER BY b.created_at DESC 
        LIMIT 10
    ''')
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/customers', methods=['GET'])
def get_customers():
    # Mock Indian Customers for CRM demo
    customers = [
        {"id": 1, "name": "Rajesh Kumar", "email": "rajesh.k@gmail.com", "phone": "+91 98765 43210", "bookings": 12, "status": "Prime"},
        {"id": 2, "name": "Priyanka Singh", "email": "priyanka.s@outlook.com", "phone": "+91 91234 56789", "bookings": 5, "status": "Regular"},
        {"id": 3, "name": "Amit Sharma", "email": "amit.sharma@yahoo.in", "phone": "+91 88888 77777", "bookings": 24, "status": "Elite"},
        {"id": 4, "name": "Suhana Khan", "email": "suhana.k@zoho.com", "phone": "+91 99900 11122", "bookings": 3, "status": "Regular"},
        {"id": 5, "name": "Arjun Malhotra", "email": "arjun.m@icloud.com", "phone": "+91 77700 88899", "bookings": 18, "status": "Prime"},
    ]
    return jsonify(customers)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
