import axios from 'axios';
import { showAlert } from './alerts.js';

const bookTour = async tourId => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

export default bookTour;
