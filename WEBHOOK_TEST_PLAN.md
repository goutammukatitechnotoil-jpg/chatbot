# Webhook Integration Test Plan

## Test Overview
This document outlines the testing procedures for the newly implemented webhook integration feature on the FPT Chatbot platform.

## Test Environment Setup

### Prerequisites
1. Development server running on `http://localhost:5173`
2. MongoDB connection established
3. Admin panel access with appropriate permissions

### Test Webhook Endpoint
The platform includes a built-in test webhook endpoint:
```
URL: http://localhost:5173/api/webhook/test
Method: POST/PUT
Purpose: Logs all incoming webhook data for testing
```

## Test Scenarios

### Scenario 1: Basic Webhook Configuration

**Objective**: Test creating and configuring a basic webhook

**Steps**:
1. Navigate to Admin Panel → Integrations
2. Click "Add Webhook"
3. Fill in the form:
   - Name: "Test CRM Integration"
   - URL: "http://localhost:5173/api/webhook/test"
   - Method: POST
   - Active: ✓ Enabled
4. Click "Create Webhook"

**Expected Results**:
- Webhook appears in the list
- Status shows as "Active"
- No error messages displayed

### Scenario 2: Field Mapping Configuration

**Objective**: Test field mapping between lead data and webhook payload

**Steps**:
1. Edit the webhook created in Scenario 1
2. Add field mappings:
   - `name` → `customer_name` (Required: ✓)
   - `email` → `email_address` (Required: ✓)  
   - `phone` → `phone_number` (Required: ✗)
   - `company` → `company_name` (Required: ✗)
   - `message` → `inquiry_details` (Required: ✗)
   - `source` → `lead_source` (Required: ✗)
3. Save the configuration

**Expected Results**:
- Field mappings saved successfully
- Configuration shows "6 field mappings configured"

### Scenario 3: Webhook Testing

**Objective**: Test webhook delivery with sample data

**Steps**:
1. Click "Test" button next to the configured webhook
2. Confirm the test in the dialog
3. Check browser console for logs
4. Check server console/logs for webhook delivery

**Expected Results**:
- Success message: "✅ Webhook test successful!"
- Sample data sent to test endpoint
- Server logs show webhook delivery attempt
- Test endpoint logs received data

### Scenario 4: Header Configuration

**Objective**: Test custom header configuration

**Steps**:
1. Edit the webhook
2. Add custom headers:
   - `Authorization` → `Bearer test-token`
   - `X-Source` → `FPT-Chatbot`
3. Save and test the webhook

**Expected Results**:
- Custom headers included in webhook request
- Test endpoint logs show custom headers

### Scenario 5: Lead Creation Webhook Trigger

**Objective**: Test automatic webhook triggering on lead creation

**Steps**:
1. Navigate to Test Chatbot section
2. Interact with the chatbot to create a lead:
   - Send some chat messages
   - Fill out a form with:
     - Name: "John Doe"
     - Email: "john@example.com" 
     - Phone: "+1234567890"
     - Company: "Acme Corp"
     - Message: "Interested in services"
3. Submit the form
4. Check server logs for webhook delivery

**Expected Results**:
- Lead created successfully
- Webhook triggered automatically
- Mapped data sent to webhook endpoint
- Server logs show: "🚀 Sending webhook to..." and "✅ Webhook delivered successfully..."

### Scenario 6: Lead Update Webhook Trigger

**Objective**: Test webhook triggering on lead updates

**Steps**:
1. Create a basic chat session (no form data initially)
2. Later, update the session with form data through another interaction
3. Check if webhook is triggered for the update

**Expected Results**:
- Webhook triggered only when meaningful form data is added
- Updated lead data sent to webhook

### Scenario 7: Multiple Webhooks

**Objective**: Test multiple webhook configurations

**Steps**:
1. Create a second webhook:
   - Name: "Secondary Integration"
   - URL: "http://localhost:5173/api/webhook/test"
   - Different field mappings
2. Create a lead through the chatbot
3. Verify both webhooks are triggered

**Expected Results**:
- Both webhooks receive the lead data
- Each webhook receives data according to its field mappings

### Scenario 8: Webhook Failure Handling

**Objective**: Test error handling for webhook failures

**Steps**:
1. Create a webhook with an invalid URL: "http://invalid-url.com/webhook"
2. Test the webhook
3. Create a lead through chatbot

