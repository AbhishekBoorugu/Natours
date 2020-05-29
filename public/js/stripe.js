import axios from "axios"
import  {showAlert} from './alerts';
const stripe = Stripe('pk_test_6BPcUQjTyv3Y4DOuJ5IhA7R800sIqxvHWX')

export const bookTour = async tourId => {
    try {
    // 1. Get the session from API
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
    console.log(session);

    // 2. Create checkout form + process the payment 
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
    } catch (err) {
        console.log('error',err);
    }
};
