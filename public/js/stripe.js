import axios from 'axios';
import Stripe from 'stripe';
import { showAlert } from './alerts.js';

const bookTour = async tourId => {
  // Initialize stripe object
  const stripe = new Stripe(
    'pk_test_51SLNQnRvXPpAgu0vLExLlLXkFNgIbp1JEuxgdIQ9xYiBLBPRf3TojN4sKfkPGAqQIyANjNXaMRBc9CyIpz174Jdy00XLQPwiTP',
  );

  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

export default bookTour;
