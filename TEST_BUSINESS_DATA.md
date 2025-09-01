# 🧪 Test Business Data for Onboarding - Three Subscription Levels

## 📋 **Business 1: Starter Plan ($47/month)**

### **Business Information**
- **Business Name:** Bella's Nails Studio
- **Owner:** Bella Rodriguez
- **Email:** bella@bellasnails.com
- **Phone:** (555) 123-4567
- **Address:** 123 Main Street, Los Angeles, CA 90210
- **Website:** www.bellasnails.com
- **Timezone:** America/Los_Angeles
- **Business Hours:**
  - Monday-Friday: 9:00 AM - 7:00 PM
  - Saturday: 9:00 AM - 6:00 PM  
  - Sunday: 11:00 AM - 5:00 PM

### **Services (Starter Level)**
```json
[
  {
    "name": "Classic Manicure",
    "duration": 30,
    "price": 25,
    "category": "Manicures",
    "description": "Basic nail care with polish"
  },
  {
    "name": "Classic Pedicure", 
    "duration": 45,
    "price": 35,
    "category": "Pedicures",
    "description": "Relaxing foot care with polish"
  },
  {
    "name": "Gel Manicure",
    "duration": 45,
    "price": 40,
    "category": "Manicures",
    "description": "Long-lasting gel polish"
  },
  {
    "name": "Nail Art (Basic)",
    "duration": 15,
    "price": 10,
    "category": "Add-ons",
    "description": "Simple nail art designs"
  }
]
```

### **Staff Members**
```json
[
  {
    "first_name": "Bella",
    "last_name": "Rodriguez",
    "email": "bella@bellasnails.com",
    "phone": "(555) 123-4567",
    "role": "Owner/Technician",
    "availability": {
      "monday": {"start": "09:00", "end": "19:00"},
      "tuesday": {"start": "09:00", "end": "19:00"},
      "wednesday": {"start": "09:00", "end": "19:00"},
      "thursday": {"start": "09:00", "end": "19:00"},
      "friday": {"start": "09:00", "end": "19:00"},
      "saturday": {"start": "09:00", "end": "18:00"},
      "sunday": {"start": "11:00", "end": "17:00"}
    }
  },
  {
    "first_name": "Maria",
    "last_name": "Santos",
    "email": "maria@bellasnails.com",
    "phone": "(555) 123-4568",
    "role": "Nail Technician",
    "availability": {
      "tuesday": {"start": "10:00", "end": "18:00"},
      "wednesday": {"start": "10:00", "end": "18:00"},
      "thursday": {"start": "10:00", "end": "18:00"},
      "friday": {"start": "10:00", "end": "18:00"},
      "saturday": {"start": "09:00", "end": "18:00"}
    }
  }
]
```

### **Expected Features (Starter)**
- ✅ AI Voice Booking
- ✅ Web Booking Widget
- ✅ Basic Customer Management
- ✅ SMS Confirmations
- ❌ Payment Processing (locked)
- ❌ Email Marketing (locked)  
- ❌ Loyalty Program (locked)
- ❌ Multiple Locations (locked)

---

## 📋 **Business 2: Professional Plan ($97/month)**

### **Business Information**
- **Business Name:** Elite Nail Lounge
- **Owner:** Sarah Kim
- **Email:** sarah@elitenaillo unge.com
- **Phone:** (555) 234-5678
- **Address:** 456 Fashion Ave, Beverly Hills, CA 90211
- **Website:** www.elitenaillounge.com
- **Timezone:** America/Los_Angeles
- **Business Hours:**
  - Monday-Thursday: 9:00 AM - 8:00 PM
  - Friday-Saturday: 8:00 AM - 9:00 PM
  - Sunday: 10:00 AM - 6:00 PM

