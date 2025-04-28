import React from 'react'

const Header = () => {
  return (
    <div className='flex items-center justify-between px-8 py-4 bg-white text-black border-b-gray-200 border-b-2 w-full'>
        <div className='flex items-center space-x-2'>
            <img src="/logo.png" alt="Logo" className='h-8 w-8' />
            <h1 className='text-xl font-semibold'>AI Mock Interview</h1>
        </div>
        <nav className='space-x-4'>
            <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 text-sm'>
                Signup
            </button>
            <button className='bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition duration-200 text-sm'>
                Login
            </button>
        </nav>
    </div>
  )
}

export default Header