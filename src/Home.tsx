import { Routes, Route } from 'react-router-dom'
import StartComponent from './components/StartComponent'
import AddSingersComponent from './components/AddSingersComponent'
import './app.scss'

require('dotenv').config()

const Home = () => {
  
  var tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  var firstScriptTag = document.getElementsByTagName('script')[0]
  if(firstScriptTag !== null && firstScriptTag.parentNode !== null){
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
  }

  return (
    <div className='main'>
      <Routes>
        <Route path='/' element={
          <StartComponent />
        } />
        <Route path='/add-singers' element={
          <AddSingersComponent />
        } />
      </Routes>
    </div>
  )
}

export default Home