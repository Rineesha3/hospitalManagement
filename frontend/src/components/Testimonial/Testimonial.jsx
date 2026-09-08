import {Swiper, SwiperSlide} from 'swiper/react'
import {Pagination} from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import patientAvatar from '../../assets/images/patient-avatar.png'
import {HiStar} from 'react-icons/hi'
const Testimonial = () => {
  return (
    <div className='mt-[30px] lg:mt-[55px]'>
      <Swiper modules={{Pagination}} spaceBetween={30} slidesPerView={1} pagination={{clickable: true}} breakpoints={{
        640: {
          slidesPerView: 1,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      }}>
        <SwiperSlide>
            <div className='py-5 px-4 sm:py-[30px] sm:px-5 rounded-3'>
                <div className='flex items-center gap-3 sm:gap-[13px]'>
                    <img src={patientAvatar} alt="" className='w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0'/>
                    <div><h4 className='text-[16px] sm:text-[18px] leading-[26px] sm:leading-[30px] font-semibold text-headingColor'>xyz</h4></div>
                </div>
            </div>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}

export default Testimonial
