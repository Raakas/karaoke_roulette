import { useSelector } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import MessageComponent from './components/MessageComponent'
import Home from './Home'
import { RootState } from './store/store'

const App = () => {
  const state = useSelector((state: RootState) => state.data)
  const openMessageModal = (): boolean => !!state.message.title
  
  return (
    <Router>
      <Home />
      {openMessageModal() ? <MessageComponent /> : null}
    </Router>
  )
}

export default App