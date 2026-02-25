'use client'
import HomeProducts from './(components)/HomeProducts/page'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [stocam, setStocam] = useState({})
  useEffect(() => {
    axios
      .get('http://localhost:5054/test')
      .then((res) => {
        console.log('Backend /test response:', res.data)
        setStocam(res.data)
      })
      .catch((err) => {
        console.error('Backend /test error:', err)
      })
  }, [])

  useEffect(() => {
    console.log('Aici este stocam:', stocam)
  }, [stocam])

  return (
    <div>
      <HomeProducts />
    </div>
  )
}