### **Services (Professional Level)**
```json
[
  {
    "name": "Signature Manicure",
    "duration": 45,
    "price": 45,
    "category": "Manicures",
    "description": "Premium manicure with luxury treatment"
  },
  {
    "name": "Deluxe Pedicure",
    "duration": 60,
    "price": 65,
    "category": "Pedicures", 
    "description": "Spa pedicure with massage and aromatherapy"
  },
  {
    "name": "Gel Extensions",
    "duration": 90,
    "price": 85,
    "category": "Extensions",
    "description": "Professional gel nail extensions"
  },
  {
    "name": "Dip Powder Manicure",
    "duration": 60,
    "price": 55,
    "category": "Manicures",
    "description": "Long-lasting dip powder system"
  },
  {
    "name": "Advanced Nail Art",
    "duration": 30,
    "price": 25,
    "category": "Add-ons",
    "description": "Complex designs and embellishments"
  },
  {
    "name": "Paraffin Treatment",
    "duration": 15,
    "price": 15,
    "category": "Add-ons",
    "description": "Moisturizing paraffin wax treatment"
  }
]
```

### **Staff Members**
```json
[
  {
    "first_name": "Sarah",
    "last_name": "Kim",
    "email": "sarah@elitenaillounge.com",
    "phone": "(555) 234-5678", 
    "role": "Owner/Master Technician",
    "specialties": ["Nail Art", "Extensions"],
    "availability": {
      "monday": {"start": "09:00", "end": "20:00"},
      "tuesday": {"start": "09:00", "end": "20:00"},
      "wednesday": {"start": "09:00", "end": "20:00"},
      "thursday": {"start": "09:00", "end": "20:00"},
      "friday": {"start": "08:00", "end": "21:00"},
      "saturday": {"start": "08:00", "end": "21:00"}
    }
  },
  {
    "first_name": "Jennifer",
    "last_name": "Chang", 
    "email": "jennifer@elitenaillounge.com",
    "phone": "(555) 234-5679",
    "role": "Senior Technician",
    "specialties": ["Gel Extensions", "Pedicures"],
    "availability": {
      "tuesday": {"start": "10:00", "end": "19:00"},
      "wednesday": {"start": "10:00", "end": "19:00"},
      "thursday": {"start": "10:00", "end": "19:00"},
      "friday": {"start": "09:00", "end": "20:00"},
      "saturday": {"start": "09:00", "end": "20:00"},
      "sunday": {"start": "10:00", "end": "18:00"}
    }
  },
  {
    "first_name": "Lisa",
    "last_name": "Patel",
    "email": "lisa@elitenaillounge.com", 
    "phone": "(555) 234-5680",
    "role": "Nail Technician",
    "specialties": ["Manicures", "Nail Art"],
    "availability": {
      "monday": {"start": "11:00", "end": "19:00"},
      "wednesday": {"start": "11:00", "end": "19:00"},
      "thursday": {"start": "11:00", "end": "19:00"},
      "friday": {"start": "10:00", "end": "20:00"},
      "saturday": {"start": "09:00", "end": "21:00"},
      "sunday": {"start": "10:00", "end": "18:00"}
    }
  }
]
```

### **Payment Setup (Professional)**
```json
{
  "processor": "stripe",
  "stripeEnabled": true,
  "squareEnabled": false,
  "stripeApiKey": "pk_test_...", 
  "tipEnabled": true,
  "tipPercentages": [15, 18, 20, 22, 25]
}
```

### **Loyalty Program Setup**
```json
{
  "enabled": true,
  "programName": "Elite Rewards",
  "pointsPerDollar": 1,
  "pointsPerVisit": 10,
  "rewardTiers": [
    {
      "points": 100,
      "reward": "10% off next visit",
      "discount": 10
    },
    {
      "points": 250,
      "reward": "Free nail art",
      "discount": 25
    },
    {
      "points": 500,
      "reward": "Free deluxe pedicure",
      "discount": 65
    }
  ]
}
```

### **Expected Features (Professional)**
- ✅ AI Voice Booking
- ✅ Web Booking Widget
- ✅ Advanced Customer Management
- ✅ SMS Confirmations
- ✅ Payment Processing (Stripe)
- ✅ Email Marketing Campaigns
- ✅ Loyalty Program
- ✅ Advanced Analytics
- ❌ Multiple Locations (locked)
- ❌ Custom Integrations (locked)

---

## 📋 **Business 3: Business Plan ($197/month)**

### **Business Information**  
- **Business Name:** Luxe Nail Spa Chain
- **Owner:** Michael Chen
- **Email:** michael@luxenailspa.com
- **Phone:** (555) 345-6789
- **Address:** 789 Rodeo Drive, Beverly Hills, CA 90210
- **Website:** www.luxenailspa.com
- **Timezone:** America/Los_Angeles

