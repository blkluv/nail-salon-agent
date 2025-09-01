# 🤖 **TEAM COORDINATION PROTOCOLS: Daily Operations Guide**

## 📅 **DAILY STANDUP PROTOCOL**

### **⏰ Schedule & Format**
- **Time:** Every morning at [TO BE SCHEDULED] 
- **Duration:** Maximum 15 minutes
- **Platform:** [Slack/Discord/Teams - TBD]
- **Format:** Structured updates only

### **📋 Daily Report Template**
```markdown
## Developer [Name] - Daily Standup

### ✅ Yesterday Completed:
- [Specific task 1 with file/feature]
- [Specific task 2 with file/feature]

### 🔄 Today Working On:
- [Priority 1 task - estimated completion time]
- [Priority 2 task - if time allows]

### 🚨 Blockers:
- [None] OR [Specific blocker needing team help]

### 🔗 Dependencies:
- [Waiting for X from Developer Y] OR [None]

### 🧪 Test Status:
- [All tests passing] OR [Issues found: description]
```

---

## 🔄 **DEVELOPMENT WORKFLOW**

### **Git Branch Strategy**
```git
main (protected - no direct pushes)
├── feature/payment-integration (Dev #1)
├── feature/payment-ui (Dev #2)
├── feature/email-marketing (Dev #1)
├── feature/email-dashboard (Dev #2)
├── feature/sms-activation (Dev #1)
├── feature/mobile-optimization (Dev #2)
└── feature/plan-enforcement (Claude coordinates)
```

### **Branch Naming Convention**
- Dev #1 (Backend): `feature/[system]-[feature]` (e.g., `feature/payment-stripe`)
- Dev #2 (Frontend): `feature/ui-[component]` (e.g., `feature/ui-payment-form`)
- Claude (Integration): `feature/integration-[system]` (e.g., `feature/integration-testing`)

### **Commit Message Format**
```git
[TYPE]: Brief description

Examples:
FEAT: Add Stripe payment processing service
FIX: Resolve payment form validation error
DOCS: Update API documentation for email service
TEST: Add unit tests for payment processing
```

---

## 🔍 **CODE REVIEW PROCESS**

### **Pull Request Workflow**
1. **Create Feature Branch** from main
2. **Implement Feature** following team guidelines
3. **Self-Test** using provided test scripts
4. **Create Pull Request** with proper description
5. **Code Review** by other team members
6. **Integration Test** by Claude
7. **Merge to Main** after all approvals

### **PR Description Template**
```markdown
## Feature: [Feature Name]

### 🎯 What this PR does:
- Brief description of functionality added/changed

### 📁 Files Changed:
- `file1.ts` - Description of changes
- `file2.tsx` - Description of changes

### 🧪 Testing:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

### 🔗 Dependencies:
- [ ] No dependencies OR
- [ ] Requires PR #X to be merged first

### 📸 Screenshots (if UI changes):
- [Attach screenshots of new/changed UI]

### 🚨 Breaking Changes:
- [ ] No breaking changes OR
- [ ] Breaking changes: [describe impact]
```

---

## 🧪 **TESTING COORDINATION**

### **Daily Testing Protocol**
Each developer runs these tests before standup:

#### **Developer #1 (Backend) Daily Tests:**
```bash
# Run in /dashboard directory
npm run test:api
npm run test:payments
npm run test:email
npm run test:sms
```

#### **Developer #2 (Frontend) Daily Tests:**
```bash
# Run in /dashboard directory  
npm run test:components
npm run test:ui
npm run test:mobile
```

#### **Claude (Integration) Daily Tests:**
```bash
# Full system integration tests
npm run test:integration
npm run test:user-flows
npm run test:plan-enforcement
```

### **Test Results Reporting**
Include in daily standup:
- ✅ All tests passing
- ⚠️ Tests passing with warnings: [description]
- ❌ Tests failing: [specific failures and plan to fix]

---

## 🆘 **CONFLICT RESOLUTION**

### **Immediate Communication Channels**
- **Urgent Blockers:** Direct message to Claude immediately
- **Code Conflicts:** Tag both affected developers + Claude
- **Design Decisions:** Full team discussion required

### **Common Conflict Scenarios & Solutions**

#### **1. Database Schema Conflicts**
- **When:** Dev #1 needs new table/column, affects Dev #2's queries
- **Process:** 
  1. Dev #1 creates schema change proposal
  2. Claude reviews for impact
  3. Claude updates shared types in `lib/supabase-types-mvp.ts`
  4. Dev #2 updates affected components
  5. All test before merging

#### **2. API Interface Changes**
- **When:** Dev #1 changes API response format, breaks Dev #2's components
- **Process:**
  1. API changes require team notification first
  2. Version API endpoints if breaking change
  3. Update mock data for Dev #2 immediately
  4. Coordinate deployment of both backend + frontend

#### **3. Shared File Modifications**
**Files requiring coordination:**
- `lib/supabase.ts`
- `lib/supabase-types-mvp.ts`
- `components/Layout.tsx`
- `.env.local`

**Process:**
1. Announce intent to modify shared file
2. Check with team for conflicts
3. Make changes in separate PR for review
4. Test integration before merging

---

## 📊 **PROGRESS TRACKING**

### **Daily Progress Dashboard**
Claude maintains a daily status board:

