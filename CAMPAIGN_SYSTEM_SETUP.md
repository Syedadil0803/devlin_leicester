# Devlin Dynamic Campaign System - Complete Setup Guide

## 📋 Overview

This guide will help you set up a dynamic ad campaign system for the Devlin Wholesale website using Cloudflare services.

### Services Used

| # | Service | Purpose | Cost |
|---|---------|---------|------|
| 1 | Cloudflare R2 | Store images & config | FREE |
| 2 | Cloudflare Pages | Host admin panel | FREE |
| 3 | Cloudflare Access | Secure admin login | FREE |
| 4 | Cloudflare CDN | Fast image delivery | FREE |

### Architecture

```
Admin → Cloudflare Access (Login) → Admin Panel → R2 Bucket
                                                      ↓
Website ← Cloudflare CDN ← config.json + images
```

---

## 🚀 PHASE 1: Create Cloudflare Account

### Step 1.1: Sign Up for Cloudflare

1. Open browser and go to: **https://dash.cloudflare.com/sign-up**
2. Enter your email address
3. Create a strong password
4. Click **Create Account**
5. Verify your email (check inbox for verification link)
6. Click the verification link

### Step 1.2: Complete Account Setup

1. After verification, you'll land on the Cloudflare Dashboard
2. You can skip adding a website for now (we'll use R2 directly)
3. Your dashboard should show the main menu on the left

**✅ Checkpoint:** You should now be logged into Cloudflare Dashboard

---

## 🗄️ PHASE 2: Set Up Cloudflare R2 (Storage)

### Step 2.1: Enable R2

1. In Cloudflare Dashboard, look at the **left sidebar**
2. Click on **R2 Object Storage**
3. If it's your first time, you may need to:
   - Accept the R2 terms of service
   - Add a payment method (required but won't charge for free tier)
4. Click **Create bucket**

### Step 2.2: Create the Campaign Bucket

1. Bucket name: `devlin-campaigns`
2. Location: Choose **Automatic** (or select closest to UK)
3. Click **Create bucket**

### Step 2.3: Enable Public Access

1. Click on your bucket `devlin-campaigns`
2. Go to **Settings** tab
3. Find **Public Access** section
4. Click **Allow Access**
5. Note down the public URL (looks like: `https://pub-xxxxx.r2.dev`)

### Step 2.4: Create Folder Structure

1. In your bucket, click **Upload**
2. Click **Create folder** → Name it `banners`
3. Click **Create folder** → Name it `config`

**✅ Checkpoint:** Your R2 bucket structure should look like:

```
devlin-campaigns/
├── banners/        (for campaign images)
└── config/         (for config.json)
```

---

## 📄 PHASE 3: Create Campaign Configuration

### Step 3.1: Create config.json File

Create a file on your computer named `config.json` with this content:

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-06T12:00:00Z",
  "campaigns": [
    {
      "id": "default-campaign",
      "name": "Welcome to Devlin",
      "active": true,
      "priority": 1,
      "schedule": {
        "startDate": "2026-01-01",
        "endDate": "2026-12-31"
      },
      "banner": {
        "imageUrl": "https://YOUR-R2-PUBLIC-URL/banners/default-banner.jpg",
        "altText": "Devlin Wholesale - Quality Flooring",
        "linkUrl": "/products.html"
      }
    }
  ],
  "fallback": {
    "imageUrl": "https://YOUR-R2-PUBLIC-URL/banners/default-banner.jpg",
    "altText": "Devlin Wholesale",
    "linkUrl": "/products.html"
  }
}
```

### Step 3.2: Replace the URL

Replace `YOUR-R2-PUBLIC-URL` with your actual R2 public URL from Step 2.3.

Example: `https://pub-abc123xyz.r2.dev`

### Step 3.3: Upload config.json

1. Go to your R2 bucket `devlin-campaigns`
2. Navigate into the `config` folder
3. Click **Upload**
4. Select your `config.json` file
5. Click **Upload**

### Step 3.4: Upload a Default Banner

1. Prepare a banner image (recommended: 1920x600 pixels)
2. Name it: `default-banner.jpg`
3. Go to your R2 bucket → `banners` folder
4. Click **Upload**
5. Select your banner image
6. Click **Upload**

**✅ Checkpoint:** Your bucket should now have:

```
devlin-campaigns/
├── banners/
│   └── default-banner.jpg
└── config/
    └── config.json
```

---

## 🔐 PHASE 4: Set Up Cloudflare Access (Security)

### Step 4.1: Navigate to Zero Trust

1. In Cloudflare Dashboard left sidebar
2. Click **Zero Trust** (it may open a new tab)
3. If first time, complete the Zero Trust onboarding:
   - Choose a team name (e.g., `devlin-team`)
   - Select the **Free** plan
   - Complete setup

### Step 4.2: Create Access Application

1. In Zero Trust dashboard, go to **Access** → **Applications**
2. Click **Add an application**
3. Select **Self-hosted**

### Step 4.3: Configure Application Settings

**Application Configuration:**
- Application name: `Devlin Admin Panel`
- Session Duration: `24 hours` (or your preference)

**Application Domain:**
- Subdomain: `admin`
- Domain: `devlinwholesale.co.uk` (your domain)
- Full URL will be: `admin.devlinwholesale.co.uk`

> **Note:** If you don't have a custom domain, you can use `admin.devlin-team.cloudflareaccess.com`

Click **Next**

### Step 4.4: Create Access Policy

**Policy name:** `Admin Access`

**Configure Rules:**
1. Action: **Allow**
2. Include rule:
   - Selector: **Emails**
   - Value: Enter allowed admin emails, one per line:
     ```
     admin@devlinwholesale.co.uk
     owner@devlinwholesale.co.uk
     your-personal-email@gmail.com
     ```

Click **Next** → **Add application**

**✅ Checkpoint:** Cloudflare Access is now configured. Only the emails you listed can access the admin panel.

---

## 🌐 PHASE 5: Set Up Admin Panel (Cloudflare Pages)

### Step 5.1: Prepare Admin Panel Files

Create a folder on your computer called `devlin-admin` with these files:

**File 1: `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devlin Campaign Manager</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #fff;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 30px;
        }
        h1 { font-size: 24px; }
        .card {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card h2 { margin-bottom: 20px; font-size: 18px; }
        .campaign-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .status-active { color: #4ade80; }
        .status-inactive { color: #f87171; }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 8px;
        }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; }
        .btn-danger { background: #ef4444; color: white; }
        #campaigns-list { min-height: 100px; }
        .loading { text-align: center; padding: 40px; color: #888; }
        .instructions {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .instructions h3 { margin-bottom: 10px; color: #60a5fa; }
        .instructions ol { margin-left: 20px; line-height: 1.8; }
        code {
            background: rgba(0,0,0,0.3);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎯 Devlin Campaign Manager</h1>
            <span id="last-updated">Loading...</span>
        </header>

        <div class="instructions">
            <h3>📋 How to Manage Campaigns</h3>
            <ol>
                <li>Go to <a href="https://dash.cloudflare.com" target="_blank" style="color: #60a5fa;">Cloudflare Dashboard</a> → R2 → devlin-campaigns bucket</li>
                <li>To add a new banner: Upload image to <code>/banners/</code> folder</li>
                <li>To change active campaign: Download <code>config.json</code>, edit it, re-upload</li>
                <li>Set <code>"active": true</code> for the campaign you want to show</li>
            </ol>
        </div>

        <div class="card">
            <h2>📢 Current Campaigns</h2>
            <div id="campaigns-list">
                <div class="loading">Loading campaigns...</div>
            </div>
        </div>

        <div class="card">
            <h2>🖼️ Preview Active Banner</h2>
            <div id="banner-preview" style="text-align: center; padding: 20px;">
                <div class="loading">Loading preview...</div>
            </div>
        </div>
    </div>

    <script>
        // Replace with your R2 public URL
        const CONFIG_URL = 'https://YOUR-R2-PUBLIC-URL/config/config.json';

        async function loadCampaigns() {
            try {
                const response = await fetch(CONFIG_URL + '?t=' + Date.now());
                const data = await response.json();

                // Update last updated
                document.getElementById('last-updated').textContent = 
                    'Last updated: ' + new Date(data.lastUpdated).toLocaleString();

                // Render campaigns
                const campaignsList = document.getElementById('campaigns-list');
                campaignsList.innerHTML = data.campaigns.map(campaign => `
                    <div class="campaign-item">
                        <div>
                            <strong>${campaign.name}</strong>
                            <span class="${campaign.active ? 'status-active' : 'status-inactive'}">
                                ${campaign.active ? '● Active' : '○ Inactive'}
                            </span>
                            <br>
                            <small style="color: #888;">
                                ${campaign.schedule.startDate} to ${campaign.schedule.endDate}
                            </small>
                        </div>
                        <div>
                            <button class="btn btn-secondary" onclick="window.open('${campaign.banner.imageUrl}', '_blank')">
                                View Image
                            </button>
                        </div>
                    </div>
                `).join('');

                // Show active banner preview
                const activeCampaign = data.campaigns.find(c => c.active);
                if (activeCampaign) {
                    document.getElementById('banner-preview').innerHTML = `
                        <img src="${activeCampaign.banner.imageUrl}" 
                             alt="${activeCampaign.banner.altText}"
                             style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                        <p style="margin-top: 15px; color: #888;">
                            Links to: <code>${activeCampaign.banner.linkUrl}</code>
                        </p>
                    `;
                }

            } catch (error) {
                document.getElementById('campaigns-list').innerHTML = `
                    <div style="color: #f87171; padding: 20px;">
                        Error loading campaigns. Make sure config.json is uploaded to R2.
                        <br><br>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }

        // Load on page load
        loadCampaigns();

        // Auto-refresh every 30 seconds
        setInterval(loadCampaigns, 30000);
    </script>
