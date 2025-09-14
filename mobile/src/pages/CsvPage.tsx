import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonProgressBar } from '@ionic/react'
import { useRef, useState } from 'react'
import { useToast } from '../providers/ToastProvider'
import { getApiConfig } from '../lib/settings'
import { useStore } from '../providers/StoreProvider'
import { csvUpload, csvStatus, downloadErrorsCsv, type CsvUploadValidateResponse, type CsvStatusResponse } from '../lib/csvApi'
import { useSettingsGate } from '../hooks/useSettingsGate'

const MAX_FILE_BYTES = 20 * 1024 * 1024

const CsvPage = () => {
  const { showToast } = useToast()
  const { storeId } = useStore()
  useSettingsGate()
  const [file, setFile] = useState<File | null>(null)
  const [uploadInfo, setUploadInfo] = useState<CsvUploadValidateResponse | null>(null)
  const [status, setStatus] = useState<CsvStatusResponse | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const pollRef = useRef<number | null>(null)

  const onFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      showToast({ message: 'Only .csv files are supported', color: 'warning' })
      return
    }
    if (f.size > MAX_FILE_BYTES) {
      showToast({ message: 'File too large (max 20MB)', color: 'warning' })
      return
    }
    setFile(f)
    setUploadInfo(null)
    setStatus(null)
  }

  const doValidate = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const cfg = await getApiConfig()
      const res = await csvUpload(cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, file, storeId || cfg?.defaultStoreId || 'default', 'validate')
      setUploadInfo(res as CsvUploadValidateResponse)
      showToast({ message: 'Upload received', color: 'success' })
    } catch (e: any) {
      showToast({ message: e?.message || 'Upload failed', color: 'danger' })
    } finally {
      setIsUploading(false)
    }
  }

  const startApply = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const cfg = await getApiConfig()
      await csvUpload(cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, file, storeId || cfg?.defaultStoreId || 'default', 'apply')
      showToast({ message: 'Queued. Processing…', color: 'success' })
      // start polling
      if (pollRef.current) window.clearInterval(pollRef.current)
      const id = window.setInterval(async () => {
        try {
          const s = await csvStatus(cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, 'ul_mock')
          setStatus(s)
          if (s.status === 'completed' || s.status === 'failed' || s.status === 'partial') {
            window.clearInterval(id)
            pollRef.current = null
            showToast({ message: 'Processing completed', color: 'success' })
          }
        } catch (e: any) {
          window.clearInterval(id)
          pollRef.current = null
          showToast({ message: e?.message || 'Status error', color: 'danger' })
        }
      }, 2000)
      pollRef.current = id
    } catch (e: any) {
      showToast({ message: e?.message || 'Apply failed', color: 'danger' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>CSV Upload</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
            }}
          />
          {file && (
            <div className="text-sm text-gray-700">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
          <div className="flex gap-2">
            <IonButton onClick={doValidate} disabled={!file || isUploading}>
              {isUploading ? 'Uploading…' : 'Upload (Validate)'}
            </IonButton>
            <IonButton fill="outline" onClick={startApply} disabled={!file || isUploading}>
              Apply
            </IonButton>
          </div>
          {uploadInfo && (
            <div className="rounded border p-3 text-sm">
              <div className="font-medium">Validation Results</div>
              <div>Total: {uploadInfo.stats.rowsTotal}</div>
              <div>Parsable: {uploadInfo.stats.rowsParsable}</div>
              <div>Invalid: {uploadInfo.stats.rowsInvalid}</div>
              {uploadInfo.errorsCsvUrl && (
                <IonButton size="small" className="mt-2" onClick={() => downloadErrorsCsv(uploadInfo.errorsCsvUrl!)}>
                  Download errors CSV
                </IonButton>
              )}
            </div>
          )}
          {status && (
            <div className="rounded border p-3 text-sm">
              <div className="mb-2 font-medium">Processing Status</div>
              <IonProgressBar value={status.progress} />
              {status.results && (
                <div className="mt-2 flex gap-4">
                  <div>Applied: {status.results.applied}</div>
                  <div>Skipped: {status.results.skipped}</div>
                  <div>Failed: {status.results.failed}</div>
                </div>
              )}
              {status.errorsCsvUrl && (
                <IonButton size="small" className="mt-2" onClick={() => downloadErrorsCsv(status.errorsCsvUrl!)}>
                  Download errors CSV
                </IonButton>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default CsvPage


