import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Quote, QuoteLine } from '../types'
import template from '../data/proposal_template.json'
import logo from '../assets/fst-logo.png'

const GREEN = '#008C3C'
const GREEN_DARK = '#00662B'
const TINT = '#E6F0E6'
const GRAY = '#4b5563'
const GRAY_LIGHT = '#9ca3af'
const LINE = '#e5e7eb'

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const secties = (template as { standaard_secties: Record<string, string> }).standaard_secties ?? {}
const blokken = (template as { technische_blokken: Record<string, string> }).technische_blokken ?? {}
const conditionsRaw = (template as { conditions_of_supply?: string }).conditions_of_supply ?? ''

const STD_ORDER = [
  'INTRODUCTION',
  'COATING & APPLICATION SUPPORT',
  'SERVICE ORGANIZATION',
  'REMOTE DIAGNOSTICS',
  'MATERIALS AND TECHNOLOGY',
  'SPARE PARTS AVAILABILITY',
  'REFERENCES',
]

const FALLBACK_TERMS = [
  'All prices are in EUR and exclusive of VAT.',
  'This proposal is valid for 30 days from the date stated on the cover.',
  'Delivery time to be confirmed in mutual consultation upon order.',
  'Payment in instalments, to be agreed upon order.',
  'Flame Spray Technologies is an ISO 9001:2015 and ISO 14001:2015 certified company.',
]

// Splits een tekstblok op dubbele newlines in losse paragrafen (lost door-elkaar-lopen op).
function paragraphs(text: string): string[] {
  return String(text || '').split(/\n\s*\n/).map((s) => s.replace(/[ \t]+\n/g, '\n').trim()).filter(Boolean)
}

// Genormaliseerde "bevat"-match, onafhankelijk van MP-50-prefixen.
function normalize(s: string): string {
  return s.toUpperCase().replace(/MP-?50( LF)?/g, '').replace(/\s+/g, ' ').trim()
}

// Strip systeemprefix/-suffix alleen voor de weergegeven kop.
function cleanHeading(k: string): string {
  return k.replace(/^MP-50 LF\s+/i, '').replace(/^MP-50\s+/i, '').replace(/\s+OF THE MP-50$/i, '').trim()
}