</body>
</html>
```

### Step 5.2: Update CONFIG_URL

In the `index.html` file, find this line:
```javascript
const CONFIG_URL = 'https://YOUR-R2-PUBLIC-URL/config/config.json';
```

Replace `YOUR-R2-PUBLIC-URL` with your actual R2 public URL.

### Step 5.3: Deploy to Cloudflare Pages

**Option A: Direct Upload**

1. Go to Cloudflare Dashboard → **Pages**
2. Click **Create a project** → **Direct Upload**
3. Project name: `devlin-admin`
4. Click **Create project**
5. Drag and drop your `devlin-admin` folder (containing index.html)
6. Click **Deploy site**

**Option B: Connect to Git (Recommended for long-term)**

1. Push your `devlin-admin` folder to GitHub
2. Go to Cloudflare Dashboard → **Pages**
3. Click **Create a project** → **Connect to Git**
4. Select your GitHub repository
5. Follow the prompts to deploy

### Step 5.4: Set Up Custom Domain (Optional)

1. After deployment, go to your Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter: `admin.devlinwholesale.co.uk`
5. Follow the DNS instructions

**✅ Checkpoint:** Your admin panel should now be live at:
- `https://devlin-admin.pages.dev` (default)
- OR `https://admin.devlinwholesale.co.uk` (if custom domain configured)

