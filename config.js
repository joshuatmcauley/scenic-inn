// Where bookings and preorders are sent: the Cloudflare Worker in worker.js,
// which saves them for the staff dashboard and emails the restaurant a kitchen PDF.
var SCENIC_API = '/api';
var SCENIC_PHONE = '028 2075 1260';
var SCENIC_EMAIL = 'enquiries@thescenicinn.com';

// Buffets for MORE than this many guests must pay a deposit.
// [SET YOUR DEPOSIT AMOUNT] The PayPal button is a placeholder until PayPal is connected.
var BUFFET_DEPOSIT = { overGuests: 20, amount: 50 };
