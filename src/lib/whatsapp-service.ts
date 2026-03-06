/**
 * WhatsApp Messaging Service for Khata
 */

/**
 * Sends a payment reminder to a customer via WhatsApp.
 * @param phone Customer phone number
 * @param customerName Customer name for personalization
 * @param amount Outstanding amount to remind about
 */
export const sendWhatsAppReminder = (phone: string, customerName: string, amount: number) => {
    // Format message
    const message = `Assalam-o-Alaikum ${customerName},

This is a friendly reminder regarding your outstanding balance of *PKR ${amount.toLocaleString()}* at our shop. Please settle it at your earliest convenience.

Thank you for your business! (Khata Digital Ledger)`;
    
    // URL encode message
    const encodedMessage = encodeURIComponent(message);
    
    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // Ensure it has a country code (prefix with 92 for Pakistan if it starts with 0 or 3)
    let finalPhone = cleanPhone;
    if (finalPhone.startsWith('0')) {
        finalPhone = '92' + finalPhone.substring(1);
    } else if (finalPhone.startsWith('3')) {
        finalPhone = '92' + finalPhone;
    }
    
    // Create WhatsApp Web/App URL
    const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
};

/**
 * Sends a generic business message/receipt via WhatsApp.
 */
export const sendWhatsAppReceipt = (phone: string, customerName: string, invoiceNumber: string) => {
    const message = `Dear ${customerName}, your invoice *#${invoiceNumber}* has been generated. You can view or download it from your customer portal. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
};
