import Login from './Login'
import {  createBrowserRouter,RouterProvider } from 'react-router-dom'
import Payment from './Payment'
import Protected from './Protected'
import CreateProduct from './CreateProduct'
import AdminDashboard from './AdminDasboard'
import Success from './Success'

const Body = () => {
    const appRouter = createBrowserRouter([
        {
            path:'/',
            element:<Login/>,
        },
        {
            path: '/login',
            element: <Login />, // 👈 Add this route
        },
        
        {
            path:'/protected',
            element:<Protected/>,
        },
        {
            path:'/createProduct',
            element:<CreateProduct/>
        },
        {
            path:'/admindashboard',
            element:<AdminDashboard/>
        },
        {
            path : "/payment", 
            element : <Payment/>
        },
        {
            path:"/success",
            element:<Success/>,
        },
        
    ])
  return (
    <div className='bg-white-950'>
        <RouterProvider router={appRouter}/>
    </div>
  )
}

export default Body
