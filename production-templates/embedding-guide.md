# Embedding Guide - Nail Salon Booking Widget

## 🚀 Quick Embed Options

Choose the method that works best for your website:

1. **Full Page Iframe** - Embed entire booking page
2. **Mini Widget** - Compact booking button
3. **QR Code Generator** - For print materials
4. **Direct Link** - Simple link to booking page

---

## 1. Full Page Iframe Embed

### Basic Iframe
```html
<iframe 
    src="https://vapi-nail-salon-agent-production.up.railway.app/widget/book" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
</iframe>
```

### Responsive Iframe
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 100%; overflow: hidden;">
    <iframe 
        src="https://vapi-nail-salon-agent-production.up.railway.app/widget/book"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 15px;"
        allowfullscreen>
    </iframe>
</div>
```

### WordPress Shortcode
Add this to your WordPress theme's functions.php:
```php
function glamour_nails_booking_widget() {
    return '<div style="position: relative; width: 100%; height: 0; padding-bottom: 100%;"><iframe src="https://vapi-nail-salon-agent-production.up.railway.app/widget/book" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 15px;"></iframe></div>';
}
add_shortcode('booking_widget', 'glamour_nails_booking_widget');
```

Then use in posts/pages: `[booking_widget]`

---

## 2. Mini Widget Button

### Floating Action Button
```html
<div id="booking-fab" style="
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 1000;
    background: linear-gradient(135deg, #ff6b9d, #ff8cc8);
    color: white;
    border-radius: 50px;
    padding: 15px 25px;
    box-shadow: 0 5px 20px rgba(255, 107, 157, 0.3);
    cursor: pointer;
    font-family: 'Segoe UI', sans-serif;
    font-weight: bold;
    font-size: 16px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: transform 0.3s ease;
">
    💅 <span>Book Now</span>
</div>

<script>
document.getElementById('booking-fab').addEventListener('click', function() {
    window.open('https://vapi-nail-salon-agent-production.up.railway.app/widget/book', 
                'booking', 
                'width=500,height=800,scrollbars=yes,resizable=yes');
});

// Add hover effect
document.getElementById('booking-fab').addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
});

document.getElementById('booking-fab').addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
});
</script>
```

### Simple Button
```html
<a href="https://vapi-nail-salon-agent-production.up.railway.app/widget/book" 
   target="_blank"
   style="
    display: inline-block;
    background: linear-gradient(135deg, #ff6b9d, #ff8cc8);
    color: white;
    padding: 15px 30px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: bold;
    font-size: 18px;
    box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
    transition: transform 0.3s ease;
">
    💅 Book Your Appointment
</a>
```

---

## 3. QR Code Integration

### Generate QR Code for Print Materials
```html
<div id="qr-code-container" style="text-align: center; padding: 20px;">
    <h3>Scan to Book</h3>
    <canvas id="booking-qr" width="200" height="200"></canvas>
    <p style="margin-top: 10px; font-size: 14px;">
        Point your phone camera at the code to book instantly!
    </p>
</div>

<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
<script>
QRCode.toCanvas(document.getElementById('booking-qr'), 
    'https://vapi-nail-salon-agent-production.up.railway.app/widget/book', {
    width: 200,
    color: {
        dark: '#ff6b9d',
        light: '#ffffff'
    }
});
</script>
```

### Printable QR Code (High Resolution)
```javascript
// Generate 300x300 QR code for print
QRCode.toDataURL('https://vapi-nail-salon-agent-production.up.railway.app/widget/book', {
    width: 300,
    margin: 2,
    color: {
        dark: '#000000',
        light: '#ffffff'
    }
}, function (err, url) {
    console.log(url); // Use this data URL for printing
});
```

---

## 4. Voice AI Call Button

### Direct Call Button
```html
<a href="tel:+14243519304" 
   style="
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #28a745;
    color: white;
    padding: 15px 30px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: bold;
    font-size: 18px;
    box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
">
    📞 Call AI Booking: (424) 351-9304
</a>
```

### Click-to-Call with Analytics
```html
<button onclick="trackAndCall()" style="
    background: #28a745;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
">
    📞 Book by Voice AI
</button>

<script>
function trackAndCall() {
    // Track the click for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'voice_booking_click', {
            event_category: 'booking',
            event_label: 'voice_ai'
        });
    }
    
    // Make the call
    window.location.href = 'tel:+14243519304';
}
</script>
```

---

## 5. Custom Integration Examples

### React Component
```jsx
import React, { useState } from 'react';