const styles = StyleSheet.create({
  page: { paddingTop: 66, paddingBottom: 52, paddingHorizontal: 46, fontSize: 10, color: '#1f2937', fontFamily: 'Helvetica', lineHeight: 1.4 },
  coverPage: { padding: 0, fontSize: 10, color: '#1f2937', fontFamily: 'Helvetica', lineHeight: 1.4 },

  // Kop/voet (fixed)
  header: { position: 'absolute', top: 24, left: 46, right: 46, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: LINE, paddingBottom: 6 },
  headerLogo: { width: 64 },
  headerRight: { fontSize: 8, color: GRAY_LIGHT },
  footer: { position: 'absolute', bottom: 24, left: 46, right: 46, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6, fontSize: 8, color: GRAY_LIGHT, flexDirection: 'row', justifyContent: 'space-between' },

  // Cover
  coverLogoZone: { paddingTop: 44, paddingHorizontal: 48, paddingBottom: 24 },
  coverLogo: { width: 168 },
  coverBand: { backgroundColor: GREEN, paddingVertical: 34, paddingHorizontal: 48 },
  coverKicker: { fontSize: 13, color: '#ffffff', fontFamily: 'Helvetica-Bold', letterSpacing: 3, opacity: 0.9 },
  coverTitle: { fontSize: 34, color: '#ffffff', fontFamily: 'Helvetica-Bold', marginTop: 6 },
  coverBody: { paddingHorizontal: 48, paddingTop: 28 },
  including: { fontSize: 10, color: GRAY, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  includingVal: { fontSize: 11, color: '#1f2937', marginBottom: 8 },
  coverBlock: { marginTop: 24, borderTopWidth: 2, borderTopColor: GREEN, paddingTop: 18 },
  coverRow: { flexDirection: 'row', marginBottom: 8 },
  coverLabel: { width: 150, color: GRAY, fontFamily: 'Helvetica-Bold' },
  coverValue: { flex: 1, color: '#1f2937' },
  coverFooter: { position: 'absolute', bottom: 40, left: 48, right: 48, borderTopWidth: 2, borderTopColor: GREEN, paddingTop: 8, fontSize: 9, color: GREEN_DARK, fontFamily: 'Helvetica-Bold' },

  // Secties — één typografische schaal
  chapter: { fontSize: 14, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  h2: { fontSize: 11, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', marginTop: 14, marginBottom: 6 },
  para: { color: GRAY, marginBottom: 8 },

  // Revision history
  table: { borderWidth: 1, borderColor: LINE, borderRadius: 3, marginTop: 6 },
  tHead: { flexDirection: 'row', backgroundColor: TINT },
  tRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: LINE },
  tCellHead: { padding: 6, fontSize: 9, fontFamily: 'Helvetica-Bold', color: GREEN_DARK },
  tCell: { padding: 6, fontSize: 9, color: GRAY },

  // Scope — uitgelijnde kolommen
  catHead: { fontSize: 10, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: TINT, paddingBottom: 3 },
  lineRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: LINE },
  lineDesc: { flexGrow: 1, flexShrink: 1, color: '#1f2937', paddingRight: 8 },
  lineQty: { width: 64, textAlign: 'right', color: '#1f2937', fontFamily: 'Helvetica-Bold' },

  // Investment — omkaderde box
  investment: { marginTop: 16, borderWidth: 1, borderColor: GREEN, backgroundColor: TINT, borderRadius: 5, paddingVertical: 22, paddingHorizontal: 24, alignItems: 'center' },
  investLabel: { fontSize: 10, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5 },
  investValue: { fontSize: 28, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', marginTop: 6 },
  investNote: { marginTop: 6, fontSize: 9, color: GRAY },

  termItem: { flexDirection: 'row', marginBottom: 6 },
  termBullet: { width: 12, color: GREEN },
  termText: { flex: 1, color: GRAY },

  sketchImg: { width: '100%', objectFit: 'contain', maxHeight: 640 },
  sketchCaption: { marginTop: 8, fontSize: 9, color: GRAY_LIGHT, textAlign: 'center' },
})

export interface OffertePDFProps {
  quote: Quote
  lines: QuoteLine[]
  madeBy: string
  systemName: string
  schetsen: string[]
  datum: string
}

function Header({ systemName }: { systemName: string }) {
  return (
    <View style={styles.header} fixed>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={logo} style={styles.headerLogo} />
      <Text style={styles.headerRight}>{systemName}</Text>
    </View>
  )
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>Flame Spray Technologies</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function Paras({ text }: { text: string }) {
  return (
    <>
      {paragraphs(text).map((p, i) => (
        <Text key={i} style={styles.para}>{p}</Text>
      ))}
    </>
  )
}

// Kop + tekst; minPresenceAhead houdt de kop van de bodem van een pagina (geen zwevende koppen).
function Section({ heading, text }: { heading: string; text: string }) {
  return (
    <View>
      <Text style={styles.h2} minPresenceAhead={54}>{heading}</Text>
      <Paras text={text} />
    </View>
  )
}

export default function OffertePDF({ quote, lines, madeBy, systemName, schetsen, datum }: OffertePDFProps) {
  const reference = quote.projectnr || quote.klant || '—'

  const moduleLines = lines.filter((l) => l.soort === 'module')
  const laborLines = lines.filter((l) => l.soort === 'arbeid')

  const catHas = (cat: string) => moduleLines.some((l) => (l.categorie || '').toUpperCase().includes(cat))
  const hasPlasma = catHas('PLASMA GUNS')
  const hasHVOF = catHas('HVOF GUNS')
  const hasFeeder = catHas('POWDER FEEDERS')

  // "Including: …" — belangrijkste gekozen modules.
  const kernCats = ['THERMAL SPRAY SYSTEMS', 'PLASMA GUNS', 'HVOF GUNS', 'POWDER FEEDERS']
  const including = moduleLines
    .filter((l) => kernCats.some((c) => (l.categorie || '').toUpperCase().includes(c)))
    .map((l) => l.omschrijving)
    .filter(Boolean)
    .slice(0, 5)
  const includingText = (including.length ? including : moduleLines.slice(0, 4).map((l) => l.omschrijving)).join(', ')

  // Technische blokken selecteren op configuratie, gematcht op de ECHTE keys.
  const selectors = ['SYSTEM SET-UP', 'MAIN FEATURES', 'TOUCH SCREEN CONTROL CONSOLE', 'DIGITALLY CONNECTED SMART COMPONENTS', 'ELECTRICAL MODULE']
  if (hasPlasma) selectors.push('APS GAS MODULE', 'PLASMA POWER SUPPLY')
  if (hasHVOF) selectors.push('HVOF LIQUID / GAS FUEL MODULE')
  if (hasFeeder) selectors.push('FST-10/MC POWDER FEEDER', 'POWDER FEEDER HOPPER STATION')
  selectors.push('JAM BOX MODULE', 'CABLES AND HOSES PACKAGE', 'ELECTRICAL DISTRIBUTION CABINET', 'AIR DISTRIBUTION UNIT', 'SYSTEM SAFETIES', 'INTEGRATION OF AUXILIARY COMPONENTS', 'SYSTEM CALIBRATION', 'SIGNALIZATION STACK LIGHT')

  const blockKeys = Object.keys(blokken)
  const used = new Set<string>()
  const techBlocks: { key: string; heading: string; text: string; num: number }[] = []
  for (const sel of selectors) {
    const ns = normalize(sel)
    // "MP-50 SCOPE OF SUPPLY" overslaan (voorkomt dubbeling met de echte Scope of Supply).
    const key = blockKeys.find((k) => !used.has(k) && !/SCOPE OF SUPPLY/i.test(k) && normalize(k).includes(ns))
    if (key) {
      used.add(key)
      techBlocks.push({ key, heading: cleanHeading(key), text: blokken[key], num: techBlocks.length + 1 })
    }
  }

  // Verdeel de technische blokken over meerdere pagina's op basis van tekstlengte.
  // Eén zeer lange doorlopende <Page> laat de @react-pdf-layout overlopen (NaN); dit voorkomt dat.
  const TECH_BUDGET = 11000
  const techPages: (typeof techBlocks)[] = []
  let cur: typeof techBlocks = []
  let curLen = 0
  for (const b of techBlocks) {
    const len = b.text.length + b.heading.length
    if (cur.length && curLen + len > TECH_BUDGET) { techPages.push(cur); cur = []; curLen = 0 }
    cur.push(b)
    curLen += len
  }
  if (cur.length) techPages.push(cur)

  // Scope: modules per categorie (volgorde behouden).
  const catOrder: string[] = []
  const byCat = new Map<string, QuoteLine[]>()
  for (const l of moduleLines) {
    const cat = l.categorie || 'Overig'
    if (!byCat.has(cat)) { byCat.set(cat, []); catOrder.push(cat) }
    byCat.get(cat)!.push(l)
  }

  const conditions = conditionsRaw.trim()

  return (
    <Document title={`Proposal ${reference}`} author="Flame Spray Technologies">
      {/* 1. Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverLogoZone}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logo} style={styles.coverLogo} />
        </View>
        <View style={styles.coverBand}>
          <Text style={styles.coverKicker}>PROPOSAL</Text>
          <Text style={styles.coverTitle}>{systemName}</Text>
        </View>
        <View style={styles.coverBody}>
          {includingText ? (
            <>
              <Text style={styles.including}>Including</Text>
              <Text style={styles.includingVal}>{includingText}</Text>
            </>
          ) : null}
          <View style={styles.coverBlock}>
            <View style={styles.coverRow}><Text style={styles.coverLabel}>Customer</Text><Text style={styles.coverValue}>{quote.klant || '—'}</Text></View>
            <View style={styles.coverRow}><Text style={styles.coverLabel}>Attention</Text><Text style={styles.coverValue}>—</Text></View>
            <View style={styles.coverRow}><Text style={styles.coverLabel}>FST Reference</Text><Text style={styles.coverValue}>{quote.projectnr || '—'}</Text></View>
            <View style={styles.coverRow}><Text style={styles.coverLabel}>Proposal made by</Text><Text style={styles.coverValue}>{madeBy}</Text></View>
            <View style={styles.coverRow}><Text style={styles.coverLabel}>Date</Text><Text style={styles.coverValue}>{datum}</Text></View>
            <View style={styles.coverRow}><Text style={styles.coverLabel}>Version</Text><Text style={styles.coverValue}>1</Text></View>
          </View>
        </View>
        <Text style={styles.coverFooter}>Flame Spray Technologies   ·   www.fst.nl</Text>
      </Page>

      {/* 3. Document Overview */}
      <Page size="A4" style={styles.page}>
        <Header systemName={systemName} />
        <Footer />
        <Text style={styles.chapter}>Document Overview</Text>
        <Text style={styles.h2}>Revision History</Text>
        <View style={styles.table}>
          <View style={styles.tHead}>
            <Text style={[styles.tCellHead, { width: 70 }]}>Revision</Text>
            <Text style={[styles.tCellHead, { width: 90 }]}>Date</Text>
            <Text style={[styles.tCellHead, { flex: 1 }]}>Description</Text>
          </View>
          <View style={styles.tRow}>
            <Text style={[styles.tCell, { width: 70 }]}>Rev 1</Text>
            <Text style={[styles.tCell, { width: 90 }]}>{datum}</Text>
            <Text style={[styles.tCell, { flex: 1 }]}>Initial quote</Text>
          </View>
        </View>
      </Page>

      {/* 4. Standaard secties */}
      <Page size="A4" style={styles.page}>
        <Header systemName={systemName} />
        <Footer />
        <Text style={styles.chapter}>Company &amp; System Information</Text>
        {STD_ORDER.filter((k) => secties[k]).map((k) => (
          <Section key={k} heading={k} text={secties[k]} />
        ))}
      </Page>

      {/* 5. Scope of Supply */}
      <Page size="A4" style={styles.page}>
        <Header systemName={systemName} />
        <Footer />
        <Text style={styles.chapter}>Scope of Supply</Text>
        {catOrder.map((cat) => (
          <View key={cat} wrap={false}>
            <Text style={styles.catHead}>{cat}</Text>
            {byCat.get(cat)!.map((l) => (
              <View key={l.id} style={styles.lineRow}>
                <Text style={styles.lineDesc}>{l.omschrijving}</Text>
                <Text style={styles.lineQty}>{l.aantal ?? 1} ×</Text>
              </View>
            ))}
          </View>
        ))}
        {laborLines.length > 0 && (
          <View wrap={false}>
            <Text style={styles.catHead}>Engineering, Installation &amp; Training</Text>
            {laborLines.map((l) => (
              <View key={l.id} style={styles.lineRow}>
                <Text style={styles.lineDesc}>{l.omschrijving}</Text>
                <Text style={styles.lineQty}>{l.uren != null ? `${l.uren} h` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* 6. Technical Proposal (over meerdere pagina's) */}
      {techPages.map((groep, gi) => (
        <Page key={gi} size="A4" style={styles.page}>
          <Header systemName={systemName} />
          <Footer />
          <Text style={styles.chapter}>1. Technical Proposal{gi > 0 ? ' (continued)' : ''}</Text>
          {groep.map((b) => (
            <Section key={b.key} heading={`1.${b.num}  ${b.heading}`} text={b.text} />
          ))}
        </Page>
      ))}

      {/* 7. Investment overview + 8. Conditions of Supply */}
      <Page size="A4" style={styles.page}>
        <Header systemName={systemName} />
        <Footer />
        <Text style={styles.chapter}>Investment Overview</Text>
        <Text style={styles.para}>
          The total investment for the system described in this proposal, in the configuration and scope of
          supply set out above, is:
        </Text>
        <View style={styles.investment}>
          <Text style={styles.investLabel}>Total Investment</Text>
          <Text style={styles.investValue}>{eur.format(quote.verkoopprijs ?? 0)}</Text>
          <Text style={styles.investNote}>All prices in EUR, excluding VAT.</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.chapter}>Conditions of Supply</Text>
          {conditions ? (
            <Paras text={conditions} />
          ) : (
            FALLBACK_TERMS.map((t, i) => (
              <View key={i} style={styles.termItem}>
                <Text style={styles.termBullet}>•</Text>
                <Text style={styles.termText}>{t}</Text>
              </View>
            ))
          )}
        </View>
      </Page>

      {/* 9. System Layout / Concept — schetsen paginabreed */}
      {schetsen.map((src, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <Header systemName={systemName} />
          <Footer />
          <Text style={styles.chapter}>System Layout / Concept</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={src} style={styles.sketchImg} />
          <Text style={styles.sketchCaption}>Figure {i + 1} — indicative system layout</Text>
        </Page>
      ))}
    </Document>
  )
}
