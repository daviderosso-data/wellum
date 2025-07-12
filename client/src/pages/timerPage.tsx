import Timer from '../components/Timer'
import Sidebar from '../components/Sidebar'

const TimerPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">   
            <div className="fixed top-0 left-0 h-screen w-64 z-10">

        <Sidebar />
</div>
      <Timer />
    </div>
  )
}

export default TimerPage