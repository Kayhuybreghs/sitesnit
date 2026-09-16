"use client";
import { useState } from "react";
import {
  emptyOffer,
  offerTotals,
  offersComparable,
  scopeItems,
  offerQuestions,
  summarizeOffers,
  type Offer,
} from "../../../lib/tool-plans";
import {
  ToolLead,
  ToolActions,
  ToolContact,
  ToolHelp,
  useToolDraft,
  money,
} from "../tool-components";
const initial = [emptyOffer("a", "Voorstel A"), emptyOffer("b", "Voorstel B")];
const scopeLabel = {
  yes: "Inbegrepen",
  no: "Niet inbegrepen",
  unknown: "Niet vermeld",
};
const vatLabel = {
  excl: "excl. btw",
  incl: "incl. btw",
  unknown: "btw-basis onbekend",
};
function valid(data: unknown): data is Offer[] {
  return (
    Array.isArray(data) &&
    data.length >= 2 &&
    data.length <= 3 &&
    new Set(data.map((o) => o?.id)).size === data.length &&
    data.every(
      (o) =>
        o &&
        [
          "id",
          "name",
          "once",
          "monthly",
          "yearly",
          "includedMonths",
          "pages",
        ].every((key) => typeof o[key] === "string" && o[key].length <= 150) &&
        ["excl", "incl", "unknown"].includes(o.vat) &&
        ["fixed", "unknown"].includes(o.rates) &&
        scopeItems.every(([key]) =>
          ["yes", "no", "unknown"].includes(o.scope?.[key]),
        ),
    )
  );
}
export default function OfferComparer() {
  const [offers, setOffers, ready] = useToolDraft(
    "sitesnit-offers-v1",
    initial,
    valid,
  );
  const [active, setActive] = useState("a");
  const current = offers.find((o) => o.id === active) ?? offers[0];
  const results = offers.map((offer) => ({ offer, total: offerTotals(offer) }));
  const comparable = offersComparable(offers);
  const example = offers.some((o) => o.example);
  const openQuestions = offerQuestions(offers);
  const update = (change: Partial<Offer>) => {
    setOffers(
      offers.map((o) => (o.id === current.id ? { ...o, ...change } : o)),
    );
  };
  const summary = summarizeOffers(offers);
  const showExample = () => {
    setOffers([
      {
        ...emptyOffer("a", "Voorbeeld A"),
        example: true,
        once: "1500",
        monthly: "75",
        yearly: "0",
        vat: "excl",
        pages: "5",
        scope: {
          content: "no",
          images: "unknown",
          features: "yes",
          management: "yes",
          hosting: "yes",
          support: "yes",
        },
      },
      {
        ...emptyOffer("b", "Voorbeeld B"),
        example: true,
        once: "2200",
        monthly: "29,99",
        yearly: "0",
        vat: "excl",
        pages: "5",
        scope: {
          content: "yes",
          images: "unknown",
          features: "yes",
          management: "yes",
          hosting: "yes",
          support: "yes",
        },
      },
    ]);
    setActive("a");
  };
  return (
    <div className="tool-workbench">
      <ToolLead
        eyebrow="Kiezen / Website-offertes"
        title="Twee voorstellen."
        accent="Een helder verschil."
      >
        Vergelijk wat je krijgt én wat je betaalt. Vul de bedragen uit je
        offertes in. Onbekende kosten blijven herkenbaar; je krijgt geen
        automatische winnaar.
      </ToolLead>
      <div className="wrap tool-workspace offer-workspace">
        <section className="tool-form">
          <div className="workbench-top">
            <h2>Jouw voorstellen</h2>
            <button
              type="button"
              className="text-link"
              onClick={showExample}
              disabled={!ready}
            >
              Vul een voorbeeld in
            </button>
          </div>
          {example && (
            <p className="tool-example-note">
              Gestart met fictieve voorbeeldbedragen · controleer alle velden.{" "}
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setOffers(initial);
                  setActive("a");
                }}
              >
                Begin met lege voorstellen
              </button>
            </p>
          )}
          <div
            className="offer-switch"
            aria-label="Kies welk voorstel je invult"
          >
            {offers.map((o) => (
              <button
                type="button"
                key={o.id}
                aria-pressed={o.id === current.id}
                onClick={() => setActive(o.id)}
              >
                {o.name || "Naamloos voorstel"}
              </button>
            ))}
            {offers.length < 3 && (
              <button
                type="button"
                onClick={() => {
                  setOffers([...offers, emptyOffer("c", "Voorstel C")]);
                  setActive("c");
                }}
              >
                + Derde voorstel
              </button>
            )}
          </div>
          <div className="field">
            <label htmlFor="offer-name">Naam van het voorstel</label>
            <input
              id="offer-name"
              value={current.name}
              maxLength={60}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <p className="field-help">
            Vul ieder totaal één keer in. Zit hosting al in het maandbedrag? Tel
            het niet nogmaals mee. Vul 0 in als er geen kosten zijn; laat
            onbekende bedragen leeg.
          </p>
          <div className="offer-money-fields">
            {(
              [
                ["once", "Eenmalige prijs"],
                ["monthly", "Totaal per maand"],
                ["yearly", "Overige kosten per jaar"],
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label htmlFor={`offer-${key}`}>{label}</label>
                <div className="currency-field">
                  <span>€</span>
                  <input
                    id={`offer-${key}`}
                    inputMode="decimal"
                    placeholder="Niet vermeld"
                    maxLength={16}
                    value={current[key]}
                    onChange={(e) => update({ [key]: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="offer-vat">Welke bedragen vul je in?</label>
              <select
                id="offer-vat"
                value={current.vat}
                onChange={(e) =>
                  update({ vat: e.target.value as Offer["vat"] })
                }
              >
                <option value="unknown">Btw-basis nog niet duidelijk</option>
                <option value="excl">Alles exclusief btw</option>
                <option value="incl">Alles inclusief btw</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="offer-included">
                Maanden inbegrepen in de bouwprijs
              </label>
              <input
                id="offer-included"
                type="number"
                min="0"
                max="36"
                step="1"
                value={current.includedMonths}
                onChange={(e) => update({ includedMonths: e.target.value })}
              />
              <small>
                Alleen voor het maandbedrag. Jaarbedragen tellen apart.
              </small>
            </div>
          </div>
          <div className="field">
            <label htmlFor="offer-rates">
              Zijn de terugkerende tarieven bekend voor drie jaar?
            </label>
            <select
              id="offer-rates"
              value={current.rates}
              onChange={(e) =>
                update({ rates: e.target.value as Offer["rates"] })
              }
            >
              <option value="fixed">
                Ja, rekenen met gelijkblijvende tarieven
              </option>
              <option value="unknown">
                Nee, bijvoorbeeld een onbekende verlengprijs
              </option>
            </select>
          </div>
          <fieldset className="offer-scope">
            <legend>Wat zit er in het voorstel?</legend>
            <div className="field">
              <label htmlFor="offer-pages">Pagina’s / omvang</label>
              <input
                id="offer-pages"
                maxLength={100}
                placeholder="Bijvoorbeeld 5 pagina’s"
                value={current.pages}
                onChange={(e) => update({ pages: e.target.value })}
              />
            </div>
            {scopeItems.map(([key, label]) => (
              <div className="scope-control" key={key}>
                <label htmlFor={`scope-${key}`}>{label}</label>
                <select
                  id={`scope-${key}`}
                  value={current.scope[key]}
                  onChange={(e) =>
                    update({
                      scope: { ...current.scope, [key]: e.target.value },
                    })
                  }
                >
                  {Object.entries(scopeLabel).map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </fieldset>
          {offerTotals(current).invalid.length > 0 && (
            <p role="alert" className="error-box">
              Controleer: {offerTotals(current).invalid.join(", ")}. Gebruik
              positieve bedragen, bijvoorbeeld 1895,50, en maximaal 36
              inbegrepen maanden.
            </p>
          )}
          <div className="workbench-bottom">
            <a className="button" href="#vergelijking">
              Bekijk je vergelijking ↓
            </a>
            {offers.length === 3 && current.id === "c" && (
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setOffers(offers.filter((o) => o.id !== "c"));
                  setActive("a");
                }}
              >
                Verwijder derde voorstel
              </button>
            )}
          </div>
        </section>
        <section className="tool-result print-summary" id="vergelijking">
          <span className="eyebrow">Inhoud & bekende kosten</span>
          <h2>Dit ligt er naast elkaar.</h2>
          <p className="result-disclaimer">
            {comparable
              ? "De bekende kosten zijn op dezelfde btw-basis berekend. De inhoud bepaalt mede welke opdracht past."
              : "De vergelijking is nog niet compleet of gebruikt verschillende btw-bases. Stem de open punten af voordat je bedragen rechtstreeks vergelijkt."}
          </p>
          <div className={`offer-results offers-${offers.length}`}>
            {results.map(({ offer: o, total: t }) => (
              <article className="offer-result-card" key={o.id}>
                <h3>{o.name || "Naamloos voorstel"}</h3>
                <span className="offer-vat">{vatLabel[o.vat]}</span>
                <dl>
                  <div>
                    <dt>
                      {t.complete
                        ? "Totaal 12 maanden"
                        : "Bekend subtotaal 12 maanden"}
                    </dt>
                    <dd>
                      {t.invalid.length ? "Controleer invoer" : money(t.year)}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      {t.complete
                        ? "Totaal 36 maanden"
                        : "Bekend subtotaal 36 maanden"}
                    </dt>
                    <dd>
                      {t.invalid.length
                        ? "Controleer invoer"
                        : money(t.threeYears)}
                    </dd>
                  </div>
                </dl>
                {!t.complete && (
                  <p className="offer-incomplete">
                    Nog open: {t.missing.join(", ") || t.invalid.join(", ")}.{" "}
                    {o.rates === "unknown" &&
                      "Daarom zijn terugkerende bedragen niet in het subtotaal opgenomen."}
                  </p>
                )}
                <ul>
                  <li>
                    <b>Omvang</b>
                    <span>{o.pages || "Niet vermeld"}</span>
                  </li>
                  {scopeItems.map(([key, label]) => (
                    <li key={key}>
                      <b>{label}</b>
                      <span>{scopeLabel[o.scope[key]]}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="tool-takeaway">
            <h3>Dit kun je nog navragen</h3>
            <ul>
              {openQuestions.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {openQuestions.length === 0 && (
              <p>
                De ingevulde onderdelen zijn benoemd. Bekijk ook het werk, de
                aanpak en de afspraken met iedere aanbieder.
              </p>
            )}
          </div>
          <p className="field-help">
            Rekenbasis: eenmalig + maandbedrag × betaalde maanden + jaarbedrag ×
            jaren. Tarieven blijven in deze berekening gelijk. De inhoud is door
            jou ingevuld; Sitesnit heeft de offertes niet beoordeeld.
          </p>
          <ToolActions summary={summary} filename="offertevergelijking" print />
        </section>
      </div>
      <div className="wrap">
        <ToolContact
          summary={summary}
          title="Een voorstel dat je begrijpt."
          text="Vertel wat je wilt laten maken en welke onderdelen je belangrijk vindt."
        />
      </div>
      <ToolHelp
        title="Website-offertes vergelijken: waar let je op?"
        items={[
          [
            "Hoe vergelijk je eenmalige en maandelijkse kosten?",
            "Een lagere bouwprijs kan samengaan met hogere maandkosten. Bekijk daarom dezelfde periode en vul inbegrepen kosten niet dubbel in. Onbekende verlengtarieven blijven open.",
          ],
          [
            "Waarom kijkt deze tool ook naar de inhoud?",
            "Vijf pagina’s kunnen per voorstel iets anders betekenen. Teksten, beelden, functies en onderhoud bepalen welke werkzaamheden je daadwerkelijk ontvangt.",
          ],
          [
            "Wat als iets niet in een offerte staat?",
            "Niet vermeld betekent dat je het nog moet navragen. Het is geen oordeel over de aanbieder of de kwaliteit van het werk.",
          ],
        ]}
      />
    </div>
  );
}
