const { v4: uuidv4 } = require('uuid');

class MockPool {
  constructor() {
    const serviceIds = {
      plumbing: uuidv4(),
      electrical: uuidv4(),
      carpentry: uuidv4()
    };

    this.data = {
      users: [
        { id: 'user-1', name: 'Titus Njuguna', email: 'titus@example.com', phone: '0712345678', password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Pyv.tZzP.r3W3fGai', role: 'technician', is_active: true, avatar_url: 'https://i.pravatar.cc/150?u=1' },
        { id: 'user-2', name: 'Sarah Wanjiku', email: 'sarah@example.com', phone: '0722334455', password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Pyv.tZzP.r3W3fGai', role: 'technician', is_active: true, avatar_url: 'https://i.pravatar.cc/150?u=2' },
        { id: 'user-3', name: 'Peter Kamau', email: 'peter@example.com', phone: '0733445566', password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Pyv.tZzP.r3W3fGai', role: 'customer', is_active: true, avatar_url: 'https://i.pravatar.cc/150?u=3' }
      ],
      technicians: [
        { 
          id: 'tech-1', user_id: 'user-1', is_verified: true, is_available: true, 
          subscription_expires_at: '2027-01-01', avg_rating: 4.9, total_reviews: 24, total_jobs: 112, 
          bio: 'Expert master plumber with 15 years experience in residential and commercial piping.', 
          location: 'Nairobi, Westlands', years_experience: 15 
        },
        { 
          id: 'tech-2', user_id: 'user-2', is_verified: true, is_available: true, 
          subscription_expires_at: '2027-01-01', avg_rating: 4.7, total_reviews: 18, total_jobs: 85, 
          bio: 'Certified electrician specializing in home wiring and smart home systems.', 
          location: 'Nairobi, Kilimani', years_experience: 8 
        }
      ],
      services: [
        { id: serviceIds.plumbing, name: 'Plumbing', description: 'Pipe repairs and installation', icon: '🔧', category: 'Home Repairs' },
        { id: serviceIds.electrical, name: 'Electrical', description: 'Wiring and appliance repair', icon: '⚡', category: 'Home Repairs' },
        { id: serviceIds.carpentry, name: 'Carpentry', description: 'Furniture and wood repair', icon: '🪚', category: 'Home Repairs' },
        { id: uuidv4(), name: 'Painting', description: 'Interior and exterior painting', icon: '🎨', category: 'Home Repairs' },
        { id: uuidv4(), name: 'Cleaning', description: 'Deep house cleaning', icon: '🧹', category: 'Cleaning' }
      ],
      technician_services: [
        { id: uuidv4(), technician_id: 'tech-1', service_id: serviceIds.plumbing, price_from: 1500, price_to: 5000 },
        { id: uuidv4(), technician_id: 'tech-2', service_id: serviceIds.electrical, price_from: 1000, price_to: 4000 }
      ],
      service_requests: [],
      reviews: [],
      transactions: [],
      messages: [],
      disputes: []
    };
  }

  async query(text, params) {
    const q = text.trim().toUpperCase().replace(/\s+/g, ' ');
    const p = params || [];

    // Helper to check if query contains any of the patterns
    const contains = (patterns) => patterns.some(pattern => q.includes(pattern.toUpperCase()));

    // 1. CHECK IF USER EXISTS
    if (contains(['SELECT ID FROM USERS WHERE EMAIL = $1 OR PHONE = $2', 'SELECT ID FROM USERS WHERE EMAIL = ? OR PHONE = ?'])) {
      const email = p[0];
      const phone = p[1];
      const user = this.data.users.find(u => u.email === email || u.phone === phone);
      return { rows: user ? [user] : [] };
    }

    // 2. INSERT USER
    if (contains(['INSERT INTO USERS', 'INSERT INTO USERS (NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE)'])) {
      const newUser = {
        id: uuidv4(),
        name: p[0],
        email: p[1],
        phone: p[2],
        password_hash: p[3],
        role: p[4] || 'customer',
        is_active: true,
        created_at: new Date()
      };
      this.data.users.push(newUser);
      return { rows: [newUser] };
    }

    // 3. SELECT SERVICES
    if (contains(['SELECT * FROM SERVICES', 'SELECT DISTINCT CATEGORY FROM SERVICES'])) {
      if (q.includes('DISTINCT CATEGORY')) {
        const categories = [...new Set(this.data.services.map(s => s.category))];
        return { rows: categories.map(c => ({ category: c })) };
      }
      return { rows: this.data.services };
    }

    // 4. LOGIN / GET ME
    if (contains(['FROM USERS WHERE EMAIL = $1', 'FROM USERS WHERE EMAIL = ?', 'FROM USERS WHERE ID = $1', 'FROM USERS WHERE ID = ?'])) {
      const val = p[0];
      const user = this.data.users.find(u => u.email === val || u.id === val);
      return { rows: user ? [user] : [] };
    }

    // 5. GET ALL TECHNICIANS (Search)
    if (contains(['SELECT T.*, U.NAME, U.EMAIL, U.PHONE, U.AVATAR_URL', 'FROM TECHNICIANS T JOIN USERS U'])) {
      const techs = this.data.technicians.map(t => {
        const user = this.data.users.find(u => u.id === t.user_id);
        
        // Find associated services for this tech
        const techServices = this.data.technician_services
          .filter(ts => ts.technician_id === t.id)
          .map(ts => {
            const s = this.data.services.find(serv => serv.id === ts.service_id);
            return { ...ts, ...s };
          });

        return { ...t, ...user, services: JSON.stringify(techServices) };
      }).filter(t => t.subscription_expires_at && new Date(t.subscription_expires_at) > new Date());
      
      return { rows: techs };
    }

    // 6. GET SINGLE TECHNICIAN
    if (contains(['SELECT T.*, U.NAME, U.EMAIL, U.PHONE, U.AVATAR_URL', 'WHERE T.ID = ?', 'WHERE T.ID = $1'])) {
      const techId = p[0];
      const t = this.data.technicians.find(tech => tech.id === techId);
      if (!t) return { rows: [] };
      const user = this.data.users.find(u => u.id === t.user_id);
      return { rows: [{ ...t, ...user }] };
    }

    // 7. GET REVIEWS
    if (contains(['SELECT R.*, U.NAME AS REVIEWER_NAME', 'FROM REVIEWS R'])) {
      return { rows: [] };
    }

    // Default: Empty results
    return { rows: [] };
  }

  on(event, callback) {
    if (event === 'connect') setTimeout(callback, 50);
  }
}

const mockPool = new MockPool();
module.exports = mockPool;
