/**
 * Enhanced Voice AI Scripts for Vapi Nail Salon Agent
 * Includes greetings, promotions, upsells, and seasonal variations
 */

const VOICE_AI_SCRIPTS = {
    // ==================== GREETING VARIATIONS ====================
    
    greetings: {
        // Standard greeting (default)
        standard: "Hi there! Thanks for calling Glamour Nails. I'm your AI booking assistant, and I'm here to help you schedule the perfect appointment. How can I make you look amazing today?",
        
        // Warm and friendly
        friendly: "Hello! Welcome to Glamour Nails, where your beauty is our passion! I'm here to help you book an appointment that fits perfectly into your schedule. What can I do for you today?",
        
        // Professional and efficient
        professional: "Good day! You've reached Glamour Nails' booking system. I can help you schedule appointments for all our nail services, check availability, and answer questions about our treatments. How may I assist you?",
        
        // Enthusiastic and energetic
        energetic: "Hey gorgeous! Thanks for calling Glamour Nails! I'm so excited to help you book your next fabulous nail appointment. Are you ready to treat yourself to something beautiful?",
        
        // Calm and relaxing
        relaxing: "Hello and welcome to Glamour Nails, your oasis of beauty and relaxation. I'm here to help you find the perfect time for some well-deserved self-care. What service would make your day special?"
    },

    // ==================== TIME-BASED GREETINGS ====================
    
    timeBasedGreetings: {
        morning: "Good morning! What a beautiful day to treat yourself at Glamour Nails! I'm your AI assistant, ready to help you book the perfect appointment. How can I start your day off right?",
        
        afternoon: "Good afternoon! Thanks for calling Glamour Nails. I hope you're having a wonderful day! I'm here to help you book an appointment for some beautiful nail care. What can I do for you?",
        
        evening: "Good evening! Thanks for calling Glamour Nails. Even though we're closed, I'm here 24/7 to book your appointment for when we're open. How can I help you plan your next visit?",
        
        lateNight: "Hi there! I love that you're thinking about self-care at this hour! Even though it's late, I'm always here to help you book your perfect appointment at Glamour Nails. What service are you dreaming about?",
        
        weekend: "Happy weekend! Thanks for calling Glamour Nails. Weekend appointments fill up fast, but I'm here to help you find the perfect time to pamper yourself. What are you hoping to book?"
    },

    // ==================== SEASONAL GREETINGS ====================
    
    seasonalGreetings: {
        spring: "Happy Spring! Thanks for calling Glamour Nails. It's the perfect time for fresh, bright nail colors! I'm here to help you book an appointment that'll make your nails bloom beautifully. What can I do for you?",
        
        summer: "Hello sunshine! Thanks for calling Glamour Nails. Summer is the season for gorgeous nails - whether you're beach-bound or party-ready! How can I help you get summer-ready?",
        
        fall: "Hello! Thanks for calling Glamour Nails. Fall is here, and it's time for rich, cozy nail colors that match the season! I'm excited to help you book your autumn appointment. What sounds perfect to you?",
        
        winter: "Hi there! Thanks for calling Glamour Nails. Winter calls for extra nail care and beautiful colors to brighten these cozy days. How can I help you treat yourself to something wonderful?",

        // Holiday-specific
        nearHolidays: "Hi! Thanks for calling Glamour Nails. With the holidays coming up, everyone wants to look their best! I'm here to help you book the perfect appointment for your celebrations. What would make you sparkle?",
        
        newYear: "Happy New Year! Thanks for calling Glamour Nails. New year, new nails! I'm here to help you start the year looking absolutely beautiful. What's your first treat going to be?"
    },

    // ==================== SERVICE-SPECIFIC RESPONSES ====================
    
    serviceResponses: {
        gelManicure: {
            description: "Excellent choice! Our gel manicures are perfect for long-lasting, chip-resistant color that keeps your nails looking salon-fresh for weeks. The gel polish gives you that glossy, professional finish that's perfect for any occasion.",
            
            duration: "A gel manicure takes about 60 minutes, which gives us plenty of time to shape your nails perfectly, care for your cuticles, and apply the gel polish with precision.",
            
            upsell: "Many clients love to add a paraffin treatment to their gel manicure for extra soft, moisturized hands. It's only an additional $15 and feels absolutely luxurious!"
        },
        
        signatureManicure: {
            description: "Perfect! Our signature manicure is our classic treatment - nail shaping, cuticle care, and beautiful regular polish. It's relaxing, affordable, and leaves your nails looking naturally beautiful.",
            
            duration: "The signature manicure takes about 45 minutes - just the right amount of time to relax and refresh your nails.",
            
            upsell: "Would you like to upgrade to gel polish for just $10 more? It lasts much longer and gives you that salon shine for weeks instead of days!"
        },
        
        pedicure: {
            description: "Wonderful choice! Our classic pedicure includes a relaxing foot soak, callus removal, nail trimming and shaping, cuticle care, and polish. It's the perfect way to pamper your feet!",
            
            duration: "A pedicure takes about 60 minutes of pure relaxation - you'll leave feeling refreshed from head to toe!",
            
            upsell: "Many clients add a sugar scrub exfoliation treatment for an extra $20 - it makes your feet incredibly soft and smooth!"
        },
        
        combo: {
            description: "Smart choice! Our combo package gives you both a manicure and pedicure, and you save $10 compared to booking them separately. It's our most popular package for good reason!",
            
            duration: "The full combo takes about 90 minutes - it's like a mini spa day just for you!",
            
            benefits: "With the combo, you get the full beauty treatment - beautiful nails on your hands AND feet, perfect for any season or special occasion!"
        },
        
        enhancement: {
            description: "Fantastic! Our nail enhancement service includes strengthening treatments, nail art options, and special care for damaged or weak nails. We'll get your nails looking absolutely stunning!",
            
            duration: "Enhancements take about 75 minutes because we give your nails extra attention and care.",
            
            options: "We can discuss nail art, strengthening treatments, or length extensions - whatever will make your nails perfect for you!"
        }
    },

    // ==================== PROMOTIONAL SCRIPTS ====================
    
    promotions: {
        // Weekly specials
        mondaySpecial: "By the way, did you know Mondays are our 'Mani Monday' special? You get 15% off any manicure service! Since you're booking for Monday, you'll automatically get this discount!",
        
        tuesdayTreat: "Perfect timing! Tuesdays are our 'Treat Yourself Tuesday' - all pedicure services are 10% off! You're going to love both the service and the savings!",
        
        weekdayDiscount: "I love that you're booking for a weekday! Just so you know, all services Monday through Wednesday are 10% off. You're going to get beautiful nails AND a great deal!",
        
        // New customer promotions
        firstTimeVisitor: "Is this your first time visiting Glamour Nails? Welcome! First-time clients get 15% off their first service. You're going to love what we do here!",
        
        // Combo promotions  
        comboSavings: "Since you're interested in both a manicure and pedicure, can I tell you about our combo package? You'd get both services and save $10 compared to booking them separately - plus you get the full spa experience!",
        
        // Seasonal promotions
        springSpecial: "Spring special alert! This month, all gel manicures come with a complimentary cuticle oil treatment. Perfect timing for your booking!",
        
        holidayPromo: "With the holidays coming up, we have a special party package - gel manicure and pedicure with holiday nail art for just $95. Perfect for looking festive at all your celebrations!",
        
        // Loyalty promotions
        frequentClient: "I see you've been here before - welcome back! Did you know you're just two visits away from our VIP discount? Your loyalty means everything to us!",
        
        // Last-minute availability
        todaySpecial: "You're in luck! We have a last-minute opening today, and all same-day bookings get 20% off. Are you available to come in today?"
    },

    // ==================== UPSELLING SCRIPTS ====================
    
    upsells: {
        // Add-on services
        paraffinTreatment: {
            offer: "Can I tell you about our paraffin treatment? It's incredibly popular - we dip your hands in warm, moisturizing paraffin wax that makes your skin incredibly soft. It's only $15 extra and feels absolutely luxurious!",
            
            benefits: "The paraffin treatment deeply moisturizes your skin, relieves any tension in your hands, and leaves them feeling baby-soft. Most clients say it's their favorite part of the appointment!",
            
            timing: "It adds just 10 minutes to your appointment, but the results last for days. Your hands will thank you!"
        },
        
        gelUpgrade: {
            offer: "Would you like to upgrade to gel polish? For just $10 more, your manicure will last 2-3 weeks instead of just a few days, and it gives you that gorgeous, chip-resistant shine!",
            
            benefits: "Gel polish is perfect if you're busy, have an event coming up, or just love having perfect nails that don't chip. It's our most requested upgrade!",
            
            convenience: "Plus, with gel, you can use your hands immediately - no waiting for polish to dry!"
        },
        
        nailArt: {
            offer: "Are you interested in any nail art? We can do simple accent nails, seasonal designs, or custom art. It's a great way to make your nails uniquely yours!",
            
            options: "We have everything from simple rhinestones to hand-painted designs. I can mention your interest to the technician and they can show you options when you arrive.",
            
            pricing: "Nail art starts at just $5 per nail for simple designs, and it really makes your manicure special!"
        },
        
        comboUpgrade: {
            offer: "Since you're booking a manicure, have you considered our combo package? For just $35 more, you get a full pedicure too, and you save $10 compared to booking them separately!",
            
            benefits: "The combo is perfect for events, vacations, or just treating yourself to the full experience. You'll have beautiful nails from head to toe!",
            
            convenience: "We can do them both in one appointment, so you only need to make one trip. It's our most popular package!"
        },
        
        specialOccasion: {
            offer: "Is this for a special occasion? We have special occasion packages that include nail art, extended service time, and premium polish options!",
            
            options: "For weddings, we do elegant designs that match your dress. For parties, we can do fun, festive looks. For business events, we create sophisticated, professional styles.",
            
            planning: "I can make a note about your special occasion so the technician can help you choose the perfect style when you arrive!"
        }
    },

    // ==================== FULLY BOOKED SCENARIOS ====================
    
    fullyBookedResponses: {
        // When requested time is unavailable
        timeUnavailable: "I'm sorry, but we're already booked at that exact time. However, I have some great alternatives! I can check earlier or later the same day, or I can look at the same time on different days. What would work better for you?",
        
        dateFullyBooked: "Unfortunately, we're completely booked that day - you picked one of our most popular days! But I have availability the day before and after. Would either of those work, or would you prefer a different day entirely?",
        
        weekendFull: "Weekend appointments are always popular and we're booked solid! However, I have some wonderful openings Monday through Wednesday. Plus, weekday appointments are 10% off! Would any of those days work for you?",
        
        shortNotice: "For today, we're completely booked, but I can put you on our waitlist in case someone cancels. Or I have great availability starting tomorrow! Same-day cancellations do happen, so there's always hope!",
        
        // Offer alternatives with enthusiasm
        alternativeOptions: "While that exact time isn't available, I actually have something even better! I have an opening 30 minutes earlier, which means you'll be done sooner and have more time for the rest of your day. How does that sound?",
        
        // Holiday/busy season responses
        busySeasonResponse: "This is definitely our busy season - everyone wants to look their best! I don't have that exact time, but I can offer you our VIP early morning slot at 9 AM, which includes complimentary coffee and pastries. It's actually our most relaxing appointment time!",
        
        // Waitlist options
        waitlistOffer: "I can put you on our priority waitlist for that time slot. We often have last-minute changes, and I'll text you immediately if something opens up. Meanwhile, can I show you what other great times I have available?"
    },

    // ==================== VIP CUSTOMER RECOGNITION ====================
    
    vipRecognition: {
        // Returning customer
        welcomeBack: "Welcome back to Glamour Nails! It's so wonderful to hear from you again. I see you're one of our valued regular clients. How can I help you with your next beautiful appointment?",
        
        loyaltyAcknowledgment: "I noticed you're one of our VIP customers! Thank you for being such a loyal client. As a VIP, you get priority booking and special member pricing. What can I book for you today?",
        
        personalizedService: "Since you're a regular client, I can see your service history. Would you like to book your usual gel manicure, or are you interested in trying something new today?",
        
        // Frequent visitor benefits
        vipPerks: "As one of our VIP members, you're eligible for our exclusive perks - priority booking, member-only promotions, and complimentary upgrades when available. What sounds perfect for your next visit?",
        
        anniversary: "I see it's been exactly one year since your first visit! Happy anniversary with Glamour Nails! To celebrate, your next service includes a complimentary upgrade. What would you like to book?"
    },

    // ==================== BIRTHDAY SPECIALS ====================
    
    birthdayOffers: {
        birthdayGreeting: "Happy Birthday! What a perfect day to treat yourself at Glamour Nails! Birthday clients get 25% off any service, plus a special birthday surprise when you arrive. How would you like to celebrate?",
        
        birthdayMonth: "I see it's your birthday month! How exciting! All month long, you get 20% off any service as our birthday gift to you. What sounds perfect for your celebration?",
        
        birthdayPackage: "For birthdays, we have a special celebration package - gel manicure, pedicure, and nail art for just $85. It's perfect for looking fabulous on your special day!",
        
        giftSuggestion: "Is someone treating you to a birthday appointment? How thoughtful! If you'd like to upgrade your service, I can add it to the booking and they can pay the difference when they arrive."
    },

    // ==================== WEATHER-BASED RESPONSES ====================
    
    weatherResponses: {
        rainyDay: "Perfect day to treat yourself! Rainy weather means it's time for some indoor pampering. A beautiful manicure is exactly what you need to brighten up this gray day!",
        
        sunnyDay: "What a gorgeous day! Perfect weather for showing off beautiful nails. Are you thinking bright, sunny colors to match the weather, or something more subtle?",
        
        coldWeather: "It's so cold out there! The perfect time to come in for some warm, cozy pampering. Our salon is nice and toasty, and we'll take great care of your hands after being in the cold.",
        
        hotWeather: "It's so hot today! Our air-conditioned salon will be a perfect escape, and summer nails are always so much fun. Are you thinking bright summer colors?"
    },

    // ==================== CLOSING & FOLLOW-UP SCRIPTS ====================
    
    closingScripts: {
        // Standard booking completion
        bookingConfirmed: "Perfect! Your appointment is all set. You should receive a text confirmation within the next few minutes with all the details. We're located at 123 Beauty Lane with free parking in the back. We can't wait to see you and make your nails absolutely beautiful!",
        
        // With additional reminders
        appointmentReminders: "Wonderful! Your booking is confirmed and you'll get a text right away. We'll also send you a friendly reminder 24 hours before your appointment. Is there anything special you'd like me to mention to your technician?",
        
        // First-time customer closing
        firstTimeClosing: "Fantastic! Your first appointment with us is confirmed. Since you're new, plan to arrive just 5 minutes early for a quick check-in. We'll take great care of you and make sure your experience is absolutely perfect!",
        
        // Special occasion closing
        specialEventClosing: "Excellent! Your appointment is booked and I've made a note about your special occasion. Your technician will make sure you look absolutely stunning for your event. You're going to love how beautiful your nails look!",
        
        // Promotional closing
        promotionalClosing: "Perfect! Your appointment is confirmed, and don't forget - you'll get that special discount we discussed. It's going to be applied automatically when you check out. You're getting both beautiful nails and great savings!"
    },

    // ==================== ERROR HANDLING & RECOVERY ====================
    
    errorRecovery: {
        // When customer seems confused
        clarification: "I want to make sure I understand exactly what you're looking for. Could you tell me again what service you'd like and what day works best? I'm here to help make this as easy as possible for you!",
        
        // Technical difficulties
        systemIssue: "I'm having a little trouble accessing that information right now, but I don't want to keep you waiting. Let me connect you with one of our team members who can help you immediately, or I can take your information and have someone call you back within 5 minutes.",
        
        // Misunderstood request
        misunderstanding: "I apologize - I want to make sure I get this exactly right for you. Could you help me understand what you're looking for? I'm here to make this booking perfect!",
        
        // When transfer is needed
        humanHandoff: "You know what? For what you're looking for, I think one of our team members could help you better than I can. Let me connect you with someone who specializes in exactly what you need. They'll take great care of you!"
    }
};

