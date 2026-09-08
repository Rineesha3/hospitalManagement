
const Error = ({errMessage}) => {
  return (
    <div className="flex items-center justify-center w-full h-full px-4 text-center">
        <h3 className="text-headingColor text-[16px] sm:text-[20px] leading-[26px] sm:leading-[30px] font-semibold">
            {errMessage}
        </h3>
    </div>
  )
}

export default Error
