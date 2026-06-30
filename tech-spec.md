# Website Technical Specification

---

## Global Components (Shared Across All Pages)

### Header / Navbar
- Fixed top navigation bar containing the site logo on the left and a horizontal menu of nav items on the right.
- **Nav Items:** Home → `index.html`, About → `about.html`, Services → `services.html`, Contact → `contact.html` — each links to its dedicated page.
- **Basic Styles:** Full-width bar, white background with subtle bottom shadow, flex layout with space-between, nav links in 16px font with hover underline effect, padding ~1rem vertical.

### Footer
- Full-width footer at the bottom of every page containing copyright text, a small sitemap repeat of nav links and optional social media icons.
- **Basic Styles:** Dark background (slate/navy), white/light gray text, centered content, padding ~2rem, links with reduced opacity hover effect.

---

## Page 1 — `index.html` (Home)

### Section 1: Header (Navbar)
- Same global header component as described above. "Home" nav item is visually active/highlighted to indicate current page.

### Section 2: Hero
- Full-width banner section occupying the viewport height with a large headline, a short subheadline tagline and a primary call-to-action button (e.g., "Get Started" or "Learn More").
- **Basic Styles:** Centered text alignment, large bold headline (~48px), muted subheadline (~20px), prominent button with background color and rounded corners, optional background image or gradient overlay.

### Section 3: Features / Services Overview
- Three-column grid showcasing the top 3 services or value propositions, each with an icon, a heading and a one-line description.
- **Basic Styles:** White/light background, equal-width columns with gap spacing, icons sized ~48px, headings ~20px bold, descriptions ~16px regular, centered text per card.

### Section 4: Testimonials
- A horizontal row or carousel of 2–3 customer testimonial cards, each containing a short quote, the customer name and their role.
- **Basic Styles:** Light gray background, card style with white background and subtle shadow, italic quote text, author name in bold below, padding ~1.5rem per card.

### Section 5: Call-to-Action (CTA) Banner
- A full-width strip with a compelling headline and a single button encouraging the user to take action (e.g., "Contact Us Today").
- **Basic Styles:** Contrasting background color (e.g., primary brand color), white text, centered content, large button with inverted colors (white bg, colored text), generous vertical padding (~3rem).

### Section 6: Footer
- Same global footer component as described above.

---

## Page 2 — `about.html` (About)

### Section 1: Header (Navbar)
- Same global header component. "About" nav item is visually active/highlighted.

### Section 2: Page Hero / Page Title Banner
- A shorter banner (not full viewport) with a large page title ("About Us") and a short breadcrumb or subtitle line.
- **Basic Styles:** Centered text, solid muted background color or light gradient, title ~40px bold, subtitle ~16px, padding ~4rem vertical.

### Section 3: Company Story / Mission
- A two-column layout: left side has a heading ("Our Story" or "Who We Are") and a few paragraphs of text; right side has a relevant image.
- **Basic Styles:** Max-width container centered, text column ~55% width, image column ~45%, heading ~28px bold, body text ~16px with comfortable line height (~1.6), vertical gap between columns ~2rem.

### Section 4: Team Members
- A grid of team member cards, each showing a profile photo, name, job title and a short one-line bio.
- **Basic Styles:** Three to four columns depending on screen size, circular profile photos (~120px), name ~18px bold, title ~14px muted color, card padding ~1rem, centered text per card.

### Section 5: Footer
- Same global footer component.

---

## Page 3 — `services.html` (Services)

### Section 1: Header (Navbar)
- Same global header component. "Services" nav item is visually active/highlighted.

### Section 2: Page Hero / Page Title Banner
- Same style as Page 2 hero: shorter banner with "Our Services" title and a brief subtitle explaining what the page offers.
- **Basic Styles:** Same as Page 2 Section 2.

### Section 3: Services List
- A vertical stack of service cards, each card containing a service icon, a service title, a 2–3 line description and a "Learn More" link.
- **Basic Styles:** White background, each card has a light border or subtle shadow, icon ~40px aligned left, title ~22px bold, description ~16px, link in primary color with arrow icon, padding ~1.5rem per card, vertical gap ~1rem between cards.

### Section 4: Pricing / Plans (Optional)
- A three-column pricing table showing different tiers (Basic, Standard, Premium) with plan names, prices, feature lists and a "Choose Plan" button per tier.
- **Basic Styles:** Cards of equal height, top plan name highlighted with primary color background, price ~36px bold, feature list with checkmarks, button full-width at bottom of card, center column slightly elevated (popular/highlighted style).

### Section 5: Footer
- Same global footer component.

---

## Page 4 — `contact.html` (Contact)

### Section 1: Header (Navbar)
- Same global header component. "Contact" nav item is visually active/highlighted.

### Section 2: Page Hero / Page Title Banner
- Same style as Page 2 hero: shorter banner with "Contact Us" title and a brief subtitle inviting users to reach out.
- **Basic Styles:** Same as Page 2 Section 2.

### Section 3: Contact Form
- A form with fields for Name, Email, Subject (dropdown) and Message (textarea), plus a "Send Message" submit button.
- **Basic Styles:** Form container with max-width ~600px, labels above each field, input fields with full width, light border, rounded corners, padding ~0.75rem, textarea ~150px height, button full-width or aligned right, primary color background.

### Section 4: Contact Details + Map
- A two-column section: left side lists contact details (address, phone, email, business hours), right side displays an embedded map or static map image.
- **Basic Styles:** Text side with icon + detail pairs, icons ~20px, detail text ~16px, map container with rounded corners and fixed height (~300px), gap between columns ~2rem.

### Section 5: Footer
- Same global footer component.

---

## Summary of Nav Item Routing

| Nav Item | Links To | Active On Page |
|----------|----------|----------------|
| Home     | `index.html`  | Page 1 |
| About    | `about.html`  | Page 2 |
| Services | `services.html` | Page 3 |
| Contact  | `contact.html` | Page 4 |

---

*End of Technical Specification*
