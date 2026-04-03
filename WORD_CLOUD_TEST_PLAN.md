# Word Cloud Feature Test Plan

## Test Overview
This document outlines comprehensive testing procedures for the newly implemented Word Cloud feature in the FPT Chatbot analytics dashboard.

## Prerequisites
- Development server running on `http://localhost:3000` (or applicable port)
- MongoDB connection with sample lead/conversation data
- Admin panel access

## Test Scenarios

### Scenario 1: Basic Word Cloud Display

**Objective**: Verify word cloud appears and renders correctly

**Steps**:
1. Navigate to Admin Panel → Dashboard
2. Scroll down to see the Word Cloud component
3. Verify word cloud container is visible

**Expected Results**:
- Word cloud component appears below statistics and funnel chart
- Component has proper header with "Conversation Word Cloud" title
- Control buttons (info, download, refresh) are visible
- If no data: Shows "No conversation data available" message
- If has data: Shows words in various sizes and colors

### Scenario 2: Word Cloud with Sample Data

**Objective**: Test word cloud with actual conversation data

**Prerequisites**: Create sample conversations through the chatbot

**Steps**:
1. First, create sample conversations:
   - Navigate to "Test Chatbot" section
   - Have conversations with various messages like:
     - "Hello, I need information about pricing"
     - "What are your services?"
     - "Can you help me with support?"
     - "I'm interested in your products"
2. Go back to Dashboard
3. Check if Word Cloud displays words from conversations

**Expected Results**:
- Words like "pricing", "services", "support", "products", "information" appear
- Words sized appropriately (frequent words larger)
- Colors vary based on frequency
- Stop words like "I", "the", "and" are filtered out
- Minimum 3-character words displayed

### Scenario 3: Date Range Filtering

**Objective**: Test word cloud updates with date range changes

**Steps**:
1. In Dashboard, change date range filter to "Today"
2. Observe Word Cloud
3. Change to "Last 7 days"
4. Observe Word Cloud changes
5. Try "Last 30 days"

**Expected Results**:
- Word Cloud updates when date range changes
- Shows "Analyzing conversations..." loading state during updates
- Different date ranges show different word patterns (if applicable)
- Empty periods show "No conversation data available"

### Scenario 4: Interactive Features

**Objective**: Test word cloud interactivity

**Steps**:
1. Click on any word in the cloud
2. Hover over different words
3. Click the info button (ℹ️)
4. Click the refresh button (🔄)
5. Click the download button (💾)

**Expected Results**:
- **Word Click**: Shows alert with word count and percentage
- **Word Hover**: Word scales up (transform: scale(1.1))
- **Info Button**: Toggles statistics panel showing:
  - Total conversations processed
  - Total messages analyzed
  - Unique words found
  - Words shown in cloud
- **Refresh Button**: Reloads word cloud data
- **Download Button**: Downloads CSV file with word data

### Scenario 5: Statistics Panel Validation

**Objective**: Verify statistics accuracy

**Steps**:
1. Enable info panel in Word Cloud
2. Compare statistics with actual data:
   - Count conversations in Lead List
   - Verify total messages make sense
   - Check that unique words ≥ words shown

**Expected Results**:
- Statistics are reasonable and consistent
- Numbers align with Lead List data
- Metadata provides useful insights

### Scenario 6: CSV Export Functionality

**Objective**: Test data export feature

**Steps**:
1. Click download button in Word Cloud
2. Check downloaded file
3. Open CSV in spreadsheet application

**Expected Results**:
- CSV file downloads successfully
- Filename format: `word-cloud-YYYY-MM-DD.csv`
- CSV contains columns: Word, Count, Percentage
- Data matches what's displayed in word cloud
- File opens correctly in Excel/Numbers/Google Sheets

### Scenario 7: Error Handling

**Objective**: Test graceful error handling

**Steps**:
1. Simulate API errors by temporarily disconnecting internet
2. Refresh word cloud
3. Restore connection and test recovery

**Expected Results**:
- Shows error message when API fails
- Error message is user-friendly
- "Try Again" button allows recovery
- No browser console errors that break the app

### Scenario 8: Performance with Large Datasets

**Objective**: Test word cloud with many conversations

**Prerequisites**: Large dataset (50+ conversations)

**Steps**:
1. Create or import large conversation dataset
2. Load Dashboard with Word Cloud
3. Test different date ranges
4. Monitor performance

**Expected Results**:
- Word Cloud loads within reasonable time (< 10 seconds)
- No browser freezing or unresponsiveness
- Large word clouds are readable
- Controls remain responsive

### Scenario 9: Empty and Edge Cases

**Objective**: Test edge case scenarios

**Test Cases**:
1. **No conversations**: Fresh database with no lead data
2. **Empty messages**: Conversations with no text content
3. **Special characters**: Messages with emojis, symbols, URLs
4. **Very long words**: Messages with extremely long words
5. **All stop words**: Messages containing only stop words

