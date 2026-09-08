import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Routers from "../routes/Routers";
import ScrollToTop from "../routes/ScrollToTop";
const Layout = () => {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routers />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
