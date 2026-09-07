import "./ChatWidget.css";

// Floating WhatsApp button. Clicking it opens a WhatsApp chat with the
// realtor's phone number (passed in from App.jsx as realtorInfo.phone),
// with a friendly pre-filled message.
function ChatWidget({ phone }) {
  const digitsOnly = (phone || "").replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    "Hi! I'm interested in one of your properties. Could you share more details?"
  );
  const whatsappUrl = `https://wa.me/${digitsOnly}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-widget"
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.004 3C9.377 3 4 8.373 4 15c0 2.394.696 4.62 1.899 6.49L4 29l7.72-1.86A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.965 17.06c-.297.833-1.47 1.53-2.406 1.73-.64.136-1.475.244-4.287-.92-3.6-1.49-5.918-5.14-6.098-5.38-.173-.24-1.454-1.936-1.454-3.69s.91-2.615 1.234-2.975c.324-.36.708-.45.944-.45.236 0 .472.002.678.013.217.011.508-.083.795.606.297.71.99 2.464 1.075 2.643.086.18.144.393.028.633-.116.24-.174.39-.34.6-.173.21-.362.47-.518.63-.173.18-.353.373-.152.734.203.36.9 1.485 1.933 2.406 1.328 1.185 2.448 1.552 2.807 1.727.36.174.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.328.12 2.087.985 2.446 1.164.36.18.598.27.687.42.087.15.087.87-.21 1.706Z"
        />
      </svg>
    </a>
  );
}

export default ChatWidget;