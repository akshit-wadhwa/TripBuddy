import React from 'react'
import FrontPage from '../components/FrontPage'
import Header from '../components/Navbar'
import Works from '../components/Works'
import Footer from '../components/Footer'
import WhyChooseUs from '../components/WhyChooseUs'

function Dashboard() {
  return (
    <>
    <Header />
    <FrontPage />
    <Works />
    <WhyChooseUs />
    <Footer />
    </>
  )
}

export default Dashboard