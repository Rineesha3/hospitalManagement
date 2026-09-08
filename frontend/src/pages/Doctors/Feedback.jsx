import React, { useContext, useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { AiFillStar } from "react-icons/ai";
import FeedbackForm from "./FeedbackForm.jsx";
import { BASE_URL } from "../../config";
import { authContext } from "../../context/authContext";
import Avatar from "../../components/Avatar/Avatar";

const Feedback = ({ doctorId, reviews, totalRating }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const { token, role } = useContext(authContext);

  useEffect(() => {
    if (!token || role !== "patient" || !doctorId) return;
    fetch(`${BASE_URL}/bookings/reviewable/${doctorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => setReviewableBookings(result.data || []))
      .catch(() => setReviewableBookings([]));
  }, [token, role, doctorId]);

  const handleReviewed = () => {
    setShowFeedbackForm(false);
    setReviewableBookings((prev) => prev.slice(1));
  };

  return (
    <div>
      <div className="mb-[50px]">
        <h4 className="text-[20px] leading-[30px] font-bold text-headingColor mb-[30px]">
          All reviews({totalRating})
        </h4>
        {reviews?.map((review, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-10 mb-[30px]">
            <div className="flex gap-3">
              <figure className="w-10 h-10 rounded-full shrink-0">
                <Avatar src={review?.user?.photo} className="w-full h-full rounded-full" />
              </figure>
              <div className="min-w-0">
                <h5 className="text-[16px] leading-6 text-primaryColor font-bold">
                  {review?.user?.name}
                </h5>
                <p className="text-[14px] leading-6 text-textColor">
                  {formatDate(review?.createdAt)}
                </p>
                <p className="text__para mt-3 font-medium text-[15px]">
                  {review.reviewText}
                </p>
              </div>
            </div>

            <div className="flex gap-1 sm:shrink-0">
              {[...Array(review?.rating).keys()].map((_, index) => (
                <AiFillStar key={index} color="#0067FF" />
              ))}
            </div>
          </div>
        ))}
      </div>
      {reviewableBookings.length > 0 && !showFeedbackForm && (
        <div className="text-center">
          <button className="btn" onClick={() => setShowFeedbackForm(true)}>
            Give Feedback
          </button>
        </div>
      )}
      {showFeedbackForm && reviewableBookings[0] && (
        <FeedbackForm
          doctorId={doctorId}
          bookingId={reviewableBookings[0]._id}
          onSuccess={handleReviewed}
        />
      )}
    </div>
  );
};

export default Feedback;