### **Multiple Locations**
```json
[
  {
    "name": "Luxe Nail Spa - Beverly Hills",
    "address": "789 Rodeo Drive",
    "city": "Beverly Hills",
    "state": "CA", 
    "postal_code": "90210",
    "phone": "(555) 345-6789",
    "email": "beverlyhills@luxenailspa.com",
    "isPrimary": true,
    "hours": {
      "monday": {"start": "08:00", "end": "21:00"},
      "tuesday": {"start": "08:00", "end": "21:00"},
      "wednesday": {"start": "08:00", "end": "21:00"},
      "thursday": {"start": "08:00", "end": "21:00"},
      "friday": {"start": "08:00", "end": "22:00"},
      "saturday": {"start": "08:00", "end": "22:00"},
      "sunday": {"start": "09:00", "end": "20:00"}
    }
  },
  {
    "name": "Luxe Nail Spa - Santa Monica",
    "address": "321 Ocean Blvd",
    "city": "Santa Monica", 
    "state": "CA",
    "postal_code": "90401",
    "phone": "(555) 345-6790",
    "email": "santamonica@luxenailspa.com",
    "isPrimary": false,
    "hours": {
      "monday": {"start": "09:00", "end": "20:00"},
      "tuesday": {"start": "09:00", "end": "20:00"},
      "wednesday": {"start": "09:00", "end": "20:00"},
      "thursday": {"start": "09:00", "end": "20:00"},
      "friday": {"start": "09:00", "end": "21:00"},
      "saturday": {"start": "08:00", "end": "21:00"},
      "sunday": {"start": "10:00", "end": "19:00"}
    }
  },
  {
    "name": "Luxe Nail Spa - Malibu",
    "address": "654 PCH",
    "city": "Malibu",
    "state": "CA",
    "postal_code": "90265", 
    "phone": "(555) 345-6791",
    "email": "malibu@luxenailspa.com",
    "isPrimary": false,
    "hours": {
      "monday": {"start": "10:00", "end": "19:00"},
      "tuesday": {"start": "10:00", "end": "19:00"},
      "wednesday": {"start": "10:00", "end": "19:00"},
      "thursday": {"start": "10:00", "end": "19:00"},
      "friday": {"start": "09:00", "end": "20:00"},
      "saturday": {"start": "09:00", "end": "20:00"},
      "sunday": {"start": "10:00", "end": "18:00"}
    }
  }
]
```

### **Premium Services (Business Level)**
```json
[
  {
    "name": "Luxury Signature Manicure",
    "duration": 60,
    "price": 75,
    "category": "Signature Services",
    "description": "Ultimate luxury manicure with premium products"
  },
  {
    "name": "Royal Pedicure Experience",
    "duration": 90,
    "price": 95,
    "category": "Signature Services", 
    "description": "Spa pedicure with hot stone massage and aromatherapy"
  },
  {
    "name": "Custom Nail Extensions",
    "duration": 120,
    "price": 125,
    "category": "Extensions",
    "description": "Bespoke nail extensions with custom design"
  },
  {
    "name": "3D Nail Art Masterpiece",
    "duration": 45,
    "price": 50,
    "category": "Nail Art",
    "description": "Complex 3D designs with premium embellishments"
  },
  {
    "name": "Couples Manicure Package", 
    "duration": 90,
    "price": 140,
    "category": "Packages",
    "description": "Side-by-side luxury manicures for couples"
  },
  {
    "name": "Bridal Party Package",
    "duration": 180,
    "price": 300,
    "category": "Packages", 
    "description": "Complete nail service for wedding parties"
  }
]
```

