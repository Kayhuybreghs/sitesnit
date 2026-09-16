export function publicWebsiteUrl(input: string) {
  let u: URL;
  try {
    u = new URL(
      /^https?:\/\//i.test(input.trim())
        ? input.trim()
        : `https://${input.trim()}`,
    );
  } catch {
    throw new Error(
      "Vul een geldig websiteadres in, bijvoorbeeld voorbeeld.nl.",
    );
  }
  if (
    !["https:", "http:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    u.port ||
    input.length > 2000
  )
    throw new Error(
      "Gebruik een openbaar websiteadres zonder inloggegevens of poortnummer.",
    );
  const h = u.hostname.toLowerCase().replace(/\.$/, '');
  const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(h);
  if (
    !h.includes(".") ||
    h === "localhost" ||
    /\.(localhost|local|internal|test|invalid)$/.test(h) ||
    h.startsWith("[") ||
    (ipv4 && /^(0|10|127|169\.254|192\.168|172\.(1[6-9]|2\d|3[01])|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7]))\./.test(
      h,
    )) ||
    (ipv4 && /^(22[4-9]|23\d|24\d|25[0-5])\./.test(h))
  )
    throw new Error("Gebruik een openbare website die Google kan bereiken.");
  u.hostname = h;
  if (u.search) throw new Error('Gebruik een openbaar pagina-adres zonder vraagteken en extra parameters. Zo worden geen trackingcodes of privégegevens met Google gedeeld.');
  u.hash = "";
  return u.href;
}
