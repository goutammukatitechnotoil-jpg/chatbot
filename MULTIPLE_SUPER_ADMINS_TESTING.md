# Multiple Super Admins - Quick Testing Guide

## 🧪 Step-by-Step Testing Instructions

### Prerequisites
- Development server running (`npm run dev`)
- Access to MongoDB database
- Super Admin credentials

### Test 1: Access Super Admin Dashboard

1. **Navigate to Super Admin Portal**
   ```
   http://localhost:3001/super-admin
   ```

2. **Login with Default Credentials**
   - Email: `admin@fptchatbot.com`
   - Password: `SuperAdmin123!`

3. **Verify Login Success**
   - Should see Super Admin Dashboard
   - Should see navigation tabs: Overview, Tenants, Users, Settings

### Test 2: View Super Admin Users

1. **Click on "Users" Tab**
   - Located in the navigation menu

2. **Verify User List Loads**
   - Should see at least one Super Admin (the one you logged in with)
   - Table columns: Name, Email, Role, Status, Created, Actions

3. **Verify Display**
   - Shield icon (🛡) next to names
   - Email icon next to email addresses
   - Role badge (purple for Super Admin, blue for Support)
   - Status badge (green for Active, gray for Inactive)
   - Created date with calendar icon
   - Edit and Delete action buttons

### Test 3: Create New Super Admin

1. **Click "Add Super Admin" Button**
   - Located in top-right corner of Users tab

2. **Fill in the Form**
   ```
   Name:     Test Admin
   Email:    test@fptchatbot.com
   Password: TestAdmin123!
   Role:     Super Admin
   ```

3. **Click "Create Admin"**
   - Should see loading state ("Creating...")
   - Should see success message: "Super Admin created successfully"
   - Modal should close automatically
   - New admin should appear in the table

### Test 4: Login with New Super Admin

1. **Logout from Current Session**
   - Click the Logout button in the header

2. **Login with New Credentials**
   - Navigate to: `http://localhost:3001/super-admin`
   - Email: `test@fptchatbot.com`
   - Password: `TestAdmin123!`

3. **Verify Full Access**
   - Should see Super Admin Dashboard
   - Should be able to access all tabs
   - Should be able to view Users tab
   - Should be able to create more Super Admins

### Test 5: Edit Super Admin

1. **Go to Users Tab**
   - Click on "Users" in navigation

2. **Click Edit Icon (✏️)** next to "Test Admin"

3. **Update Information**
   ```
   Name:     Test Admin Updated
   Role:     Support
   Status:   Inactive
   Password: (leave blank)
   ```

4. **Click "Update Admin"**
   - Should see success message
   - Changes should reflect in the table immediately
   - Role badge should change to blue (Support)
   - Status badge should change to gray (Inactive)

### Test 6: Verify Status Change

1. **Logout from Current Session**

2. **Try to Login with Inactive Admin**
   - Email: `test@fptchatbot.com`
   - Password: `TestAdmin123!`

3. **Verify Login Fails**
   - Should see error message
   - Cannot login with inactive account

4. **Re-login with Original Admin**
   - Email: `admin@fptchatbot.com`
   - Password: `SuperAdmin123!`

### Test 7: Change Password

1. **Go to Users Tab**

2. **Edit Test Admin Again**
   - Click edit icon

3. **Set New Password**
   ```
   Password: NewPassword123!
   Status:   Active
   ```

4. **Click "Update Admin"**

5. **Logout and Login with New Password**
   - Email: `test@fptchatbot.com`
   - Password: `NewPassword123!`
   - Should login successfully

### Test 8: Delete Super Admin

1. **Login as Original Admin**
   - Email: `admin@fptchatbot.com`

2. **Go to Users Tab**

3. **Click Delete Icon (🗑️)** next to "Test Admin Updated"

4. **Confirm Deletion**
   - Should see confirmation dialog
   - Click "OK" to confirm

5. **Verify Deletion**
   - Should see success message
   - Test Admin should disappear from the table

6. **Verify Cannot Login**
   - Logout
   - Try to login with test@fptchatbot.com
   - Should fail (account deleted)

### Test 9: Last Admin Protection

