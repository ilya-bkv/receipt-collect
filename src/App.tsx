import reactLogo from './assets/react.svg'
import './App.css'

function App() {

  Telegram.WebApp.ready()
  return (
    <>
      <div>


        <img src={reactLogo} className="logo react" alt="React logo"/>

      </div>
      <h1>
        Hello {Telegram.WebApp.initDataUnsafe.user?.username}</h1>

      <p className="read-the-docs">
        ....
      </p>
    </>
  )
}

export default App
