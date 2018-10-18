import axios from 'axios';

class Auth {
  constructor() {
    this.auth = axios.create({
      baseURL: 'http://localhost:3001/auth',
      withCredentials: true,
    });
  }

  signup(user) {
    return this.auth.post('/signup', user)
      .then(({ data }) => data);
  }

  login(user) {
    return this.auth.post('/login', user)
      .then(({ data }) => data);
  }

  me() {
    return this.auth.get('/me')
      .then(({ data }) => {
        console.log('auth-service: ', data);
        return data;
      });
  }
}

const auth = new Auth();

export default auth;
