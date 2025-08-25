/**
 * DropFly Beauty Studio - Embeddable Booking Widget
 * Add this script to any website to enable appointment booking
 * 
 * Usage:
 * <script src="https://your-domain.com/booking-widget/embed.js"></script>
 * <div id="dropfly-booking-widget"></div>
 */

(function() {
    'use strict';

    // Configuration - Update these URLs
    const CONFIG = {
        WEBHOOK_URL: 'https://your-n8n-instance.app.n8n.cloud/webhook/web-booking',
        BUSINESS_NAME: 'DropFly Beauty Studio',
        BUSINESS_PHONE: '(555) 123-4567',
        BUSINESS_HOURS: {
            'monday': { start: '09:00', end: '18:00' },
            'tuesday': { start: '09:00', end: '18:00' },
            'wednesday': { start: '09:00', end: '18:00' },
            'thursday': { start: '09:00', end: '18:00' },
            'friday': { start: '09:00', end: '18:00' },
            'saturday': { start: '09:00', end: '16:00' },
            'sunday': { start: '11:00', end: '15:00' }
        },
        SERVICES: [
            { id: 'manicure_signature', name: 'Signature Manicure', duration: 60, price: 45 },
            { id: 'manicure_gel', name: 'Gel Manicure', duration: 75, price: 55 },
            { id: 'pedicure_signature', name: 'Signature Pedicure', duration: 75, price: 50 },
            { id: 'pedicure_spa', name: 'Spa Pedicure', duration: 90, price: 65 },
            { id: 'combo_mani_pedi', name: 'Mani + Pedi Combo', duration: 120, price: 85 },
            { id: 'nail_art', name: 'Nail Art Design', duration: 30, price: 25 }
        ],
        TECHNICIANS: [
            { id: 'Sarah', name: 'Sarah - Manicure & Nail Art Specialist' },
            { id: 'Maya', name: 'Maya - Pedicure & Combo Expert' },
            { id: 'Jessica', name: 'Jessica - All-Around Specialist' }
        ]
    };

    // Widget HTML Template
    const WIDGET_HTML = `
        <div id="df-booking-widget" style="
            max-width: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #f97316 0%, #d946ef 100%);
                padding: 24px;
                text-align: center;
                color: white;
            ">
                <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Book Your Appointment</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">${CONFIG.BUSINESS_NAME}</p>
            </div>

            <!-- Form -->
            <form id="df-booking-form" style="padding: 24px;">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Full Name</label>
                    <input type="text" name="customer_name" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Email</label>
                    <input type="email" name="customer_email" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Phone</label>
                    <input type="tel" name="customer_phone" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Service</label>
                    <select name="service_type" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                        <option value="">Choose a service...</option>
                        ${CONFIG.SERVICES.map(service => 
                            `<option value="${service.id}" data-duration="${service.duration}" data-price="${service.price}">
                                ${service.name} - $${service.price} (${service.duration} min)
                            </option>`
                        ).join('')}
                    </select>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Technician (Optional)</label>
                    <select name="technician_name" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                        <option value="">Any available</option>
                        ${CONFIG.TECHNICIANS.map(tech => 
                            `<option value="${tech.id}">${tech.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Date</label>
                    <input type="date" name="appointment_date" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-weight: 500; margin-bottom: 4px; font-size: 14px;">Time</label>
                    <select name="start_time" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                    ">
                        <option value="">Choose time...</option>
                    </select>
                </div>

                <button type="submit" style="
                    width: 100%;
                    background: linear-gradient(135deg, #f97316 0%, #d946ef 100%);
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    cursor: pointer;
                    transition: opacity 0.2s;
                " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    Book Appointment
                </button>
            </form>

            <!-- Loading State -->
            <div id="df-loading" style="display: none; padding: 40px; text-align: center;">
                <div style="
                    width: 32px;
                    height: 32px;
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid #f97316;
                    border-radius: 50%;
                    animation: df-spin 1s linear infinite;
                    margin: 0 auto 16px;
                "></div>
                <p style="margin: 0; color: #6b7280;">Processing your booking...</p>
            </div>

            <!-- Success State -->
            <div id="df-success" style="display: none; padding: 40px; text-align: center;">
                <div style="
                    width: 48px;
                    height: 48px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                ">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h3 style="margin: 0 0 8px 0; font-weight: 600;">Booking Sent!</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">We'll confirm your appointment shortly.</p>
            </div>

            <!-- Error State -->
            <div id="df-error" style="display: none; padding: 40px; text-align: center;">
                <div style="
                    width: 48px;
                    height: 48px;
                    background: #ef4444;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                ">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </div>
                <h3 style="margin: 0 0 8px 0; font-weight: 600;">Booking Failed</h3>
                <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">Please call us or try again.</p>
                <a href="tel:${CONFIG.BUSINESS_PHONE}" style="
                    color: #f97316;
                    text-decoration: none;
                    font-weight: 500;
                ">${CONFIG.BUSINESS_PHONE}</a>
            </div>
        </div>

        <style>
            @keyframes df-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;

    // Widget functionality
    class BookingWidget {
        constructor(container) {
            this.container = container;
            this.init();
        }

        init() {
            this.container.innerHTML = WIDGET_HTML;
            this.setupEventListeners();
            this.setMinDate();
        }

        setupEventListeners() {
            const form = this.container.querySelector('#df-booking-form');
            const dateInput = this.container.querySelector('input[name="appointment_date"]');
            
            form.addEventListener('submit', this.handleSubmit.bind(this));
            dateInput.addEventListener('change', this.populateTimeSlots.bind(this));
        }

        setMinDate() {
            const dateInput = this.container.querySelector('input[name="appointment_date"]');
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            dateInput.min = tomorrow.toISOString().split('T')[0];
            
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 30);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }

        populateTimeSlots() {
            const dateInput = this.container.querySelector('input[name="appointment_date"]');
            const timeSelect = this.container.querySelector('select[name="start_time"]');
            
            timeSelect.innerHTML = '<option value="">Choose time...</option>';
            
            if (!dateInput.value) return;
            
            const selectedDate = new Date(dateInput.value);
            const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
            
            const hours = CONFIG.BUSINESS_HOURS[dayName];
            if (!hours) {
                timeSelect.innerHTML += '<option value="">Closed this day</option>';
                return;
            }
            
            const [startHour, startMin] = hours.start.split(':').map(Number);
            const [endHour, endMin] = hours.end.split(':').map(Number);
            
            let currentTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
            
            while (currentTime < endTime) {
                const hour = Math.floor(currentTime / 60);
                const min = currentTime % 60;
                const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                
                const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                timeSelect.innerHTML += `<option value="${timeString}">${displayTime}</option>`;
                currentTime += 30;
            }
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            const form = this.container.querySelector('#df-booking-form');
            const loading = this.container.querySelector('#df-loading');
            const success = this.container.querySelector('#df-success');
            const error = this.container.querySelector('#df-error');
            
            // Show loading
            form.style.display = 'none';
            loading.style.display = 'block';
            success.style.display = 'none';
            error.style.display = 'none';
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Add service details
            const serviceSelect = form.querySelector('select[name="service_type"]');
            const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
            data.service_duration = parseInt(selectedOption.getAttribute('data-duration'));
            data.service_price = parseInt(selectedOption.getAttribute('data-price'));
            data.booking_source = 'website_widget';
            data.timestamp = new Date().toISOString();
            
            try {
                const response = await fetch(CONFIG.WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                loading.style.display = 'none';
                
                if (response.ok) {
                    success.style.display = 'block';
                } else {
                    throw new Error('Booking failed');
                }
                
            } catch (err) {
                loading.style.display = 'none';
                error.style.display = 'block';
            }
        }
    }

    // Initialize widget when DOM is ready
    function initWidget() {
        const containers = document.querySelectorAll('#dropfly-booking-widget, .dropfly-booking-widget');
        
        containers.forEach(container => {
            if (!container.dataset.initialized) {
                new BookingWidget(container);
                container.dataset.initialized = 'true';
            }
        });
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

    // Expose for manual initialization
    window.DropFlyBooking = { init: initWidget };
    
})();