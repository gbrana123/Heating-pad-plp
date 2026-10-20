# Nyanoshop — Beurer HK Comfort COD Funnel

A production-ready Cash on Delivery sales funnel built with Next.js App Router, TypeScript and Tailwind CSS.

## What is included

- Premium, responsive product landing page at `/`
- Product gallery, quantity selector and live pricing
- Checkout page at `/checkout`
- Thank-you page at `/thank-you`
- Secure server-side order endpoint at `POST /api/order`
- Google Sheets order storage with automatic headers, styling, filter and status dropdown
- HTML order notification email for the business
- HTML order confirmation email for the customer
- Server-side validation, trusted price recalculation and idempotent Sheet writes
- Optimized PNG product assets

No reels section is included because no reel links were provided. The testimonial text is clearly marked as sample content and should be replaced with verified customer feedback before using it as a public claim.

## Pricing configured

- Regular price: Rs. 8,000
- Discount: Rs. 500
- Offer price: Rs. 7,500 per piece
- Delivery inside Kathmandu Valley: Rs. 100
- Delivery outside Kathmandu Valley: Rs. 150

The Rs. 500 answer was interpreted as a discount amount, not a final selling price.

## How the order flow works

1. A shopper chooses quantity and delivery area on the landing page.
2. Those selections are passed to `/checkout` as query parameters.
3. The checkout automatically shows the product, price per piece, delivery charge and total.
4. The form sends JSON to `POST /api/order` with a unique idempotency key.
5. The API validates every field and recalculates pricing from the server-side product configuration. Client-supplied prices cannot override the configured price.
6. The API creates an order ID, appends the order to Google Sheets, sends the business notification, then sends the customer confirmation.
7. A success response is returned only after all required actions finish. The browser then redirects to `/thank-you`.
8. If any required action fails, checkout shows an error and does not redirect. If the Sheet write succeeded but email failed, the response includes the saved order ID so the order can be located safely.

Repeated requests with the same checkout idempotency key use the same order ID, and the Sheets integration checks for that ID before appending another row.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BUSINESS_EMAIL=ranagb275@gmail.com
EMAIL_FROM=ranagb275@gmail.com
BRAND_NAME=Nyanoshop

GOOGLE_SHEET_ID=
GOOGLE_SHEET_TAB_NAME=Orders
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=ranagb275@gmail.com
SMTP_PASS=

EMAIL_SERVICE_API_KEY=
FRONTEND_URL=http://localhost:3000
MOCK_ORDER_SUBMISSION=false
```

`EMAIL_SERVICE_API_KEY` is reserved for a future Resend, Brevo or SendGrid adapter. This project currently uses SMTP through Nodemailer.

Never prefix Google, SMTP or email secrets with `NEXT_PUBLIC_`. Never commit `.env.local`.

## Google Spreadsheet setup

### 1. Create the spreadsheet

Create a Google Spreadsheet, for example **Nyanoshop Orders**. You may create an `Orders` tab yourself, but the integration can also create the configured tab automatically when the service account has editor access.

The integration creates or expects these columns in this exact order:

1. Order ID
2. Date & Time
3. Customer Name
4. Phone Number
5. Email Address
6. Exact Location
7. Product Name
8. Quantity
9. Price Per Piece
10. Total Price
11. Payment Method
12. Order Status
13. Notes

The API formats and freezes the header, adds a filter for a newly created tab, auto-resizes columns, and adds these Order Status dropdown choices:

- New Order
- Order Confirmed
- Order Ongoing
- Delivered
- Cancelled

If using an existing tab, you can also select row 1 in Google Sheets and choose **Data → Create a filter**. For a manual status dropdown, select column L from row 2, choose **Data → Data validation → Dropdown**, and enter the five values above.

### 2. Get the Sheet ID

From a URL such as:

```text
https://docs.google.com/spreadsheets/d/1AbCdEfExampleSheetId/edit
```

copy the text between `/d/` and `/edit` into `GOOGLE_SHEET_ID`.

### 3. Create Google service-account credentials

1. Open Google Cloud Console and create or select a project.
2. Enable the **Google Sheets API**.
3. Go to **IAM & Admin → Service Accounts** and create a service account.
4. Open the service account, create a JSON key, and download it once.
5. Copy `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Copy `private_key` into `GOOGLE_PRIVATE_KEY`. In Vercel, paste the full multiline value. The code also supports a single-line value containing literal `\n` characters.
7. Share the Google Spreadsheet with the service-account email and give it **Editor** access.
8. Put the intended tab name, such as `Orders`, in `GOOGLE_SHEET_TAB_NAME`.

## Gmail SMTP setup

For a Gmail or Google Workspace sender:

1. Enable 2-Step Verification on the Google account.
2. Create a Google **App Password** for Mail.
3. Set `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=465`.
4. Set `SMTP_USER` and `EMAIL_FROM` to the Gmail address.
5. Put the 16-character app password in `SMTP_PASS` without spaces.
6. Set `BUSINESS_EMAIL` to the inbox that should receive new-order notifications.

Do not use the normal Gmail account password. Gmail may require the authenticated address to match `EMAIL_FROM`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test the full UI before adding credentials

For local development only, set:

```text
MOCK_ORDER_SUBMISSION=true
```

The API will validate the real payload and complete the redirect without writing to Sheets or sending email. Mock mode is forcibly disabled when `NODE_ENV=production`.

### Test the real integration

1. Add all Google and SMTP variables.
2. Set `MOCK_ORDER_SUBMISSION=false`.
3. Submit an order using an email inbox you can check.
4. Confirm that the new row appears in the configured Sheet.
5. Confirm that `BUSINESS_EMAIL` receives the “New Product Order Received” message.
6. Confirm that the customer receives the “Your Order Has Been Received” message.
7. Confirm that the browser reaches `/thank-you` and shows the same order ID and total.
8. Test an invalid email and missing location to verify error handling.

## Product image optimization

The supplied JPG and WebP were converted into four optimized PNG presentation assets. To regenerate them:

```bash
node scripts/optimize-images.mjs "path/to/flat-image.jpg" "path/to/packshot.webp"
```

## Deploy to Vercel

1. Push this folder to a Git repository.
2. Import the repository at Vercel and choose the Next.js framework preset.
3. Add every production environment variable in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to the final HTTPS domain, with no trailing slash.
5. Keep `MOCK_ORDER_SUBMISSION=false` or omit it.
6. Deploy.
7. Submit one real low-risk test order and verify the Sheet and both inboxes.

The API route uses the Node.js runtime, which is required by Nodemailer and Google authentication and is supported by Vercel Functions.

## Where to edit later

- Product content and prices: `src/lib/product.ts`
- Landing page sections: `src/app/page.tsx`
- Checkout fields and UI: `src/components/checkout-form.tsx`
- Server validation: `src/lib/order-schema.ts`
- Google Sheets logic: `src/lib/google-sheets.ts`
- Email HTML: `src/lib/email-templates.ts`
- API workflow: `src/app/api/order/route.ts`
