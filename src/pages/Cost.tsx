import CostView from '../components/cost/CostView'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Cost() {
  usePageTitle('Kostnad')
  return <CostView />
}
