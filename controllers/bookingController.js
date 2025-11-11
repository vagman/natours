import Stripe from 'stripe';

import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';
import User from '../models/userModel.js';

const getCheckoutSession = catchAsync(async (request, response, next) => {
  // 0. Get thecurrently booked tour
  const tour = await Tour.findById(request.params.tourId);

  // 1. Create stripe checkout session
  // Adding this line in top-level code was producing error: "Neither apiKey nor config.authenticator provided" read more:https://stackoverflow.com/questions/79086035/firebase-deploy-error-neither-apikey-nor-config-authenticator-provided-using-s/
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 2. Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: request.user.email,
    client_reference_id: request.params.tourId, // to identify the tour
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${request.protocol}://${request.get('host')}/img/tours/6${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // Redirect to homepage if successful - NOT SECURE - everyone can make bookings without paying!
    success_url: `${request.protocol}://${request.get('host')}/my-tours?alert=booking`,
    // Redirect to the tour page if they cancel
    cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
  });

  // 3. Create session as response (send the session back to the client)
  response.status(200).json({
    status: 'success',
    session,
  });
});

// const createBookingCheckout = catchAsync(async (request, response, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = request.query;

//   // If there is no query, move to the next middleware
//   if (!tour || !user || !price) return next();
//   await Booking.create({ tour, user, price });

//   // Redirect to the original URL without the query string
//   response.redirect(request.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

const webhookCheckout = catchAsync(async (request, response, next) => {
  const signature = request.headers['stripe-signature'];

  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await createBookingCheckout(session);
  }

  response.status(200).json({ received: true });
});

const createBooking = factory.createOne(Booking);
const getBooking = factory.getOne(Booking);
const getAllBookings = factory.getAll(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

export {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
  getAllBookings,
  webhookCheckout,
};
