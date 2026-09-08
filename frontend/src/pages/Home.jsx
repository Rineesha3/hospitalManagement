import React from "react";
import heroImg01 from "../assets/images/1.jpeg";
import heroImg02 from "../assets/images/2.jpeg";
import heroImg03 from "../assets/images/3.jpeg";
import icon01 from "../assets/images/icon01.png";
import icon02 from "../assets/images/icon02.png";
import icon03 from "../assets/images/icon03.png";
import faqImg from "../assets/images/5.jpeg";
import featureImg from "../assets/images/4.jpeg";
import videoIcon from "../assets/images/video-icon.png";
import avatarIcon from "../assets/images/avatar-icon.png";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import ServiceList from "../components/Services/ServiceList.jsx";
import DoctorList from "../components/Doctors/DoctorList.jsx";
import FaqList from "../components/Faq/FaqList.jsx";
import useFetchData from "../hooks/useFetchData.jsx";
import { BASE_URL } from "../config.js";
//import Testimonial from "../components/Testimonial/Testimonial.jsx";

const formatStat = (n) => {
  if (!n) return "0+";
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  return `${n}+`;
};

const Home = () => {
  const { data: stats } = useFetchData(`${BASE_URL}/stats/public`);
  return (
    <>
      {/* herosection */}
      <>
        <section className="hero__section pt-[60px] 2xl:h-[800px]">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-[90px] items-center justify-between">
              {/*hero content */}
              <div>
                <div className="lg:w-[570px]">
                  <h1 className="text-[36px] leading-[46px] text-headingColor font-[800] md:text-[60px] md:leading-[70px]">
                    Healthcare that reaches you, anywhere.
                  </h1>
                  <p className="text__para">
                    Connect with licensed doctors over secure video, from
                    wherever you are. No waiting rooms, no travel, no
                    borders—just care when you need it.
                  </p>
                  <Link to="/doctors">
                    <button className="btn">Request an Appointment</button>
                  </Link>
                </div>
                {/*hero counter */}
                <div className="mt-[30px] lg:mt-[70px] flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-[30px]">
                  {/* Consultations Completed */}
                  <div>
                    <h2 className="text-[30px] lg:text-[44px] font-[700] text-headingColor">
                      {formatStat(stats?.consultationsCompleted)}
                    </h2>
                    <span className="w-[100px] h-2 bg-yellowColor rounded-full block mt-[-14px]"></span>
                    <p className="text__para">Consultations<br />Completed</p>
                  </div>

                  {/* Patients Served */}
                  <div>
                    <h2 className="text-[30px] lg:text-[44px] font-[700] text-headingColor">
                      {formatStat(stats?.patientsServed)}
                    </h2>
                    <span className="w-[100px] h-2 bg-yellowColor rounded-full block mt-[-14px]"></span>
                    <p className="text__para">Patients<br />Served</p>
                  </div>

                  {/* Licensed Doctors */}
                  <div>
                    <h2 className="text-[30px] lg:text-[44px] font-[700] text-headingColor">
                      {formatStat(stats?.licensedDoctors)}
                    </h2>
                    <span className="w-[100px] h-2 bg-yellowColor rounded-full block mt-[-14px]"></span>
                    <p className="text__para">Licensed<br />Doctors</p>
                  </div>
                </div>
              </div>
              {/*hero content */}
              <div className="w-full flex flex-col sm:flex-row gap-6 sm:gap-[30px] justify-center lg:justify-end">
                <div className="w-full sm:w-auto">
                  <img className="w-full aspect-[370/524] object-cover" src={heroImg01} alt="" />
                </div>
                <div className="w-full sm:w-auto mt-0 sm:mt-[30px]">
                  <img src={heroImg02} alt="" className="w-full aspect-square object-cover mb-[30px]" />
                  <img src={heroImg03} alt="" className="w-full aspect-square object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
      {/*hero section end */}
      <section>
        <div className="container">
          <div className="lg:w-[470px] mx-auto">
            <h2 className="heading text-center">
              Providing the best medical services
            </h2>
            <p className="text__para text-center">
              World-class care for everyone. Our Health System offers
              unmatched,expert health care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-[30px] mt-[30px] lg:mt-[55px]">
            <div className="py-6 px-4 sm:py-[30px] sm:px-5">
              <div className="flex items-center justify-center">
                <img src={icon01} alt="" />
              </div>
              <div className="mt-[30px]">
                <h2 className="text-[20px] leading-7 sm:text-[26px] sm:leading-9 text-headingColor font-[700] text-center">
                  Find a Doctor
                </h2>
                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                  World-class care for everyone. Our Health System offers
                  unmatched expert health care. From the lab to the clinic.
                </p>
                <Link
                  to="/doctors"
                  className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none"
                >
                  <BsArrowRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>
            <div className="py-6 px-4 sm:py-[30px] sm:px-5">
              <div className="flex items-center justify-center">
                <img src={icon02} alt="" />
              </div>
              <div className="mt-[30px]">
                <h2 className="text-[20px] leading-7 sm:text-[26px] sm:leading-9 text-headingColor font-[700] text-center">
                  Available Anywhere
                </h2>
                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                  No local clinic required. Connect with a doctor over video
                  from your phone, tablet, or computer, wherever you are.
                </p>
                <Link
                  to="/doctors"
                  className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none"
                >
                  <BsArrowRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>
            <div className="py-6 px-4 sm:py-[30px] sm:px-5">
              <div className="flex items-center justify-center">
                <img src={icon03} alt="" />
              </div>
              <div className="mt-[30px]">
                <h2 className="text-[20px] leading-7 sm:text-[26px] sm:leading-9 text-headingColor font-[700] text-center">
                  Book Appointment
                </h2>
                <p className="text-[16px] leading-7 text-textColor font-[400] mt-4 text-center">
                  World-class care for everyone. Our Health System offers
                  unmatched expert health care. From the lab to the clinic.
                </p>
                <Link
                  to="/doctors"
                  className="w-[44px] h-[44px] rounded-full border border-solid border-[#181A1E] mt-[30px] mx-auto flex items-center justify-center group hover:bg-primaryColor hover:border-none"
                >
                  <BsArrowRight className="group-hover:text-white w-6 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*services section */}
      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
            <h2 className="heading text-center">Our Medical Services</h2>
            <p className="text__para text-center">
              World-class care for everyone. Our health system offers
              unmatched,expert health care.
            </p>
          </div>
          <ServiceList />
        </div>
      </section>
      {/*services section end */}

      {/*feature section */}
      <section>
        <div className="container">
          <div className="flex items-center justify-between flex-col lg:flex-row">
            {/*feature content */}
            <div className="xl:w-[670px]">
              <h2 className="heading">
                Get virtual treatment <br /> anytime.
              </h2>
              <ul className="pl-4">
                <li className="text__para">
                  1. Schedule the appointment directly.
                </li>
                <li className="text__para">
                  2. Browse available doctors and pick one that fits your needs.
                </li>
                <li className="text__para">
                  3. Choose an open time slot and join your video consultation
                  from anywhere.
                </li>
              </ul>
              <Link to="/">
                <button className="btn">Learn more</button>
              </Link>
            </div>
            {/*feature img */}
            <div className="relative z-[10] xl:w-[770px] flex justify-end mt-[50px] lg:mt-0">
              <img src={featureImg} className="w-3/4" alt="" />
              <div className="w-[150px] lg:w-[248px] bg-white absolute bottom-[50px] left-0 md:bottom-[100px] md:left-5 z-20 p-2 pb-3 lg:pt-4 lg:px-4 lg:pb-[26px] rounded-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[6px] lg:gap-3">
                    <p className="text-[10px] leading-[10px] lg:text-[14px] lg:leading-5 text-headingColor font-[400]">
                      Tue, 24
                    </p>
                    <p className="text-[10px] leading-[10px] lg:text-[14px] lg:leading-5 text-headingColor font-[400]">
                      10:00AM
                    </p>
                    <span className="w-5 h-5 lg:w-[34px] lg:h-[34px] flex items-center justify-center bg-yellowColor rounded py-1 px-[6px] lg:py-3 lg:px-[9px]">
                      <img src={videoIcon} alt=""></img>
                    </span>
                  </div>
                </div>

                <div className="w-[65px] lg:w-[96px] bg-[#CCF0F3] py-1 px-2 lg:py-[6px] lg:px-[10px] text-[8px] leading-[8px] lg:text-[12px] lg:leading-4 text-irisBlueColor font-[500] mt-2 lg:mt-4 rounded-full">
                  Consultation
                </div>

                <div className="flex items-center gap-[6px] lg:gap-[10px] mt-2 lg:mt-[18px]">
                  <img src={avatarIcon} alt="" />
                  <h4 className="text-[10px] leading-3 lg:text-[16px] lg:leading-[22px] font-[700] text-headingColor">
                    Wayne Collins
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*feature section end */}
      {/*doctors */}
      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
            <h2 className="heading text-center">Our Great Doctors</h2>
            <p className="text__para text-center">
              World-class care for everyone. Our health system offers
              unmatched,expert health care.
            </p>
          </div>
          <DoctorList />
        </div>
      </section>
      {/*doctors */}
      {/*faq section */}
      <section>
        <div className="container">
          <div className="flex justify-between gap-[50px] lg:gap-0">
            <div className="w-1/2 hidden md:block">
              <img src={faqImg} alt="" />
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="heading">Most questions by our patients</h2>
              <FaqList />
            </div>
          </div>
        </div>
      </section>
      {/*faq section end */}
      {/* testimonial section
      <section>
        <div className="container">
          <div className="xl:w-[470px] mx-auto">
              <h2 className="heading text-center">What our patients say</h2>
              <p className="text__para text-center">
                World-class care for everyone. Our health system offers
                unmatched,expert health care.
              </p>
          </div>
          <Testimonial/>
        </div>
      </section> */}
    </>
  );
};

export default Home;
