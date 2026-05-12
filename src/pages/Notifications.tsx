import NotificationList from '../components/notifications/NotificationList'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Notifications() {
  usePageTitle('Notiser')
  return <NotificationList />
}
