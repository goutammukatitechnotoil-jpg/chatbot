# Form Submission Confirmation - Visual Flow

## User Journey Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHATBOT INTERFACE                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  User is chatting with bot...                                 │  │
│  │                                                                │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │  │
│  │  │ Speak to Expert │  │ Continue with AI│                    │  │
│  │  └────────┬────────┘  └─────────────────┘                    │  │
│  │           │                                                   │  │
│  │           │ User clicks                                       │  │
│  │           ▼                                                   │  │
└──┴───────────────────────────────────────────────────────────────┴──┘
               │
               │ Form Opens
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONTACT US FORM (Step 1)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ✕ Close                                Contact Us             │  │
│  │  ─────────────────────────────────────────────────────────────  │  │
│  │                                                                │  │
│  │  Fill in the form to speak with our experts                   │  │
│  │                                                                │  │
│  │  Name *              [__________________]                     │  │
│  │  Email *             [__________________]                     │  │
│  │  Company *           [__________________]                     │  │
│  │  Phone *             [__________________]                     │  │
│  │  Country *           [▼ Select Country__]                     │  │
│  │  Job Title *         [__________________]                     │  │
│  │  Purpose *           [▼ Select Purpose__]                     │  │
│  │  Details             [____________________]                   │  │
│  │                      [                    ]                   │  │
│  │                                                                │  │
│  │                  ┌─────────────┐                              │  │
│  │                  │    Send     │  ← CTA Button                │  │
│  │                  └──────┬──────┘                              │  │
│  │                         │                                     │  │
└──┴─────────────────────────┼─────────────────────────────────────┴──┘
                             │ User clicks Send
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUBMITTING STATE (Step 2)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ✕ Close                                Contact Us             │  │
│  │  ─────────────────────────────────────────────────────────────  │  │
│  │                                                                │  │
│  │  Fill in the form to speak with our experts                   │  │
│  │                                                                │  │
│  │  Name *              [John Smith_________]                    │  │
│  │  Email *             [john@example.com___]                    │  │
│  │  Company *           [Acme Corp_________]                     │  │
│  │  Phone *             [+1234567890_______]                     │  │
│  │  Country *           [United States▼____]                     │  │
│  │  Job Title *         [CTO_______________]                     │  │
│  │  Purpose *           [Partnership▼______]                     │  │
│  │  Details             [Interested in AI__]                     │  │
│  │                      [solutions_________]                     │  │
│  │                                                                │  │
│  │                  ┌─────────────────┐                          │  │
│  │                  │ ◌ Submitting... │  ← Loading indicator     │  │
│  │                  └─────────────────┘    (disabled)            │  │
│  │                                                                │  │
└──┴──────────────────────────────────────────────────────────────────┘
                             │
                             │ Form is submitted to backend
                             │ Lead entry created/updated
                             │ Webhooks triggered
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUCCESS SCREEN (Step 3) ✅                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │                                                                │  │
│  │                        ✓                                       │  │
│  │                    ───────                                     │  │
│  │                   │       │                                    │  │
│  │                    ───────     ← Large Green Checkmark        │  │
│  │                                  (20x20, green-500)           │  │
│  │                                                                │  │
│  │                    Thank You!                                  │  │
│  │                                                                │  │
│  │       Your form has been submitted successfully.              │  │
│  │       We'll get back to you as soon as possible.              │  │
│  │                                                                │  │
│  │                                                                │  │
│  │                    ┌─────────┐                                │  │
│  │                    │  Close  │  ← Uses CTA button color       │  │
│  │                    └────┬────┘                                │  │
│  │                         │                                     │  │
└──┴─────────────────────────┼─────────────────────────────────────┴──┘
                             │ User clicks Close
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACK TO CHAT (Step 4)                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Chat conversation:                                            │  │
│  │                                                                │  │
│  │  User: I need help with AI solutions                          │  │
│  │  Bot: I'd be happy to help! Would you like to speak...        │  │
│  │                                                                │  │
│  │  System: Form submitted: Contact Us  ← New message added      │  │
│  │                                                                │  │
│  │  User can continue chatting...                                │  │
│  │                                                                │  │
│  │  [Type your message...]                           [Send]      │  │
│  │                                                                │  │
└──┴──────────────────────────────────────────────────────────────────┘
```

## State Diagram

```
                    ┌──────────┐
                    │  IDLE    │
                    │ showForm │
                    │  = false │
                    └────┬─────┘
                         │
                         │ Button clicked
                         │ (Speak to Expert)
                         ▼
                    ┌──────────┐
                    │  FORM    │
                    │  OPEN    │
                    │ showForm │
                    │  = true  │
                    └────┬─────┘
                         │
                         │ User fills form
                         │ Clicks Submit
                         ▼
                  ┌──────────────┐
                  │  SUBMITTING  │
                  │ formSubmitting│
                  │    = true    │
                  │ isLoading=true│
                  └──────┬───────┘
                         │
                         │ Backend processing
                         │ - Submit form data
                         │ - Create/update lead
                         │ - Send webhooks
                         │
                    ┌────┴────┐
                    │         │
           ┌────────▼───┐  ┌──▼──────────┐
           │  SUCCESS   │  │   ERROR     │
           │ formSuccess │  │ formSuccess │
           │  = true    │  │  = false    │
           │isSuccess   │  │ Form closes │
           │  = true    │  │             │
           └─────┬──────┘  └──────┬──────┘
                 │                │
                 │ Shows success  │ Shows error
                 │ screen         │ in console
                 │                │
                 │ User clicks    │ States reset
                 │ Close          │
                 ▼                │
            ┌──────────┐          │
            │  CLOSED  │◄─────────┘
            │ showForm │
            │  = false │
            │ States   │
            │  reset   │
            └──────────┘
