/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import isEmail from 'validator/lib/isEmail.js';

// updateSettings function - This is implemented after we did the initial method for updating user data that didn't need the api.
// 'type' is either 'data' or 'password' depending on what we want to update
const updateSettings = async (data, type) => {
  // Validate email if the type is 'data' and the email field is present
  if (type === 'data' && data.email && !isEmail(data.email)) {
    showAlert('error', 'Please provide a valid email address!');
    return; // Exit the function without making the request
  }

  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (response.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response?.data?.message ||
        'An error occurred while updating settings.',
    );
  }
};

export default updateSettings;
