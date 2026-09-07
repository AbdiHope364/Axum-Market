# AxumMarket Admin Password Recovery Guide

If you ever forget the master Administrator password for AxumMarket, you will be locked out of the Admin Dashboard. Because the database is securely hosted on your Plesk server, the password cannot be recovered via email.

Instead, you can use the built-in emergency reset script to force the password back to the default securely.

## How to Reset the Admin Password

### Step 1: Access Your Server Terminal
1. Log in to your **Plesk Control Panel**.
2. Go to **Websites & Domains** and locate your AxumMarket domain.
3. Click on **SSH Terminal** (or connect via PuTTY / Mac Terminal using your server IP and root/admin credentials).

### Step 2: Navigate to the Project Folder
In the terminal, change directories to where your application is hosted. (Replace `axummarket.et` with your actual domain folder):
\`\`\`bash
cd /var/www/vhosts/axummarket.et/httpdocs
\`\`\`

### Step 3: Run the Reset Command
Execute the following NPM script to trigger the emergency reset:
\`\`\`bash
npm run reset-admin
\`\`\`

### Step 4: Confirm Success
The script will output a success message confirming the database was updated:
\`\`\`text
Looking for admin user: admin@axummarket.et...
Generating new security hash...
=========================================
✅ SUCCESS: Admin password has been reset!
📧 Email: admin@axummarket.et
🔑 Password: AdminSecure2026!
=========================================
\`\`\`

### Step 5: Log In and Change It
1. Go back to your Admin Dashboard login page (e.g., `admin.axummarket.et`).
2. Log in using `admin@axummarket.et` and the temporary password `AdminSecure2026!`.
3. Click the **Password** button in the top right corner of the dashboard to change it to a new secure password.