// Helper function to get appropriate greeting based on time
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return VOICE_AI_SCRIPTS.timeBasedGreetings.morning;
    } else if (hour < 17) {
        return VOICE_AI_SCRIPTS.timeBasedGreetings.afternoon;
    } else if (hour < 21) {
        return VOICE_AI_SCRIPTS.timeBasedGreetings.evening;
    } else {
        return VOICE_AI_SCRIPTS.timeBasedGreetings.lateNight;
    }
}

// Helper function to get seasonal greeting
function getSeasonalGreeting() {
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) { // March-May
        return VOICE_AI_SCRIPTS.seasonalGreetings.spring;
    } else if (month >= 5 && month <= 7) { // June-August
        return VOICE_AI_SCRIPTS.seasonalGreetings.summer;
    } else if (month >= 8 && month <= 10) { // September-November
        return VOICE_AI_SCRIPTS.seasonalGreetings.fall;
    } else { // December-February
        return VOICE_AI_SCRIPTS.seasonalGreetings.winter;
    }
}

// Helper function to check if it's near holidays
function isNearHolidays() {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();
    
    // Check for various holidays (month is 0-indexed)
    const holidays = [
        { month: 0, day: 1 },   // New Year
        { month: 1, day: 14 },  // Valentine's
        { month: 4, day: 12 },  // Mother's Day (approximate)
        { month: 11, day: 25 }, // Christmas
        // Add more holidays as needed
    ];
    
    // Check if within 2 weeks of any holiday
    return holidays.some(holiday => {
        const holidayDate = new Date(today.getFullYear(), holiday.month, holiday.day);
        const timeDiff = Math.abs(holidayDate - today);
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return daysDiff <= 14;
    });
}

