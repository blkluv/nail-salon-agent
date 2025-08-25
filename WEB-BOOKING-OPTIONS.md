# Online/Web Booking Integration Options

## 🌐 **The Complete Channel Strategy**

**Your multi-channel booking platform:**
- 📞 **Voice calls** → Vapi AI → Database
- 📱 **SMS texts** → SMS webhook → Same functions → Database  
- 💻 **Web booking** → Booking widget → Same functions → Database
- 📊 **All show up** in same dashboard

## 🎯 **Web Booking Implementation Strategies**

### **Option 1: Embeddable Booking Widget** ⭐ RECOMMENDED

Create a small widget that salons embed on their existing websites:

```html
<!-- Salon adds this to their website -->
<iframe src="https://booking.yourdomain.com/widget/salon-id" 
        width="400" height="600" frameborder="0">
</iframe>

<!-- Or JavaScript embed -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://booking.yourdomain.com/widget.js';
    script.setAttribute('data-salon-id', 'salon-123');
    document.head.appendChild(script);
  })();
</script>
```

### **Option 2: Hosted Booking Pages**

Give each salon a dedicated booking page:
```
https://booking.yourdomain.com/sparkle-nails
https://booking.yourdomain.com/glamour-salon  
https://booking.yourdomain.com/nail-paradise
```

### **Option 3: Social Media Integration**

Direct booking links for social media:
```
Instagram Bio: "Book online: bit.ly/sparkle-nails-book"
Facebook: Direct booking button
Google Business: Integrated booking
```

## 🚀 **Recommended Implementation: Smart Booking Widget**

### **Architecture:**
```
Salon Website → Booking Widget → Your API → Same Database → Dashboard
```

### **Technical Flow:**
```javascript
// Widget loads on salon website
// Shows real-time availability 
// Customer books appointment
// Uses SAME booking functions as voice/SMS
// Saves to SAME database
// Salon sees ALL bookings in one dashboard
```

## 💻 **Implementation Plan**

### **Phase 1: Basic Booking Widget**

Create a React component that:
1. **Loads salon's services** from your database
2. **Shows real-time availability** using existing functions
3. **Books appointments** using existing logic
4. **Embeds anywhere** with simple HTML/JavaScript

### **Phase 2: Enhanced Widget Features**

1. **Service selection** with photos and descriptions
2. **Staff selection** (book with specific technician)  
3. **Time slot picker** with visual calendar
4. **Customer information** form with validation
5. **Booking confirmation** with calendar add buttons

### **Phase 3: Advanced Features**

1. **Package deals** and upsells
2. **Loyalty program** integration
3. **Review collection** post-appointment
4. **Social media** sharing

## 🛠️ **Code Implementation**

### **Booking Widget Component:**

```javascript
// BookingWidget.tsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface BookingWidgetProps {
  businessId: string;
  theme?: 'light' | 'dark';
  primaryColor?: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({ 
  businessId, 
  theme = 'light',
  primaryColor = '#8B5CF6' 
}) => {
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [step, setStep] = useState(1); // 1: service, 2: date/time, 3: info, 4: confirm

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Load business and services
  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    // Load business info
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
    
    setBusiness(businessData);

    // Load services  
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
    
    setServices(servicesData || []);
  };

  const checkAvailability = async (date: string) => {
    // Use SAME availability logic as voice/SMS
    const response = await fetch('/api/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: businessId,
        preferred_date: date,
        service_type: selectedService?.name
      })
    });
    
    const result = await response.json();
    setAvailableSlots(result.available_times || []);
  };

  const bookAppointment = async () => {
    // Use SAME booking logic as voice/SMS
    const response = await fetch('/api/book-appointment', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: businessId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email,
        service_type: selectedService?.name,
        appointment_date: selectedDate,
        start_time: selectedTime,
        booking_source: 'web'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setStep(4); // Show confirmation
    } else {
      alert('Booking failed: ' + result.error);
    }
  };

  return (
    <div className={`booking-widget ${theme}`} 
         style={{ '--primary-color': primaryColor }}>
      
      {/* Header */}
      <div className="widget-header">
        <h3>Book with {business?.name}</h3>
        <div className="step-indicator">Step {step} of 4</div>
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="service-selection">
          <h4>Choose a Service</h4>
          {services.map(service => (
            <div 
              key={service.id}
              className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
              onClick={() => setSelectedService(service)}
            >
              <div className="service-name">{service.name}</div>
              <div className="service-details">
                {service.duration_minutes}min • ${service.price}
              </div>
            </div>
          ))}
          
          {selectedService && (
            <button onClick={() => setStep(2)} className="next-btn">
              Continue
            </button>
          )}
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && (
        <div className="datetime-selection">
          <h4>Select Date & Time</h4>
          
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              checkAvailability(e.target.value);
            }}
            min={new Date().toISOString().split('T')[0]}
          />
          
          {availableSlots.length > 0 && (
            <div className="time-slots">
              {availableSlots.map(time => (
                <button
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          )}
          
          {selectedTime && (
            <button onClick={() => setStep(3)} className="next-btn">
              Continue
            </button>
          )}
        </div>
      )}

      {/* Step 3: Customer Information */}
      {step === 3 && (
        <div className="customer-info">
          <h4>Your Information</h4>
          
          <input
            type="text"
            placeholder="Full Name"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
          />
          
          <input
            type="tel"
            placeholder="Phone Number"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
          />
          
          <input
            type="email"
            placeholder="Email Address"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
          />
          
          <button onClick={bookAppointment} className="book-btn">
            Book Appointment
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="confirmation">
          <h4>✅ Booking Confirmed!</h4>
          <div className="booking-details">
            <p><strong>Service:</strong> {selectedService?.name}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {formatTime(selectedTime)}</p>
            <p><strong>Duration:</strong> {selectedService?.duration_minutes}min</p>
            <p><strong>Price:</strong> ${selectedService?.price}</p>
          </div>
          
          <button onClick={() => setStep(1)} className="book-another-btn">
            Book Another Appointment
          </button>
        </div>
      )}
    </div>
  );
};

function formatTime(time: string) {
  const [hour, minute] = time.split(':');
  const hourInt = parseInt(hour);
  const period = hourInt >= 12 ? 'PM' : 'AM';
  const displayHour = hourInt > 12 ? hourInt - 12 : hourInt;
  return `${displayHour}:${minute} ${period}`;
}
```

