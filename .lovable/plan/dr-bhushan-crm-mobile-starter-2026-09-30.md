# Dr. Bhushan CRM mobile starter

## Goal
Create a polished mobile-first CRM interface that carries over the existing Dr. Bhushan brand: deep clinical teal, fresh green accents, white surfaces, Montserrat headings, Inter body copy, compact corners, and restrained shadows.

## First release
- Login screen only, with no registration flow.
- App shell with a slide-out drawer and profile summary.
- Minimal dashboard with greeting, high-level patient/lead/appointment metrics, today’s appointments, quick actions, and recent leads.
- Functional interactions for showing the drawer, switching starter sections, toggling password visibility, and signing into the preview.
- Phone-first layout that remains usable at wider browser sizes.

## Navigation
- Dashboard
- Patients
- Leads
- Appointments
- Treatments
- Logout

## Technical approach
This Lovable project runs as a TanStack web app, so the delivered preview will be a responsive mobile-web implementation rather than a native Expo binary. The visual and screen architecture will be suitable to port into an Expo Router app using TanStack Query, socket.io-client, and Secure Store when a native Expo repository is available.

## Validation
- Verify the login-to-dashboard flow.
- Verify drawer open/close and navigation states.
- Check the result at a phone viewport and desktop viewport.
- Confirm metadata and the project build are healthy.
