import { Link } from "react-router-dom";

const NotFound = () => (
  <section className="container flex flex-col items-center justify-center px-5 py-16 sm:py-[100px] text-center">
    <h1 className="text-[40px] sm:text-[60px] font-[800] text-headingColor">404</h1>
    <p className="text__para mb-6">This page doesn't exist.</p>
    <Link to="/">
      <button className="btn">Go Home</button>
    </Link>
  </section>
);

export default NotFound;