1. **Login as the Only Remaining Super Admin**

2. **Go to Users Tab**

3. **Try to Delete Yourself**
   - Click delete icon next to your own account
   - Delete button should be disabled if you're the only admin
   - OR you should see error: "Cannot delete the last super admin"

4. **Verify Protection Works**
   - System prevents deletion of last admin
   - At least one Super Admin must always exist

### Test 10: Validation Tests

#### Test Duplicate Email
1. Create a Super Admin with email: `test2@fptchatbot.com`
2. Try to create another with same email
3. Should see error: "Email already exists"

#### Test Short Password
1. Try to create Super Admin with password: `short`
2. Should see validation error
3. Minimum 8 characters required

#### Test Required Fields
1. Try to create Super Admin without name
2. Should see validation error
3. All required fields must be filled

### Test 11: API Endpoint Tests

You can test the API endpoints directly using curl or Postman:

#### Get All Super Admins
```bash
# Get auth token first by logging in
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3001/api/admin/super-admins \
  -H "Authorization: Bearer $TOKEN"
```

#### Create Super Admin
```bash
curl -X POST http://localhost:3001/api/admin/super-admins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Admin",
    "email": "apitest@fptchatbot.com",
    "password": "APITest123!",
    "role": "super_admin"
  }'
```

#### Update Super Admin
```bash
curl -X PUT http://localhost:3001/api/admin/super-admins \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "admin-id-here",
    "name": "Updated Name",
    "status": "inactive"
  }'
```

#### Delete Super Admin
```bash
curl -X DELETE "http://localhost:3001/api/admin/super-admins?id=admin-id-here" \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ Expected Results Summary

| Test | Expected Result |
|------|----------------|
| Access Dashboard | Successfully loads Super Admin Dashboard |
| View Users | Table displays all Super Admins |
| Create Super Admin | New admin created and appears in list |
| Login as New Admin | Can login with new credentials |
| Edit Super Admin | Changes saved and reflected immediately |
| Change Status | Inactive admins cannot login |
| Change Password | New password works, old one doesn't |
| Delete Admin | Admin removed from list and cannot login |
| Last Admin Protection | Cannot delete the only remaining admin |
| Email Validation | Duplicate emails rejected |
| Password Validation | Short passwords rejected |
| Required Fields | Empty required fields rejected |

## 🐛 Troubleshooting

### Issue: Cannot See Users Tab
**Solution**: Ensure you're logged in as a Super Admin, not a regular tenant user

### Issue: "Unauthorized" Error
**Solution**: 
- Logout and login again
- Check if JWT token is expired
- Verify you're using Super Admin credentials

### Issue: Changes Not Reflecting
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify API endpoint returned success

### Issue: Cannot Login After Creating Admin
**Solution**:
- Verify the email and password you entered
- Check if status is set to "Active"
- Try resetting password via Edit modal

## 📊 Database Verification

### Check Super Admins in MongoDB

1. **Connect to MongoDB**
   ```bash
   # Using MongoDB Compass or CLI
   ```

2. **Query super_admins Collection**
   ```javascript
   db.super_admins.find({})
   ```

3. **Verify Structure**
   ```javascript
   {
     _id: ObjectId,
     id: "uuid-here",
     name: "Admin Name",
     email: "admin@example.com",
     password_hash: "bcrypt-hash-here", // Should be hashed, not plain text
     role: "super_admin",
     status: "active",
     permissions: [...],
     created_at: ISODate,
     updated_at: ISODate
   }
   ```

## 🎯 Success Criteria

- ✅ Can create multiple Super Admin users
- ✅ Each Super Admin can login independently
- ✅ Can edit Super Admin details (name, email, role, status)
- ✅ Can change Super Admin passwords
- ✅ Can delete Super Admins (except last one)
- ✅ Inactive Super Admins cannot login
- ✅ All operations show appropriate success/error messages
- ✅ UI updates in real-time after operations
- ✅ No console errors or warnings
- ✅ Database properly stores all changes

---

**Testing Time**: ~15-20 minutes  
**Difficulty**: Easy  
**Prerequisites**: Basic understanding of user management

**Happy Testing! 🧪✅**
