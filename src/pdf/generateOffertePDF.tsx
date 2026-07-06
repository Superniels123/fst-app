import { pdf } from '@react-pdf/renderer'
import OffertePDF, { type OffertePDFProps } from './OffertePDF'

// Aparte module zodat @react-pdf/renderer via dynamische import buiten het
// hoofd-bundle blijft; pas geladen wanneer de gebruiker een PDF genereert.
export async function generateOffertePDFBlob(props: OffertePDFProps): Promise<Blob> {
  return pdf(<OffertePDF {...props} />).toBlob()
}
