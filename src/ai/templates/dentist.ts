import type { BusinessData } from "./plumber";

export function renderDentist(data: BusinessData): string {
  const { name, phone, address, city, state, services, description } = data;
  const mapQuery = encodeURIComponent(`${address}, ${city}, ${state}`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | Dentist in ${city}, ${state}</title>
  <meta name="description" content="${description.slice(0, 160)}" />
  <meta name="keywords" content="dentist ${city}, dental services ${city}, cosmetic dentist ${city}" />
  <meta property="og:title" content="${name} - ${city} Dentist" />
  <meta property="og:description" content="${description.slice(0, 200)}" />
  <meta property="og:type" content="website" />
  <meta name="geo.region" content="US-${state}" />
  <meta name="geo.placename" content="${city}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; line-height: 1.6; }
    .hero { background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%); color: white; padding: 80px 20px; text-align: center; }
    .hero h1 { font-size: 2.8em; margin-bottom: 12px; }
    .hero p { font-size: 1.2em; opacity: 0.9; max-width: 600px; margin: 0 auto 24px; }
    .hero .phone { display: inline-block; background: #1abc9c; color: white; padding: 16px 36px; border-radius: 50px; font-size: 1.4em; font-weight: 700; text-decoration: none; margin-top: 10px; }
    .container { max-width: 1100px; margin: 0 auto; padding: 60px 20px; }
    .section-title { font-size: 2em; margin-bottom: 30px; text-align: center; color: #1a5276; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .service-card { background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #2e86c1; }
    .service-card h3 { color: #1a5276; margin-bottom: 8px; }
    .about { background: #f0f4f8; }
    .about p { max-width: 800px; margin: 0 auto; font-size: 1.1em; }
    .contact-section { background: #1a5276; color: white; text-align: center; padding: 60px 20px; }
    .contact-section h2 { font-size: 2em; margin-bottom: 20px; }
    .contact-section p { font-size: 1.1em; margin-bottom: 16px; }
    .contact-section .phone { display: inline-block; background: #1abc9c; color: white; padding: 14px 32px; border-radius: 50px; font-size: 1.2em; font-weight: 700; text-decoration: none; }
    .map { width: 100%; height: 350px; border: none; }
    .badge { display: inline-block; background: #1abc9c; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.85em; font-weight: 600; margin-bottom: 16px; }
    .hours { background: #eaf2f8; padding: 20px; border-radius: 12px; max-width: 400px; margin: 20px auto 0; text-align: center; }
    .hours h4 { color: #1a5276; margin-bottom: 8px; }
    footer { background: #1a1a2e; color: #aaa; text-align: center; padding: 30px 20px; font-size: 0.9em; }
    @media (max-width: 768px) { .hero h1 { font-size: 2em; } .hero .phone { font-size: 1.1em; padding: 12px 24px; } }
  </style>
</head>
<body>
  <section class="hero">
    <div class="badge">🦷 New Patients Welcome</div>
    <h1>${name}</h1>
    <p>Gentle, Professional Dental Care in ${city}, ${state}</p>
    <p>${description}</p>
    <a href="tel:${phone}" class="phone">📞 Call Now: ${phone}</a>
  </section>

  <section class="container">
    <h2 class="section-title">Our Dental Services</h2>
    <div class="services-grid">
      ${services.map(s => `<div class="service-card"><h3>${s}</h3></div>`).join("\n      ")}
    </div>
    <div class="hours">
      <h4>📅 Office Hours</h4>
      <p>${data.hours || "Mon-Fri: 8:00 AM - 5:00 PM"}</p>
    </div>
  </section>

  <section class="container about">
    <h2 class="section-title">About ${name}</h2>
    <p>${description}</p>
    <p style="margin-top: 16px; text-align: center;">
      📍 ${address}, ${city}, ${state}<br />
      📞 <a href="tel:${phone}" style="color: #2e86c1; font-weight: 600;">${phone}</a>
    </p>
  </section>

  <section class="contact-section">
    <h2>Book Your Appointment Today</h2>
    <p>Call us to schedule your visit</p>
    <a href="tel:${phone}" class="phone">📞 ${phone}</a>
  </section>

  <iframe class="map" title="Location" src="https://maps.google.com/maps?q=${mapQuery}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

  <footer>
    <p>${name} | ${address}, ${city}, ${state}</p>
    <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}