---

## 🔗 PHASE 6: Connect Access to Pages

### Step 6.1: Link Access Policy

1. Go back to **Zero Trust** → **Access** → **Applications**
2. Find your `Devlin Admin Panel` application
3. Click **Edit**
4. Update the Application Domain to match your Pages URL:
   - If using default: `devlin-admin.pages.dev`
   - If using custom domain: `admin.devlinwholesale.co.uk`
5. Save changes

### Step 6.2: Test the Login Flow

1. Open a new incognito/private browser window
2. Go to your admin panel URL
3. You should see the Cloudflare Access login screen
4. Enter an authorized email
5. Check your email for the OTP code
6. Enter the code
7. You should now see the admin panel!

**✅ Checkpoint:** Admin panel is now protected. Only authorized emails can access it.

---

## 🌐 PHASE 7: Add Campaign Banner to Website

### Step 7.1: Add JavaScript to Your Website

Add this code to your `index.html` (main website) just before the closing `</body>` tag:

```html
<!-- Dynamic Campaign Banner -->
<script>
(function() {
    const CONFIG_URL = 'https://YOUR-R2-PUBLIC-URL/config/config.json';
    
    async function loadCampaignBanner() {
        try {
            const response = await fetch(CONFIG_URL);
            const data = await response.json();
            
            // Find active campaign
            const today = new Date().toISOString().split('T')[0];
            const activeCampaign = data.campaigns.find(campaign => {
                if (!campaign.active) return false;
                if (campaign.schedule) {
                    const start = campaign.schedule.startDate;
                    const end = campaign.schedule.endDate;
                    if (today < start || today > end) return false;
                }
                return true;
            });
            
            // Use active campaign or fallback
            const campaign = activeCampaign || data.fallback;
            
            // Find the banner container and update it
            const bannerContainer = document.getElementById('campaign-banner');
            if (bannerContainer && campaign) {
                bannerContainer.innerHTML = `
                    <a href="${campaign.banner?.linkUrl || campaign.linkUrl}" 
                       style="display: block;">
                        <img src="${campaign.banner?.imageUrl || campaign.imageUrl}" 
                             alt="${campaign.banner?.altText || campaign.altText}"
                             style="width: 100%; height: auto;">
                    </a>
                `;
            }
        } catch (error) {
            console.error('Failed to load campaign banner:', error);
        }
    }
    
    // Load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadCampaignBanner);
    } else {
        loadCampaignBanner();
    }
})();
</script>
```