**Expected Results**:
- Test shows failure message
- Server logs show webhook delivery failure
- Lead creation still succeeds (webhook failure doesn't block)

### Scenario 9: Inactive Webhook

**Objective**: Test that inactive webhooks are not triggered

**Steps**:
1. Create a webhook and set it to "Inactive"
2. Create a lead through chatbot
3. Check if webhook is triggered

**Expected Results**:
- Inactive webhook is not triggered
- Server logs show no webhook attempts for inactive webhook

### Scenario 10: Webhook Deletion

**Objective**: Test webhook deletion

**Steps**:
1. Delete a webhook configuration
2. Create a lead through chatbot
3. Verify deleted webhook is not triggered

**Expected Results**:
- Webhook removed from list
- No webhook delivery attempts to deleted webhook

## Data Validation Tests

### Test Data Fields
Create leads with various data combinations to test field mapping:

**Full Data Lead**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321", 
  "company": "TechCorp Inc",
  "message": "Need pricing information"
}
```

**Minimal Data Lead**:
```json
{
  "name": "Anonymous User",
  "email": "user@example.com"
}
```

**Chat-Only Lead**:
```json
{
  "chat_history": ["Hello", "How can I help you?"],
  "last_message": "Just browsing, thanks"
}
```

### Expected Webhook Payloads

For the field mappings configured in Scenario 2, the webhook payload should be:

```json
{
  "customer_name": "Jane Smith",
  "email_address": "jane@example.com", 
  "phone_number": "+1987654321",
  "company_name": "TechCorp Inc",
  "inquiry_details": "Need pricing information",
  "lead_source": "FPT Chatbot",
  "_metadata": {
    "source": "FPT_Chatbot",
    "webhook_id": "wh_...",
    "webhook_name": "Test CRM Integration", 
    "timestamp": "2024-11-26T...",
    "lead_id": "...",
    "session_id": "..."
  }
}
```

## Performance Tests

### Scenario: High Volume Lead Creation
1. Simulate multiple leads created in quick succession
2. Verify all webhooks are delivered
3. Check for any performance degradation

### Scenario: Large Payload Test
1. Create leads with large chat histories
2. Test webhook delivery with large payloads
3. Verify no timeout or size limit issues

## Security Tests

### Scenario: HTTPS Webhook
1. Configure webhook with HTTPS URL
2. Test delivery to secure endpoint

### Scenario: Authentication Headers
1. Configure webhook with Bearer token
2. Verify token is included in requests

## Error Recovery Tests

### Scenario: Network Issues
1. Temporarily disconnect network
2. Create leads during disconnection
3. Verify webhook attempts are logged as failed

### Scenario: Webhook Endpoint Downtime
1. Configure webhook to an endpoint that's down
2. Create leads
3. Verify failure handling doesn't affect lead creation

## Test Checklist

- [ ] Basic webhook configuration works
- [ ] Field mapping saves and applies correctly  
- [ ] Webhook testing function works
- [ ] Custom headers are included
- [ ] Lead creation triggers webhooks
- [ ] Lead updates trigger webhooks (when appropriate)
- [ ] Multiple webhooks work simultaneously
- [ ] Webhook failures are handled gracefully
- [ ] Inactive webhooks don't trigger
- [ ] Webhook deletion works
- [ ] Data validation works for all field types
- [ ] Performance is acceptable under load
- [ ] Security features work (HTTPS, auth headers)
- [ ] Error recovery works properly

## Success Criteria

The webhook integration feature is considered successful if:

1. ✅ **Functionality**: All webhook operations (create, read, update, delete, test) work correctly
2. ✅ **Data Integrity**: Lead data is correctly mapped and sent to webhooks
3. ✅ **Reliability**: Webhook failures don't prevent lead creation
4. ✅ **Performance**: Webhook delivery doesn't significantly impact chatbot response times
5. ✅ **Security**: Authentication and HTTPS support work correctly
6. ✅ **Usability**: Admin interface is intuitive and provides clear feedback
7. ✅ **Documentation**: Clear documentation and examples are provided

## Post-Implementation Notes

### Monitoring
- Set up monitoring for webhook delivery success rates
- Log webhook failures for troubleshooting
- Track webhook performance metrics

### Maintenance  
- Regularly test webhook endpoints
- Update documentation as features evolve
- Monitor for any webhook-related errors in production

### Future Enhancements
- Webhook retry logic for failed deliveries
- Webhook delivery queue for high volume
- Advanced field transformation options
- Webhook templates for popular CRM systems
