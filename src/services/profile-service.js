import axios from 'axios';

class Profile {
  constructor() {
    this.profile = axios.create({
      baseURL: 'http://localhost:3001/profile',
      withCredentials: true,
    });
  }

  getProfile() {
    return this.profile.get('/getprofile')
      .then(({ data }) => data);
  }

  editProfile(id, profile) {
    return this.profile.put(`/${id}`, profile)
      .then(({ data }) => data);
  }
}

const profile = new Profile();

export default profile;
