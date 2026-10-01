// Office details. The address is still a placeholder.
export const contact = {
  // WhatsApp number in international format, digits only (e.g. '9613123456').
  // While empty, WhatsApp buttons open WhatsApp with the message ready but no recipient.
  whatsappNumber: '96181569264',

  phone: { display: '+961 81 569 264', href: 'tel:+96181569264' },
  email: { display: 'Mohamad@visalinkklebanon.com', href: 'mailto:Mohamad@visalinkklebanon.com' },
  address: { en: '[Office address]', ar: '[عنوان المكتب]' },
  hours: {
    en: 'Monday to Saturday, 9:30 am to 4:30 pm · Closed on Sunday',
    ar: 'من الإثنين إلى السبت، ٩:٣٠ صباحاً حتى ٤:٣٠ مساءً · الأحد عطلة',
  },

  // Optional booking page (Calendly, Google Calendar…). When empty, "Book a Consultation" opens WhatsApp.
  bookingUrl: '',
}

export function whatsappLink(message) {
  const base = contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}` : 'https://wa.me/'
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
