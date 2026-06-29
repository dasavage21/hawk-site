import type { BusinessData } from "./plumber";

export function renderGeneric(data: BusinessData): string {
  const { name, phone, address, city, state, services, description } = data;
  const mapQuery = encodeURIComponent(`${address}, ${city}, ${state}`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | Serving ${city}, ${state}</title>
  <meta name="description" content="${description.slice(0, 160)}" />
  <meta name="keywords" content="${name}, ${city} services, ${services.slice(0, 3).join(", ")}" />
  <meta property="og:title" content="${name} - ${city}" />
  <meta property="og:description" content="${description.slice(0, 200)}" />
  <meta property="og:type" content="website" />
  <meta name="geo.region" content="US-${state}" />
  <meta name="geo.placename" content="${city}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; line-height: 1.6; }
    .hero { background: linear-gradient(135deg, #283593 0%, #5c6bc0 100%); color: white; padding: 80px 20px; text-align: center; }
    .hero h1 { font-size: 2.8em; margin-bottom: 12px; }
    .hero p { font-size: 1.2em; opacity: 0.9; max-width: 600px; margin: 0 auto 24px; }
    .hero .phone { display: inline-block; background: #ff7043; color: white; padding: 16px 36px; border-radius: 50px; font-size: 1.4em; font-weight: 700; text-decoration: none; margin-top: 10px; }
    .container { max-width: 1100px; margin: 0 auto; padding: 60px 20px; }
    .section-title { font-size: 2em; margin-bottom: 30px; text-align: center; color: #283593; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .service-card { background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #5c6bc0; }
    .service-card h3 { color: #283593; margin-bottom: 8px; }
    .about { background: #f0f4f8; }
    .about p { max-width: 800px; margin: 0 auto; font-size: 1.1em; }
    .contact-section { background: #283593; color: white; text-align: center; padding: 60px 20px; }
    .contact-section h2 { font-size: 2em; margin-bottom: 20px; }
    .contact-section p { font-size: 1.1em; margin-bottom: 16px; }
    .contact-section .phone { display: inline-block; background: #ff7043; color: white; padding: 14px 32px; border-radius: 50px; font-size: 1.2em; font-weight: 700; text-decoration: none; }
    .map { width: 100%; height: 350px; border: none; }
    .badge { display: inline-block; background: #ff7043; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.85em; font-weight: 600; margin-bottom: 16px; }
    footer { background: #1a1a2e; color: #aaa; text-align: center; padding: 30px 20px; font-size: 0.9em; }
    @media (max-width: 768px) { .hero h1 { font-size: 2em; } .hero .phone { font-size: 1.1em; padding: 12px 24px; } }
  </style>
</head>
<body>
  <section class="hero">
    <div class="badge">📍 Serving ${city} and Surrounding Areas</div>
    <h1>${name}</h1>
    <p>Professional Services in ${city}, ${state}</p>
    <p>${description}</p>
    <a href="tel:${phone}" class="phone">📞 Call Now: ${phone}</a>
  </section>

  <section class="container">
    <h2 class="section-title">Our Services</h2>
    <div class="services-grid">
      ${services.map(s => `<div class="service-card"><h3>${s}</h3></div>`).join("\n      ")}
    </div>
  </section>

  <section class="container about">
    <h2 class="section-title">About ${name}</h2>
    <p>${description}</p>
    <p style="margin-top: 16px; text-align: center;">
      📍 ${address}, ${city}, ${state}<br />
      📞 <a href="tel:${phone}" style="color: #5c6bc0; font-weight: 600;">${phone}</a>
    </p>
  </section>

  <section class="contact-section">
    <h2>Get In Touch</h2>
    <p>Call us today for more information</p>
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