# Two-Phase Onboarding Flow Chart

## 🎯 Complete User Journey Visualization

```mermaid
graph TD
    A[Landing Page] --> B[Phase 1: Rapid Trial Start]
    
    subgraph "Phase 1 - Payment & Basic Setup (3 min)"
        B --> B1[Business Name]
        B1 --> B2[Business Phone]
        B2 --> B3[Owner Email]
        B3 --> B4[Business Type Dropdown]
        B4 --> B5[Plan Selection]
        B5 --> B6[💳 Payment Info + Billing]
        B6 --> B7[🤖 Auto-Generation Magic]
        
        subgraph "Auto-Generated (No User Input)"
            B7 --> B7a[Create Services by Type]
            B7 --> B7b[Create Owner Staff]
            B7 --> B7c[Set Default Hours 9-6]
            B7 --> B7d[Provision AI Phone Number]
            B7 --> B7e[Create AI Assistant]
        end
    end
    
    B7 --> C[🎉 AI Ready - Phone Number Assigned]
    C --> D[Immediate Redirect to Dashboard]
    
    subgraph "Phase 2 - Guided Dashboard Setup (10-15 min)"
        D --> D1[Welcome Tour Starts]
        
        D1 --> E1[Step 1: Services Setup]
        E1 --> E1a{Edit Services?}
        E1a -->|Required| E1b[At least 3 services configured]
        E1a -->|Optional| E1c[Add pricing details]
        E1a -->|Optional| E1d[Add service descriptions]
        E1a -->|Optional| E1e[Set service durations]
        E1b --> F1[✅ Services Complete]
        E1c --> F1
        E1d --> F1
        E1e --> F1
        
        F1 --> E2[Step 2: Staff Management]
        E2 --> E2a{Add More Staff?}
        E2a -->|Optional| E2b[Owner profile complete = OK]
        E2a -->|Optional| E2c[Add staff members]
        E2a -->|Optional| E2d[Set roles & schedules]
        E2b --> F2[✅ Staff Complete]
        E2c --> F2
        E2d --> F2
        
        F2 --> E3[Step 3: Business Hours]
        E3 --> E3a{Customize Hours?}
        E3a -->|Semi-Required| E3b[Basic M-F 9-6 = Minimum]
        E3a -->|Optional| E3c[Set weekend hours]
        E3a -->|Optional| E3d[Add holiday schedules]
        E3a -->|Optional| E3e[Configure break times]
        E3b --> F3[✅ Hours Complete]
        E3c --> F3
        E3d --> F3
        E3e --> F3
        
        F3 --> E4[Step 4: Business Profile]
        E4 --> E4a{Complete Profile?}
        E4a -->|Optional| E4b[Add full address]
        E4a -->|Optional| E4c[Upload logo]
        E4a -->|Optional| E4d[Set brand colors]
        E4a -->|Optional| E4e[Add website URL]
        E4b --> F4[✅ Profile Complete]
        E4c --> F4
        E4d --> F4
        E4e --> F4
        
        F4 --> E5[Step 5: Test Your AI]
        E5 --> E5a{Make Test Call?}
        E5a -->|Encouraged| E5b[Call AI Phone Number]
        E5a -->|Skip Available| E5c[Skip to Dashboard]
        E5b --> E5d[Real-time Call Monitoring]
        E5d --> E5e[See Booking Appear Live]
        E5e --> F5[✅ AI Tested]
        E5c --> F5
        
        F5 --> E6[Step 6: Dashboard Overview]
        E6 --> E6a[Show Test Appointment]
        E6 --> E6b[Explain Key Features]
        E6 --> E6c[Analytics Preview]
        E6 --> F6[✅ Setup Complete]
    end
    
    F6 --> G[🎊 Trial Fully Activated]
    
    subgraph "Trial Period Experience (7 days)"
        G --> H1[Day 1-2: Natural Usage]
        H1 --> H2[Day 3: Feature Nudges]
        H2 --> H3[Day 5: Success Metrics]
        H3 --> H4[Day 6: Upgrade Reminder]
        H4 --> H5[Day 7: Conversion Push]
    end
    
    H5 --> I{Convert to Paid?}
    I -->|Yes| J[✅ Successful Customer]
    I -->|No| K[Cancellation Flow]
    
    subgraph "Optional: Resume Later Flow"
        E1 --> SAVE1[💾 Progress Saved]
        E2 --> SAVE2[💾 Progress Saved]
        E3 --> SAVE3[💾 Progress Saved]
        E4 --> SAVE4[💾 Progress Saved]
        E5 --> SAVE5[💾 Progress Saved]
        
        SAVE1 --> RESUME[🔄 Resume Setup Later]
        SAVE2 --> RESUME
        SAVE3 --> RESUME
        SAVE4 --> RESUME
        SAVE5 --> RESUME
        
        RESUME --> L[Dashboard with Setup Prompt]
        L --> M[Continue Where Left Off]
    end

    style B fill:#ff9999
    style D fill:#99ff99
    style G fill:#9999ff
    style J fill:#99ff99
    style K fill:#ff9999
```

## 🎯 **REQUIRED vs OPTIONAL Breakdown**

### **✅ ABSOLUTELY REQUIRED (Can't Advance Without)**
| Step | Requirement | Why Critical |
|------|-------------|--------------|
| Phase 1 | Payment Info | Need committed trial user |
| Phase 1 | Basic Business Info | AI needs context to function |
| Step 1 | At least 3 services | AI needs booking options |
| Step 3 | Basic hours (M-F 9-6 minimum) | AI needs availability window |

### **⚠️ SEMI-REQUIRED (Strong Nudge, But Can Skip)**
| Step | Requirement | Skip Consequence |
|------|-------------|------------------|
| Step 2 | Owner profile complete | Works, but no staff context |
| Step 5 | Test call | Miss immediate value demo |
| Step 6 | Dashboard tour | May not understand features |

### **🔓 COMPLETELY OPTIONAL (Nice to Have)**
| Step | Feature | Can Add Later |
|------|---------|---------------|
| Step 1 | Custom service details | ✅ Anytime via dashboard |
| Step 1 | Accurate pricing | ✅ Before going live |
| Step 2 | Additional staff | ✅ As they hire people |
| Step 3 | Weekend hours | ✅ When they want weekend bookings |
| Step 3 | Holiday schedules | ✅ Before holidays |
| Step 4 | Logo/branding | ✅ Anytime for professional look |
| Step 4 | Full address | ✅ Before customer directions needed |

## 🚀 **Skip Strategy Options**

### **Option A: Progressive Disclosure**
```
"Let's get the essentials done first (Steps 1-3)
You can always add more details later"
[Quick Setup] [Complete Setup]
```

### **Option B: Minimum Viable Setup**
```
Required: Services + Hours
Optional: Everything else
"Your AI is ready to take calls!"
```

### **Option C: Guided Priorities**
```
"Let's prioritize what you need most:
▢ Going live today? → Full setup
▢ Just testing? → Quick setup  
▢ Setting up for team? → Staff setup"
```

## 📊 **Resume Points & Progress Tracking**

### **Save Points:**
- After each step completion
- On any field change  
- Before browser close
- On idle timeout

### **Resume Experience:**
```
"Welcome back! You're 60% complete.
Pick up where you left off or start over?"

Progress: ████████████▱▱▱▱
Step 4: Business Profile (2 min remaining)
```

**Which requirements make sense to you? Should we be stricter on some steps or more flexible?**