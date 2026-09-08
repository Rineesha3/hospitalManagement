import { useEffect, useRef, useContext } from "react";
import logo from "../../assets/images/logo.png";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { authContext } from "../../context/authContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import Avatar from "../Avatar/Avatar.jsx";
const navLinks = [
  {
    path: "/home",
    display: "Home",
  },
  {
    path: "/doctors",
    display: "Find a Doctor",
  },
  {
    path: "/services",
    display: "Services",
  },
  {
    path: "/contact",
    display: "Contact",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, role, token, dispatch } = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        document.body.scrollTop > 80 ||
        document.documentElement.scrollTop > 80
      ) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu");

  return (
    <header className="header relative flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/*logo */}
          <div>
            <img src={logo} alt="" className="h-8 sm:h-10 w-auto" />
          </div>
          {/*menu */}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className="menu flex items-center gap-4 md:gap-[2.7rem]">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={(navClass) =>
                      navClass.isActive
                        ? "text-primaryColor text-[16px] leading-7 font-[600]"
                        : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                    }
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          {/*nav right */}
          <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-4">
            {token && user && <NotificationBell />}
            {token && user ? (
              <Link
                to={`${
                  role === "doctor"
                    ? "/doctors/profile/me"
                    : role === "admin"
                    ? "/admin/dashboard"
                    : "/users/profile/me"
                }`}
                className="flex items-center gap-3"
              >
                <Avatar src={user?.photo} className="w-9 h-9 rounded-full border border-gray-300" />
                <span className="text-sm font-medium text-black hidden md:inline-block">
                  {user?.name}
                </span>
              </Link>
            ) : null}
            {token && user && (
              <button
                onClick={handleLogout}
                className="text-[13px] font-semibold text-textColor hover:text-primaryColor"
              >
                Logout
              </button>
            )}
            {!(token && user) && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login">
                  <button className="border border-solid border-primaryColor bg-primaryColor px-3 sm:px-6 py-1 text-white text-[14px] sm:text-[16px] font-[600] h-[44px] leading-[44px] flex items-center justify-center rounded-full hover:bg-transparent hover:text-primaryColor transition-all">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="border border-solid border-primaryColor px-3 sm:px-6 py-1 text-primaryColor text-[14px] sm:text-[16px] font-[600] h-[44px] leading-[44px] flex items-center justify-center rounded-full hover:bg-primaryColor hover:text-white transition-all">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