```markdown
## Team Progress - Day X of 14

### 🎯 Sprint Goals (Week 1):
- [ ] Payment processing functional (Dev #1: 80%, Dev #2: 60%)
- [ ] SMS system activated (Dev #1: 100%, Integration: 90%) 
- [ ] Email marketing backend (Dev #1: 70%, Dev #2: 40%)

### 🔧 Developer #1 Status:
- Current: Working on Square integration
- Blocker: None
- Next: Email campaign API

### 🎨 Developer #2 Status:  
- Current: Payment form component
- Blocker: Waiting for payment API
- Next: Email dashboard UI

### 🤖 Claude Status:
- Current: Integration testing payment flow
- Blocker: None  
- Next: Plan enforcement middleware

### 🚨 Team Blockers:
- [None] OR [List active blockers]

### 📈 Completion Metrics:
- Features completed: X/Y
- Tests passing: 95%
- Code coverage: 85%
```

### **Weekly Goal Tracking**
```markdown
## Week X Sprint Review

### ✅ Completed Goals:
- [Goal 1 with completion evidence]
- [Goal 2 with completion evidence]

### 🔄 In Progress Goals:
- [Goal with current status %]

### ❌ Missed Goals:
- [Goal with reason and new timeline]

### 📊 Team Metrics:
- Velocity: [Story points completed]
- Quality: [Bug count, test coverage]  
- Collaboration: [PR review time, conflicts resolved]
```

---

## 🚀 **DEPLOYMENT COORDINATION**

### **Deployment Windows**
- **Daily Deploys:** End of each work day (if tests pass)
- **Major Features:** Coordinate with full team
- **Hotfixes:** Can be deployed immediately with notification

### **Pre-Deployment Checklist**
```bash
# All developers run before deployment:
□ All tests passing locally
□ Code reviewed and approved
□ No merge conflicts
□ Environment variables updated
□ Documentation updated
```

### **Deployment Communication**
```markdown
## Deployment Notice

### 🚀 Deploying: [Feature/Fix Name]
### 👨‍💻 Developer: [Name]  
### 📅 Time: [Timestamp]
### 🔍 Changes: [Brief description]
### ⚠️ Impact: [User-facing changes, if any]
### 🔄 Rollback: [How to rollback if needed]

### ✅ Pre-deploy checks:
- [ ] Tests pass
- [ ] Code reviewed  
- [ ] Staging tested
```

---

## 📞 **ESCALATION PROCEDURES**

### **Level 1: Standard Issues**
- Code questions, minor bugs, feature clarifications
- **Response Time:** Within 2 hours during work hours
- **Channel:** Slack/Discord team channel

### **Level 2: Blocking Issues**  
- Cannot continue work, major bugs, integration failures
- **Response Time:** Within 30 minutes
- **Channel:** Direct message to Claude + team channel

### **Level 3: Critical Issues**
- Production down, data loss, security issues
- **Response Time:** Immediate
- **Channel:** Phone/SMS + all channels

### **Emergency Contacts**
- **Claude (Architecture Lead):** [Contact info]
- **Project Owner:** [Your contact info]
- **Backup:** [Backup contact if needed]

---

## 🎯 **SUCCESS METRICS**

### **Team Velocity Targets**
- **Week 1:** Complete 4/6 critical features
- **Week 2:** Complete remaining features + polish
- **Daily:** Each developer completes 1-2 meaningful tasks
- **Code Quality:** 90%+ test coverage, zero critical bugs

### **Collaboration Quality**
- **PR Review Time:** <4 hours average
- **Standup Participation:** 100% attendance
- **Conflict Resolution:** <24 hours average
- **Documentation:** All features documented before merge

### **Communication Standards**
- **Response Time:** <2 hours during work hours
- **Status Updates:** Daily standup + any blockers immediately
- **Code Changes:** Always communicate breaking changes
- **Availability:** Core hours overlap for all team members

---

## 🎉 **TEAM MORALE & MOTIVATION**

### **Daily Wins Recognition**
- Celebrate completed features immediately
- Share screenshots of working functionality  
- Acknowledge problem-solving and collaboration
- Highlight individual contributions

### **Weekly Team Retrospective**
```markdown
## Week X Retrospective

### 🎉 What Went Well:
- [Team accomplishments and positive highlights]

### 🔄 What Could Improve:
- [Process improvements, not blame]

### 💡 Action Items:
- [Specific changes for next week]

### 🏆 MVP of the Week:
- [Team member who went above and beyond]
```

### **Motivation Boosters**
- **Progress Visualization:** Track % completion daily
- **Peer Recognition:** Call out great code reviews and help
- **Learning Opportunities:** Share interesting solutions found
- **End Goal Reminder:** 2 weeks to 100% feature completion!

---

## 📋 **QUICK REFERENCE**

### **Daily Checklist**
- [ ] Check team channel for overnight messages
- [ ] Run local tests before starting work
- [ ] Attend standup with prepared update
- [ ] Communicate blockers immediately  
- [ ] Update progress before end of day

### **Emergency Commands**
```bash
# Reset local environment
git fetch origin && git reset --hard origin/main

# Run full test suite
npm run test:all

# Check team status
git log --oneline --graph --all
```

### **Key Files to Monitor**
- `FEATURE_GAP_ANALYSIS.md` - What we're building
- `IMPLEMENTATION_ROADMAP.md` - Priority and timeline
- `DEV1_BACKEND_INSTRUCTIONS.md` - Backend tasks
- `DEV2_FRONTEND_INSTRUCTIONS.md` - Frontend tasks

---

**🚀 Ready for coordinated parallel development!** These protocols ensure smooth collaboration, prevent conflicts, and keep the team moving toward 100% feature completion in 2 weeks.

**Remember: Over-communicate rather than under-communicate. When in doubt, ask the team!**