### Step 7.2: Add Banner Container

Add this HTML where you want the campaign banner to appear:

```html
<div id="campaign-banner">
    <!-- Dynamic campaign banner will be loaded here -->
</div>
```

### Step 7.3: Update CONFIG_URL

Replace `YOUR-R2-PUBLIC-URL` with your actual R2 public URL in the script.

**✅ Checkpoint:** Your website should now display the active campaign banner!

---

## 📝 PHASE 8: Managing Campaigns (Admin Guide)

### How to Add a New Campaign

1. **Upload Banner Image:**
   - Go to Cloudflare Dashboard → R2 → `devlin-campaigns` bucket
   - Navigate to `banners` folder
   - Click Upload → Select your banner image
   - Note the filename (e.g., `winter-sale-2026.jpg`)

2. **Update config.json:**
   - Download current `config.json` from `config` folder
   - Add new campaign entry:
   ```json
   {
     "id": "winter-sale-2026",
     "name": "Winter Sale 2026",
     "active": true,
     "priority": 1,
     "schedule": {
       "startDate": "2026-12-01",
       "endDate": "2026-12-31"
     },
     "banner": {
       "imageUrl": "https://pub-xxx.r2.dev/banners/winter-sale-2026.jpg",
       "altText": "Winter Sale - 50% Off All Flooring",
       "linkUrl": "/products.html?sale=winter"
     }
   }
   ```
   - Set other campaigns to `"active": false`
   - Update `lastUpdated` date
   - Upload updated `config.json` back to R2

### How to Switch Active Campaign

1. Download `config.json` from R2
2. Find the campaign you want to activate
3. Set `"active": true` for that campaign
4. Set `"active": false` for all other campaigns
5. Upload updated `config.json` back to R2
6. Website will show new campaign within seconds!

### How to Deactivate All Campaigns

1. Download `config.json`
2. Set `"active": false` for all campaigns
3. Upload back to R2
4. Website will show the fallback banner

---

## ✅ Final Checklist

- [ ] Cloudflare account created
- [ ] R2 bucket created with public access
- [ ] Folder structure created (banners/, config/)
- [ ] config.json uploaded
- [ ] At least one banner image uploaded
- [ ] Cloudflare Access configured with allowed emails
- [ ] Admin panel deployed to Cloudflare Pages
- [ ] Admin panel protected by Access
- [ ] JavaScript added to main website
- [ ] Banner container added to website HTML
- [ ] Tested: admin login works
- [ ] Tested: banner displays on website

---

## 🆘 Troubleshooting

### Banner not showing on website
- Check browser console for errors
- Verify CONFIG_URL is correct
- Ensure R2 bucket has public access enabled
- Check that config.json is valid JSON

### Can't access admin panel
- Verify your email is in the Access policy
- Check spam folder for OTP email
- Try incognito mode
- Clear browser cache

### Images not loading
- Verify R2 public access is enabled
- Check image URLs in config.json are correct
- Ensure images are uploaded to correct folder

---

## 📞 Support

For issues with:
- **Cloudflare services:** https://support.cloudflare.com
- **This implementation:** Contact your development team

---

*Last Updated: February 2026*
*Version: 1.0*