### **API Endpoints (Reuse Existing Logic):**

```javascript
// /api/check-availability (NEW)
export default async function handler(req, res) {
  const { business_id, preferred_date, service_type } = req.body;
  
  // Use SAME checkAvailability function as voice/SMS
  const result = await checkAvailability({ 
    preferred_date, 
    service_type 
  }, business_id);
  
  res.json(result);
}

// /api/book-appointment (NEW)  
export default async function handler(req, res) {
  const bookingData = req.body;
  
  // Use SAME bookAppointment function as voice/SMS
  const result = await bookAppointment(bookingData, bookingData.business_id);
  
  res.json(result);
}
```

## 🎨 **Widget Embedding & Customization**

### **Simple Embed Code for Salons:**

```html
<!-- Option 1: iframe embed -->
<iframe 
  src="https://yourdomain.com/widget/8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad"
  width="400" 
  height="600" 
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>

<!-- Option 2: JavaScript embed with customization -->
<script>
  window.BookingWidget = {
    businessId: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
    theme: 'light',
    primaryColor: '#8B5CF6',
    position: 'bottom-right' // floating widget
  };
</script>
<script src="https://yourdomain.com/widget.js"></script>
```

### **Customization Options:**
- **Colors**: Match salon's branding
- **Size**: Compact, standard, or full-page
- **Position**: Embedded or floating widget
- **Language**: Multi-language support

## 💰 **Cost & Implementation**

### **Additional Costs:** 
- **Hosting**: $5-10/month (for widget hosting)
- **Domain**: $12/year (booking.yourdomain.com)
- **Total**: ~$10-15/month operational cost

### **Implementation Time:**
- **Basic widget**: 8-12 hours
- **Enhanced features**: 16-20 hours  
- **Full customization**: 24-32 hours

### **Value for Salons:**
- **24/7 online presence** (website visitors convert immediately)
- **Mobile-friendly booking** (60% of traffic is mobile)
- **Reduces phone load** (staff can focus on services)
- **Professional appearance** (modern booking experience)

## 🎯 **Integration with Existing System**

### **Onboarding Enhancement:**

Add to Step 5 (Phone Setup):

```javascript
// Enhanced booking preferences
const [bookingChannels, setBookingChannels] = useState({
  voice_enabled: true,
  sms_enabled: true,
  web_enabled: true,
  widget_style: 'embedded', // 'embedded', 'floating', 'fullpage'
  widget_color: '#8B5CF6'
});
```

### **Dashboard Integration:**

All bookings show with source indicator:
```
📞 Sarah Johnson - Gel Mani - 2pm (VOICE)
📱 Emma Davis - Pedicure - 3pm (SMS) 
💻 Lisa Wong - Combo - 4pm (WEB)
```

## 🚀 **Customer Experience Across All Channels**

### **Same Salon, Multiple Ways to Book:**

**Option A - Voice Call:**
```
Customer calls → AI answers → Books appointment
```

**Option B - Text Message:**  
```
Customer texts → AI processes → Books appointment
```

**Option C - Website Widget:**
```
Customer visits website → Uses booking widget → Books appointment
```

**All three** save to the same database and show up in the same dashboard!

## 🎯 **This Completes the Trinity!**

With voice + SMS + web booking, you'll have built a **complete omnichannel booking platform** that handles every possible customer preference:

- **Traditional customers** → Phone calls
- **Younger customers** → Text messages  
- **Tech-savvy customers** → Online booking
- **Busy customers** → Whatever's most convenient

Want me to implement the booking widget? This would make your platform **genuinely competitive** with major booking systems like Acuity, Calendly, and Square Appointments! 🌟