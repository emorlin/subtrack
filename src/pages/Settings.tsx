import SettingsView from '../components/settings/SettingsView'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Settings() {
  usePageTitle('Inställningar')
  return <SettingsView />
}