**Expected Results**:
- **No conversations**: Shows "No conversation data available"
- **Empty messages**: Gracefully handles, shows available text
- **Special characters**: Cleaned appropriately, no display issues
- **Long words**: Truncated or handled gracefully
- **All stop words**: Shows "No words to display" or similar message

### Scenario 10: Multi-language Text

**Objective**: Test with non-English text

**Steps**:
1. Create conversations with mixed languages
2. Include accented characters, Unicode text
3. Check word cloud processing

**Expected Results**:
- Non-English words appear in cloud
- Unicode characters display correctly
- Text processing doesn't crash
- Stop word filtering works for English portions

## Data Validation Tests

### Test Data Creation
Create conversations with known word patterns:

```
Conversation 1:
User: "Hello, I need pricing information for your services"
Bot: "I can help with pricing details"
User: "What are the costs for premium services?"

Conversation 2:
User: "Support needed for technical issues"
Bot: "Our support team can assist with technical problems"
User: "The technical documentation is unclear"

Conversation 3:
User: "Product information please"
Bot: "Here's information about our products"
User: "Which products are most popular?"
```

### Expected Word Analysis
**High frequency words (should appear large):**
- services (3 occurrences)
- information (3 occurrences)
- technical (3 occurrences)
- products (3 occurrences)

**Medium frequency words:**
- pricing (2 occurrences)
- support (2 occurrences)

**Filtered out (stop words):**
- I, the, for, with, are, can, is, etc.

## API Testing

### Direct API Tests
Test the word cloud API endpoint directly:

```bash
# Test basic functionality
curl "http://localhost:3000/api/analytics/wordcloud?maxWords=20"

# Test with date range
curl "http://localhost:3000/api/analytics/wordcloud?startDate=2024-11-01&endDate=2024-11-30&maxWords=50"

# Test error handling
curl "http://localhost:3000/api/analytics/wordcloud?maxWords=invalid"
```

### Expected API Responses

**Success Response:**
```json
{
  "data": [
    {"word": "pricing", "count": 5, "percentage": 100},
    {"word": "services", "count": 4, "percentage": 80}
  ],
  "metadata": {
    "totalConversations": 10,
    "totalMessages": 25,
    "totalWords": 150,
    "uniqueWords": 45,
    "topWordsShown": 20
  }
}
```

**Empty Data Response:**
```json
{
  "data": [],
  "metadata": {
    "totalConversations": 0,
    "totalMessages": 0,
    "totalWords": 0,
    "uniqueWords": 0,
    "topWordsShown": 0
  }
}
```

## Visual Testing

### Word Cloud Appearance
- [ ] Words are clearly readable
- [ ] Font sizes create clear hierarchy
- [ ] Colors provide good contrast
- [ ] Layout is visually appealing
- [ ] Responsive on different screen sizes

### Color Coding Verification
- [ ] Red words = highest frequency (80-100%)
- [ ] Orange words = high frequency (60-79%)
- [ ] Green words = medium frequency (25-39%)
- [ ] Blue words = moderate frequency (8-24%)
- [ ] Purple words = low frequency (<8%)

### Interactive Elements
- [ ] Hover effects work smoothly
- [ ] Click responses are immediate
- [ ] Buttons have proper hover states
- [ ] Loading states are clear

## Integration Testing

### Dashboard Integration
- [ ] Word Cloud appears in correct position
- [ ] Doesn't interfere with other dashboard components
- [ ] Date range filter affects word cloud
- [ ] Loading states don't break layout

### Analytics Service Integration
- [ ] Word cloud data service works with existing analytics
- [ ] Date range handling is consistent
- [ ] Error handling aligns with other analytics features

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (1024x768)
- [ ] Mobile (375x667)
- [ ] Large screens (2560x1440)

## Performance Benchmarks

### Acceptable Performance Targets
- [ ] API response time: < 3 seconds
- [ ] Word Cloud rendering: < 2 seconds
- [ ] Date range updates: < 5 seconds
- [ ] Export generation: < 10 seconds

## Success Criteria

The Word Cloud feature is considered successful if:

1. ✅ **Functionality**: All core features work correctly
2. ✅ **Performance**: Meets speed requirements
3. ✅ **Usability**: Intuitive and responsive interface
4. ✅ **Accuracy**: Word processing and counting is correct
5. ✅ **Integration**: Seamlessly fits into existing dashboard
6. ✅ **Error Handling**: Graceful handling of edge cases
7. ✅ **Cross-browser**: Works in all major browsers
8. ✅ **Responsive**: Functions well on all screen sizes

## Deployment Checklist

Before production deployment:

- [ ] All test scenarios pass
- [ ] Performance benchmarks met
- [ ] Cross-browser testing complete
- [ ] Mobile responsiveness verified
- [ ] API error handling tested
- [ ] Data privacy considerations reviewed
- [ ] Documentation complete
- [ ] User training materials prepared

## Post-Deployment Monitoring

After going live:

- [ ] Monitor API response times
- [ ] Track user engagement with word cloud
- [ ] Collect feedback on usefulness
- [ ] Monitor for any error reports
- [ ] Analyze most common words across users
- [ ] Plan for future enhancements based on usage patterns