### **Enterprise Staff (Multi-Location)**
```json
[
  {
    "first_name": "Michael",
    "last_name": "Chen",
    "email": "michael@luxenailspa.com",
    "phone": "(555) 345-6789",
    "role": "Owner/CEO",
    "location": "Beverly Hills",
    "availability": "By appointment"
  },
  {
    "first_name": "Sophia",
    "last_name": "Martinez",
    "email": "sophia@luxenailspa.com",
    "phone": "(555) 345-6792",
    "role": "Master Technician", 
    "location": "Beverly Hills",
    "specialties": ["3D Nail Art", "Bridal Services"],
    "availability": {
      "tuesday": {"start": "08:00", "end": "21:00"},
      "wednesday": {"start": "08:00", "end": "21:00"},
      "thursday": {"start": "08:00", "end": "21:00"},
      "friday": {"start": "08:00", "end": "22:00"},
      "saturday": {"start": "08:00", "end": "22:00"}
    }
  },
  {
    "first_name": "Emma",
    "last_name": "Johnson",
    "email": "emma@luxenailspa.com",
    "phone": "(555) 345-6793",
    "role": "Location Manager",
    "location": "Santa Monica",
    "specialties": ["Extensions", "Luxury Services"],
    "availability": {
      "monday": {"start": "09:00", "end": "20:00"},
      "tuesday": {"start": "09:00", "end": "20:00"},
      "wednesday": {"start": "09:00", "end": "20:00"},
      "thursday": {"start": "09:00", "end": "20:00"},
      "friday": {"start": "09:00", "end": "21:00"}
    }
  },
  {
    "first_name": "Zoe",
    "last_name": "Williams",
    "email": "zoe@luxenailspa.com",
    "phone": "(555) 345-6794", 
    "role": "Senior Technician",
    "location": "Malibu",
    "specialties": ["Pedicures", "Nail Art"],
    "availability": {
      "wednesday": {"start": "10:00", "end": "19:00"},
      "thursday": {"start": "10:00", "end": "19:00"},
      "friday": {"start": "09:00", "end": "20:00"},
      "saturday": {"start": "09:00", "end": "20:00"},
      "sunday": {"start": "10:00", "end": "18:00"}
    }
  }
]
```

### **Advanced Payment Setup**
```json
{
  "processor": "both",
  "stripeEnabled": true,
  "squareEnabled": true,
  "stripeApiKey": "pk_test_...",
  "squareApiKey": "sq_test_...", 
  "tipEnabled": true,
  "tipPercentages": [18, 20, 22, 25, 30],
  "locationSpecificProcessors": {
    "beverlyhills": "stripe",
    "santamonica": "square", 
    "malibu": "stripe"
  }
}
```

### **Premium Loyalty Program**
```json
{
  "enabled": true,
  "programName": "Luxe VIP Club",
  "pointsPerDollar": 2,
  "pointsPerVisit": 25,
  "rewardTiers": [
    {
      "points": 200,
      "reward": "15% off next visit",
      "discount": 15
    },
    {
      "points": 500,
      "reward": "Free luxury manicure",
      "discount": 75
    },
    {
      "points": 1000,
      "reward": "Free signature service",
      "discount": 125
    },
    {
      "points": 2000,
      "reward": "VIP member for life",
      "discount": 300
    }
  ]
}
```

### **Expected Features (Business)**
- ✅ AI Voice Booking
- ✅ Web Booking Widget  
- ✅ Enterprise Customer Management
- ✅ SMS Confirmations
- ✅ Payment Processing (Stripe + Square)
- ✅ Advanced Email Marketing
- ✅ Premium Loyalty Program
- ✅ Multi-Location Support (3 locations)
- ✅ Advanced Analytics & Reporting
- ✅ Custom Integrations
- ✅ White-Label Options
- ✅ Priority Phone Support

---

## 🧪 **Testing Strategy**

### **Sequential Testing Approach:**
1. **Create Business 1 (Starter)** - Test basic functionality and limitations
2. **Create Business 2 (Professional)** - Test payment and loyalty features  
3. **Create Business 3 (Business)** - Test multi-location and enterprise features

### **Verification Points:**
- Each business gets unique phone number
- Plan features are properly enforced
- AI knows business-specific information
- Data isolation between businesses
- Upgrade prompts work correctly
- Dashboard shows appropriate features

### **Success Criteria:**
- ✅ All three businesses onboard successfully
- ✅ Each gets working phone number
- ✅ AI responds with business-specific data
- ✅ Plan enforcement working correctly
- ✅ Payment processing (Professional+ only)
- ✅ Multi-location support (Business only)

Ready to start with **Bella's Nails Studio (Starter Plan)**?