import axios from 'axios';

class Auth {
  constructor() {
    this.auth = axios.create({
      // baseURL: 'http://localhost:3001/auth',
      baseURL: `${process.env.BACKEND_BASEURL}/auth`,
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

  logout() {
    return this.auth.post('/logout');
  }

  me() {
    return this.auth.get('/me')
      .then(({ data }) => data);
  }
}

const auth = new Auth();

export default auth;