// Configuration for Vapi Assistant
const VAPI_ASSISTANT_CONFIG = {
    // Main system instructions that incorporate all the scripts
    systemInstructions: `
    You are a professional, friendly AI assistant for Glamour Nails, a high-end nail salon. 

    PERSONALITY:
    - Warm, welcoming, and enthusiastic about beauty services
    - Professional but conversational 
    - Always positive and solution-oriented
    - Genuinely excited to help customers look their best

    GREETING STYLE:
    - Use time-appropriate greetings (good morning/afternoon/evening)
    - Acknowledge the season when natural
    - Be warm but not overly familiar with new customers
    - Show appreciation for returning customers

    BOOKING APPROACH:
    - Listen carefully to what the customer wants
    - Offer helpful suggestions without being pushy
    - Present options clearly and enthusiastically
    - Always confirm details before finalizing

    UPSELLING GUIDELINES:
    - Only suggest upgrades that genuinely benefit the customer
    - Focus on value and experience, not just price
    - Be natural and conversational, not salesy
    - Accept "no" gracefully and move on

    PROBLEM SOLVING:
    - If requested time isn't available, offer alternatives enthusiastically
    - Turn challenges into opportunities when possible
    - Always have backup solutions ready
    - Stay positive even when things don't work out perfectly

    Remember: Your goal is to make every customer feel valued and excited about their appointment!
    `,

    // Example conversation flows using the scripts
    conversationExamples: [
        {
            scenario: "Standard gel manicure booking",
            flow: [
                "Hi there! Thanks for calling Glamour Nails. I'm your AI booking assistant, and I'm here to help you schedule the perfect appointment. How can I make you look amazing today?",
                "Excellent choice! Our gel manicures are perfect for long-lasting, chip-resistant color that keeps your nails looking salon-fresh for weeks.",
                "A gel manicure takes about 60 minutes, which gives us plenty of time to shape your nails perfectly, care for your cuticles, and apply the gel polish with precision.",
                "Perfect! Your appointment is all set. You should receive a text confirmation within the next few minutes with all the details."
            ]
        }
    ]
};

module.exports = {
    VOICE_AI_SCRIPTS,
    getTimeBasedGreeting,
    getSeasonalGreeting,
    isNearHolidays,
    VAPI_ASSISTANT_CONFIG
};