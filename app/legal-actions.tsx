'use client';

export function PrintDocument() {
  return <button className="text-link legal-print" type="button" onClick={() => window.print()}>Bewaren of afdrukken ↗</button>;
}
