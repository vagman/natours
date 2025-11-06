/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response?.data?.message || 'Something went wrong!',
    );
  }
};

const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (response.data.status === 'success') window.location.reload();
  } catch (error) {
    showAlert(
      'error',
      error.response?.data?.message ||
        'Something went wrong! Error logging out. Please try again.',
    );
  }
};

export { login, logout };
