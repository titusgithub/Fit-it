const { v4: uuidv4 } = require('uuid');

class MockPool {
  constructor() {
    this.data = {
      users: [],
      technicians: [],
      services: [
        { id: uuidv4(), name: 'Plumbing', description: 'Pipe repairs', icon: '🔧', category: 'Home Repairs' },
        { id: uuidv4(), name: 'Electrical', description: 'Wiring', icon: '⚡', category: 'Home Repairs' },
        { id: uuidv4(), name: 'Carpentry', description: 'Woodwork', icon: '🪚', category: 'Home Repairs' },
        { id: uuidv4(), name: 'Painting', description: 'Interior/Exterior', icon: '🎨', category: 'Home Repairs' },
        { id: uuidv4(), name: 'Appliance Repair', description: 'Electronics', icon: '📺', category: 'Electronics' }
      ],
      technician_services: [],
      service_requests: [],
      reviews: [],
      transactions: [],
      messages: [],
      disputes: []
    };
  }

  async query(text, params) {
    const q = text.trim().toUpperCase().replace(/\s+/g, ' ');
    // console.log('MockDB Query:', q, params);

    // 1. CHECK IF USER EXISTS (Register)
    if (q.includes('SELECT ID FROM USERS WHERE EMAIL = $1 OR PHONE = $2')) {
      const email = params[0];
      const phone = params[1];
      const user = this.data.users.find(u => u.email === email || u.phone === phone);
      return { rows: user ? [user] : [] };
    }

    // 2. INSERT USER
    if (q.includes('INSERT INTO USERS (NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE)')) {
      const newUser = {
        id: uuidv4(),
        name: params[0],
        email: params[1],
        phone: params[2],
        password_hash: params[3],
        role: params[4],
        is_active: true,
        created_at: new Date()
      };
      this.data.users.push(newUser);
      return { rows: [newUser] };
    }

    // 3. INSERT TECHNICIAN
    if (q.includes('INSERT INTO TECHNICIANS (USER_ID) VALUES ($1)')) {
      const newTech = {
        id: uuidv4(),
        user_id: params[0],
        is_verified: false,
        is_available: true,
        subscription_expires_at: null,
        avg_rating: 0,
        total_reviews: 0,
        total_jobs: 0,
        created_at: new Date()
      };
      this.data.technicians.push(newTech);
      return { rows: [newTech] };
    }

    // 4. SELECT SERVICES
    if (q.includes('SELECT * FROM SERVICES')) {
      return { rows: this.data.services };
    }

    // 5. LOGIN
    if (q.includes('SELECT ID, NAME, EMAIL, PHONE, PASSWORD_HASH, ROLE, AVATAR_URL, IS_ACTIVE FROM USERS WHERE EMAIL = $1')) {
      const email = params[0];
      const user = this.data.users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }

    // 6. INSERT SERVICE REQUEST
    if (q.includes('INSERT INTO SERVICE_REQUESTS')) {
      const newRequest = {
        id: uuidv4(),
        customer_id: params[0],
        technician_id: params[1],
        service_id: params[2],
        title: params[3],
        description: params[4],
        location: params[5],
        status: 'pending',
        created_at: new Date()
      };
      this.data.service_requests.push(newRequest);
      return { rows: [newRequest] };
    }

    // 7. SELECT SERVICE REQUESTS (Dashboard)
    if (q.includes('SELECT SR.*, U.NAME AS TECHNICIAN_NAME, S.NAME AS SERVICE_NAME')) {
      const customerId = params[0];
      const requests = this.data.service_requests
        .filter(r => r.customer_id === customerId)
        .map(r => {
          const service = this.data.services.find(s => s.id === r.service_id);
          return { ...r, service_name: service?.name, service_icon: service?.icon };
        });
      return { rows: requests };
    }

    // 8. GET TECHNICIAN BY USER_ID
    if (q.includes('SELECT * FROM TECHNICIANS WHERE USER_ID = $1')) {
      const userId = params[0];
      const tech = this.data.technicians.find(t => t.user_id === userId);
      return { rows: tech ? [tech] : [] };
    }

    // 9. UPDATE TECHNICIAN SUBSCRIPTION
    if (q.includes('UPDATE TECHNICIANS SET SUBSCRIPTION_EXPIRES_AT')) {
      const expiresAt = params[0];
      const userId = params[1];
      const tech = this.data.technicians.find(t => t.user_id === userId);
      if (tech) {
        tech.subscription_expires_at = expiresAt;
        return { rows: [tech] };
      }
      return { rows: [] };
    }

    // 10. GET ALL TECHNICIANS (Search)
    if (q.includes('SELECT T.*, U.NAME, U.EMAIL, U.PHONE, U.AVATAR_URL')) {
      // Basic mock for technician search
      const techs = this.data.technicians.map(t => {
        const user = this.data.users.find(u => u.id === t.user_id);
        return { ...t, ...user };
      }).filter(t => t.subscription_expires_at && new Date(t.subscription_expires_at) > new Date());
      return { rows: techs };
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
