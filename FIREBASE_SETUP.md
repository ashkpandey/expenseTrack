# Firebase Setup Instructions

## Fixing "Missing or insufficient permissions" Error

This error occurs when Firestore Security Rules are not properly configured. Follow these steps to fix it:

### Option 1: Apply Rules via Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `finmind-50302`

2. **Navigate to Firestore Database**
   - In the left sidebar, click on "Firestore Database"
   - Click on the "Rules" tab at the top

3. **Update Security Rules**
   - Copy the contents from `firestore.rules` file in this project
   - Paste into the Firebase Console Rules editor
   - Click "Publish" to deploy the rules

4. **Verify the Rules**
   - The rules should now allow authenticated users to:
     - Read/write their own expenses
     - Read/write their own budgets
     - Deny access to other users' data

### Option 2: Deploy Rules via Firebase CLI

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not done)
   ```bash
   firebase init firestore
   ```
   - Select your project: `finmind-50302`
   - Accept default file names or use `firestore.rules`

4. **Deploy the rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

### What the Rules Do

The security rules ensure that:
- ✅ Users must be authenticated to access data
- ✅ Users can only read/write their own expenses
- ✅ Users can only read/write their own budgets
- ❌ Users cannot access other users' data
- ❌ Unauthenticated users have no access

### Authentication Setup

Make sure users are properly authenticated before accessing Firestore:

1. **Sign In/Sign Up**: Users must be signed in using Firebase Authentication
2. **Check Auth State**: The app uses `onAuthStateChanged` to track authentication
3. **User ID**: All operations include the user's `uid` to ensure data isolation

### Testing

After applying the rules:
1. Sign in to your app
2. Try creating an expense or budget
3. The error should be resolved
4. Check browser console for any remaining errors

### Common Issues

**"Error: 7 PERMISSION_DENIED"**
- Rules are not published yet
- User is not authenticated
- User ID doesn't match the document owner

**Rules not taking effect**
- Wait 1-2 minutes after publishing for rules to propagate
- Clear browser cache and reload
- Check Firebase Console > Firestore > Rules to verify deployment

### Need Help?

- Firebase Security Rules Documentation: https://firebase.google.com/docs/firestore/security/get-started
- Firestore Rules Playground: Test rules in Firebase Console
