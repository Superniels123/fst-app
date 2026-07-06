import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Quote, QuoteLine } from '../types'

const GREEN = '#008C3C'
const GREEN_DARK = '#00662B'
const GRAY = '#4b5563'
const GRAY_LIGHT = '#9ca3af'
const LINE = '#e5e7eb'

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const INTRODUCTION =
  'Thank you for your valued enquiry. Flame Spray Technologies is pleased to provide this quotation and ' +
  'we thank you for your interest in our company and our products. After you have completed your review, ' +
  'upon your request, FST are willing to come to your facility and explain the offer in detail. FST is ' +
  'also willing to think along with you to reach the best possible solution for your application needs. ' +
  'At Flame Spray Technologies we understand that the investment in a thermal spray system is not only a ' +
  'financial investment, but also an investment in people and know-how. Flame Spray Technologies is an ' +
  'ISO 9001:2015 and ISO 14001:2015 approved company.'

const SUPPORT = [
  {
    kop: 'Coating & Application Support',
    tekst:
      'Our coating engineers support you with material selection, parameter development and qualification, ' +
      'so your system delivers repeatable, specification-compliant coatings from day one.',
  },
  {
    kop: 'Service Organization',
    tekst:
      'FST maintains a dedicated service organization for installation, commissioning, training and preventive ' +
      'maintenance — on site at your facility or remotely.',
  },
  {
    kop: 'Spare Parts Availability',
    tekst:
      'A broad range of spare and wear parts is kept in stock for short lead times, keeping your thermal spray ' +
      'operation running with minimal downtime.',
  },
]

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontSize: 10, color: '#1f2937', fontFamily: 'Helvetica', lineHeight: 1.5 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: GREEN },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: GRAY_LIGHT, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6 },

  // Cover
  coverKicker: { fontSize: 11, color: GREEN, fontFamily: 'Helvetica-Bold', letterSpacing: 2 },
  coverTitle: { fontSize: 40, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  coverSystem: { fontSize: 18, color: '#1f2937', marginTop: 6 },
  coverBlock: { marginTop: 40, borderTopWidth: 2, borderTopColor: GREEN, paddingTop: 16 },
  coverRow: { flexDirection: 'row', marginBottom: 6 },
  coverLabel: { width: 130, color: GRAY, fontFamily: 'Helvetica-Bold' },
  coverValue: { flex: 1, color: '#1f2937' },

  // Sections
  h2: { fontSize: 15, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  h3: { fontSize: 11, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', marginBottom: 3, marginTop: 10 },
  para: { color: GRAY, marginBottom: 8, textAlign: 'justify' },

  catHead: { fontSize: 10, color: GREEN_DARK, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  lineRow: { flexDirection: 'row', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: LINE },
  lineDesc: { flex: 1, color: '#1f2937' },
  lineQty: { width: 60, textAlign: 'right', color: GRAY },

  investment: { marginTop: 24, backgroundColor: '#E6F0E6', borderRadius: 4, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  investLabel: { fontSize: 12, color: GREEN_DARK, fontFamily: 'Helvetica-Bold' },
  investValue: { fontSize: 22, color: GREEN_DARK, fontFamily: 'Helvetica-Bold' },
  investNote: { marginTop: 6, fontSize: 8, color: GRAY_LIGHT },

  // Sketch
  sketchImg: { width: '100%', objectFit: 'contain', maxHeight: 620 },
  sketchCaption: { marginTop: 8, fontSize: 9, color: GRAY_LIGHT, textAlign: 'center' },

  termItem: { flexDirection: 'row', marginBottom: 4 },
  termBullet: { width: 12, color: GREEN },
  termText: { flex: 1, color: GRAY },
})

function Footer({ reference }: { reference: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Flame Spray Technologies</Text>
      <Text>{reference}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  )
}

export interface OffertePDFProps {
  quote: Quote
  lines: QuoteLine[]
  madeBy: string
  systemName: string
  schetsen: string[]
  datum: string
}

export default function OffertePDF({ quote, lines, madeBy, systemName, schetsen, datum }: OffertePDFProps) {
  const reference = quote.projectnr || quote.klant || '—'

  // Modules gegroepeerd per categorie (volgorde behouden), arbeid apart.
  const moduleLines = lines.filter((l) => l.soort === 'module')
  const laborLines = lines.filter((l) => l.soort === 'arbeid')
  const catOrder: string[] = []
  const byCat = new Map<string, QuoteLine[]>()
  for (const l of moduleLines) {
    const cat = l.categorie || 'Overig'
    if (!byCat.has(cat)) { byCat.set(cat, []); catOrder.push(cat) }
    byCat.get(cat)!.push(l)
  }

  return (
    <Document title={`Proposal ${reference}`} author="Flame Spray Technologies">
      {/* Cover + Introduction */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <Text style={styles.coverKicker}>PROPOSAL</Text>
        <Text style={styles.coverTitle}>{systemName}</Text>
        <Text style={styles.coverSystem}>Thermal Spray Coating System</Text>

        <View style={styles.coverBlock}>
          <View style={styles.coverRow}><Text style={styles.coverLabel}>Customer</Text><Text style={styles.coverValue}>{quote.klant || '—'}</Text></View>
          <View style={styles.coverRow}><Text style={styles.coverLabel}>FST Reference</Text><Text style={styles.coverValue}>{quote.projectnr || '—'}</Text></View>
          <View style={styles.coverRow}><Text style={styles.coverLabel}>Date</Text><Text style={styles.coverValue}>{datum}</Text></View>
          <View style={styles.coverRow}><Text style={styles.coverLabel}>Version</Text><Text style={styles.coverValue}>1</Text></View>
          <View style={styles.coverRow}><Text style={styles.coverLabel}>Proposal made by</Text><Text style={styles.coverValue}>{madeBy}</Text></View>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.h2}>Introduction</Text>
          <Text style={styles.para}>{INTRODUCTION}</Text>
        </View>

        <Footer reference={reference} />
      </Page>

      {/* About FST / Support + Scope */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <Text style={styles.h2}>About FST &amp; Support</Text>
        {SUPPORT.map((s) => (
          <View key={s.kop}>
            <Text style={styles.h3}>{s.kop}</Text>
            <Text style={styles.para}>{s.tekst}</Text>
          </View>
        ))}

        <View style={{ marginTop: 16 }}>
          <Text style={styles.h2}>Scope of Supply &amp; Price</Text>
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

          <View style={styles.investment}>
            <Text style={styles.investLabel}>Total Investment</Text>
            <Text style={styles.investValue}>{eur.format(quote.verkoopprijs ?? 0)}</Text>
          </View>
          <Text style={styles.investNote}>All prices in EUR, excluding VAT.</Text>
        </View>

        <Footer reference={reference} />
      </Page>

      {/* System Layout / Concept — alleen met schetsen */}
      {schetsen.map((src, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <View style={styles.topBar} fixed />
          <Text style={styles.h2}>System Layout / Concept</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={src} style={styles.sketchImg} />
          <Text style={styles.sketchCaption}>Figure {i + 1} — indicative system layout</Text>
          <Footer reference={reference} />
        </Page>
      ))}

      {/* Terms */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />
        <Text style={styles.h2}>Terms &amp; Conditions</Text>
        {[
          'All prices are in EUR and exclusive of VAT.',
          'This proposal is valid for 30 days from the date stated on the cover.',
          'Delivery time to be confirmed in mutual consultation upon order.',
          'Flame Spray Technologies is an ISO 9001:2015 and ISO 14001:2015 certified company.',
        ].map((t, i) => (
          <View key={i} style={styles.termItem}>
            <Text style={styles.termBullet}>•</Text>
            <Text style={styles.termText}>{t}</Text>
          </View>
        ))}
        <Footer reference={reference} />
      </Page>
    </Document>
  )
}