const BookingWidget = () => {
    const [showWidget, setShowWidget] = useState(false);
    
    return (
        <div>
            <button 
                onClick={() => setShowWidget(true)}
                className="booking-btn"
            >
                💅 Book Appointment
            </button>
            
            {showWidget && (
                <div className="modal-overlay" onClick={() => setShowWidget(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <iframe 
                            src="https://vapi-nail-salon-agent-production.up.railway.app/widget/book"
                            width="500" 
                            height="700"
                            frameBorder="0"
                        />
                        <button onClick={() => setShowWidget(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};
```

### Vue.js Component
```vue
<template>
  <div>
    <button @click="openBooking" class="booking-button">
      💅 Book Now
    </button>
    
    <div v-if="showModal" class="modal" @click="closeBooking">
      <div class="modal-content" @click.stop>
        <iframe 
          src="https://vapi-nail-salon-agent-production.up.railway.app/widget/book"
          width="500" 
          height="700"
        ></iframe>
        <button @click="closeBooking">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showModal: false
    }
  },
  methods: {
    openBooking() {
      this.showModal = true;
    },
    closeBooking() {
      this.showModal = false;
    }
  }
}
</script>
```

---

## 6. Website-Specific Instructions

### Wix
1. Add HTML Component
2. Paste iframe code
3. Set height to 800px
4. Enable responsive

### Squarespace
1. Add Code Block
2. Paste iframe code
3. Adjust height in Settings

### Shopify
1. Edit Theme Code
2. Add to product page template
3. Use liquid template variables if needed

### Google Sites
1. Insert > Embed URL
2. Paste widget URL
3. Set size to custom: 500x800

### Facebook Page
1. Create new tab
2. Use iframe URL as external link
3. Custom tab name: "Book Appointment"

---

## 7. Mobile Optimization

### Mobile-Specific Widget
```html
<div id="mobile-booking" style="display: none;">
    <a href="tel:+14243519304" 
       style="
        display: block;
        background: #28a745;
        color: white;
        text-align: center;
        padding: 20px;
        font-size: 20px;
        font-weight: bold;
        text-decoration: none;
        margin: 10px 0;
    ">
        📞 Call to Book: (424) 351-9304
    </a>
    
    <a href="https://vapi-nail-salon-agent-production.up.railway.app/widget/book" 
       style="
        display: block;
        background: #ff6b9d;
        color: white;
        text-align: center;
        padding: 20px;
        font-size: 20px;
        font-weight: bold;
        text-decoration: none;
    ">
        💅 Book Online
    </a>
</div>

<script>
// Show mobile version on small screens
if (window.innerWidth <= 768) {
    document.getElementById('mobile-booking').style.display = 'block';
}
</script>
```

---

## 8. Analytics & Tracking

### Google Analytics Event Tracking
```javascript
// Track widget opens
function trackBookingWidget() {
    gtag('event', 'booking_widget_open', {
        event_category: 'booking',
        event_label: 'widget'
    });
}

// Track voice AI clicks
function trackVoiceBooking() {
    gtag('event', 'voice_booking_click', {
        event_category: 'booking',
        event_label: 'voice_ai'
    });
}

// Add to your buttons
<button onclick="trackBookingWidget(); openWidget();">Book Now</button>
<a href="tel:+14243519304" onclick="trackVoiceBooking();">Call AI</a>
```

### Facebook Pixel Tracking
```javascript
// Track booking widget interactions
function trackBookingWidget() {
    if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout', {
            content_category: 'booking',
            content_name: 'appointment_widget'
        });
    }
}
```

---

## 9. Testing Your Integration

### Checklist
- [ ] Widget loads correctly on desktop
- [ ] Widget is mobile-responsive
- [ ] Call button works on mobile devices
- [ ] QR codes scan properly
- [ ] Analytics tracking works
- [ ] Widget matches your site's design

### Test URLs
- Desktop: Open widget URL in browser
- Mobile: Test on actual mobile device
- QR Code: Use phone camera app

---

## 10. Customization Options

### Color Scheme Matching
```css
/* Add to your site's CSS to match colors */
.booking-widget iframe {
    filter: hue-rotate(30deg); /* Adjust hue */
}

/* Or use CSS variables in the widget */
:root {
    --primary-color: #your-brand-color;
    --secondary-color: #your-secondary-color;
}
```

### Custom Domain Setup
Instead of the Railway URL, you can:
1. Set up custom subdomain: booking.yournailsalon.com
2. Point to Railway app
3. Update all embed codes

---

## 📞 Support

Need help with integration? 
- Check browser console for errors
- Test on different devices
- Contact support with specific error messages

**Integration Complete!** 🎉 Your customers can now book appointments directly from your website!