```

## Component Interaction Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      ChatWindow.tsx                            │
│                                                                │
│  State:                                                        │
│  • showForm: boolean                                           │
│  • activeForm: CustomForm | null                               │
│  • formFields: FormField[]                                     │
│  • formSubmitting: boolean  ← NEW                             │
│  • formSuccess: boolean     ← NEW                             │
│                                                                │
│  Methods:                                                      │
│  • handleFormSubmit(data)                                      │
│    ├─ setFormSubmitting(true)                                 │
│    ├─ Submit to backend                                       │
│    ├─ Create/update lead                                      │
│    ├─ setFormSubmitting(false)                                │
│    └─ setFormSuccess(true)   ← Show success                   │
│                                                                │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        │ Renders (when showForm = true)
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                    FormRenderer.tsx                            │
│                                                                │
│  Props:                                                        │
│  • form: CustomForm                                            │
│  • fields: FormField[]                                         │
│  • onSubmit: (data) => void                                    │
│  • onClose: () => void                                         │
│  • isLoading: boolean       ← NEW                             │
│  • isSuccess: boolean       ← NEW                             │
│                                                                │
│  Rendering Logic:                                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ if (isSuccess) {                                         │  │
│  │   return <SuccessConfirmationScreen />                   │  │
│  │ }                                                        │  │
│  │                                                          │  │
│  │ return <FormWithFields />                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Components:                                                   │
│  ┌─────────────────────┐  ┌────────────────────────────────┐  │
│  │ Success Screen      │  │ Form Fields                    │  │
│  │ ─────────────────   │  │ ──────────────────             │  │
│  │ • CheckCircle icon  │  │ • Input fields                 │  │
│  │ • Thank You heading │  │ • Validation                   │  │
│  │ • Success message   │  │ • Submit button                │  │
│  │ • Close button      │  │   ├─ Shows loading if isLoading│  │
│  │                     │  │   └─ Calls onSubmit()          │  │
│  └─────────────────────┘  └────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. USER CLICKS SUBMIT
   │
   ├─ FormRenderer calls: onSubmit(formData)
   │
   ▼
2. ChatWindow.handleFormSubmit(data)
   │
   ├─ Set: formSubmitting = true
   ├─ FormRenderer receives: isLoading = true
   ├─ Submit button shows: "Submitting..." + spinner
   │
   ▼
3. BACKEND PROCESSING
   │
   ├─ POST /api/form/submit
   │  └─ Save form submission
   │
   ├─ GET /api/lead?sessionId=...
   │  └─ Check for existing lead
   │
   ├─ PUT /api/lead/:id (if exists)
   │  OR
   │  POST /api/lead (if new)
   │  └─ Create/update lead with form data
   │
   ├─ Webhook Service (if configured)
   │  └─ POST to external webhook URL
   │     └─ Send lead data to CRM/external system
   │
   ▼
4. SUCCESS RESPONSE
   │
   ├─ Set: formSubmitting = false
   ├─ Set: formSuccess = true
   ├─ FormRenderer receives: isSuccess = true
   ├─ Success screen appears
   ├─ Add chat message: "Form submitted: Contact Us"
   │
   ▼
5. USER CLICKS CLOSE
   │
   ├─ FormRenderer calls: onClose()
   ├─ ChatWindow resets all states:
   │  ├─ showForm = false
   │  ├─ activeForm = null
   │  ├─ formFields = []
   │  ├─ formSubmitting = false
   │  └─ formSuccess = false
   │
   ▼
6. BACK TO CHAT
   └─ User can continue conversation
```

