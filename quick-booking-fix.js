// Quick fix for Railway webhook - add to webhook-server.js

// Replace the bookAppointment function error handling with:

} catch (error) {
    console.error('Error booking appointment:', error);
    
    // Always return a response to prevent silence
    return { 
        success: false, 
        message: "I apologize, but I'm having trouble booking your appointment right now. Let me try a different approach - could you please tell me your name and preferred date and time again?",
        error: 'booking_failed'
    };
}