## Mobile Responsive Flow

```
DESKTOP (>640px)                    MOBILE (<640px)
┌────────────────────┐             ┌──────────┐
│  Chat Window       │             │ Chat     │
│  ┌──────────────┐  │             │ Window   │
│  │ Form Modal   │  │             │ ┌──────┐ │
│  │ (centered)   │  │             │ │ Form │ │
│  │              │  │             │ │ Full │ │
│  │ ┌──────────┐ │  │             │ │ Screen│ │
│  │ │ Success  │ │  │             │ │      │ │
│  │ │ Screen   │ │  │             │ │ ✓    │ │
│  │ │          │ │  │             │ │Thank │ │
│  │ │    ✓     │ │  │             │ │You!  │ │
│  │ │ Thank You│ │  │             │ │      │ │
│  │ │  Close   │ │  │             │ │Close │ │
│  │ └──────────┘ │  │             │ └──────┘ │
│  └──────────────┘  │             └──────────┘
└────────────────────┘
```

## Timing Diagram

```
Time    User Action          Component State              UI Display
──────────────────────────────────────────────────────────────────────
0:00    Clicks "Speak        showForm = true              Form opens
        to Expert"           formSubmitting = false       with fields
                             formSuccess = false

0:15    Fills in all         (no state changes)           Fields are
        required fields                                   populated

0:30    Clicks "Send"        formSubmitting = true        Button shows:
        button               isLoading = true             "Submitting..."
                                                          + spinner

0:31    Backend receives     (processing...)              Loading state
        form data                                         continues

1:00    Form submitted       formSubmitting = false       Success screen
        successfully         formSuccess = true           appears
                             isSuccess = true             ✓ Thank You!

1:01    Chat message         messages.push(...)           "Form submitted:
        added                                             Contact Us"

5:00    User clicks          All states reset             Form closes
        "Close" button       showForm = false             Back to chat

5:01    Ready for next       Component idle               Normal chat
        interaction                                       interface
```

## Error Handling Flow

```
User Submits Form
       │
       ▼
   Try Submit
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
    SUCCESS           NETWORK           VALIDATION
       │              ERROR               ERROR
       │                 │                  │
       ▼                 ▼                  ▼
Show Success      Log to console      Show field
  Screen          Close form          errors
       │          Reset states         Keep form
       │                │              open
       │                │                  │
       ▼                ▼                  ▼
  User happy      User can retry    User fixes
                                    errors
```

## Legend

```
┌─────┐
│ Box │  = UI Component or State
└─────┘

   │
   ▼     = Flow direction / Transition

  ◌      = Loading indicator

  ✓      = Success indicator

  ✕      = Close button

  *      = Required field marker

  ←      = Annotation / Note
```

---

**This visual flow complements the technical documentation in FORM_SUBMISSION_CONFIRMATION_UX.md**
