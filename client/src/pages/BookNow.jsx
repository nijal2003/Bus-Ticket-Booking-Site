import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import { Row, Col, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import SeatSelection from "../components/SeatSelection";
import { Helmet } from "react-helmet";
import moment from "moment";

function BookNow() {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const [bus, setBus] = useState(null);

  const getBus = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.get(`/api/buses/${params.id}`);
      dispatch(HideLoading());
      if (response.data.success) {
        setBus(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch, params.id]);

  // In BookNow.js

const BookNow = async () => {
  try {
    // Check if any of the selected seats are already booked
    // const response = await axiosInstance.post(
    //   `/api/bookings/check-seat-availability/${params.id}`,
    //   { seats: selectedSeats }
    // );
    // if (response.data.seatAlreadyBooked) {
    //   return message.error("One or more selected seats are already booked");
    // }

    // Proceed with the booking request if none of the selected seats are already booked
    dispatch(ShowLoading());
    const bookingResponse = await axiosInstance.post(
      `/api/bookings/book-seat/${localStorage.getItem("user_id")}`,///////////////////
      { busId: params.id, seats: selectedSeats }
    );
    dispatch(HideLoading());
    if (bookingResponse.data.success) {
      message.success(bookingResponse.data.message);
      navigate("/bookings");
    } else {
      message.success(bookingResponse.data.message);
    }
  } catch (error) {
    dispatch(HideLoading());
    message.error(error.message);
  }
};


  useEffect(() => {
    getBus();
  }, [getBus]);

  return (
    <>
      <Helmet>
        <title>Book Now</title>
      </Helmet>
      <div>
        {bus && (
          <Row className="m-3 p-5" gutter={[30, 30]}>
            <Col lg={12} xs={24} sm={24}>
              <h1 className="font-extrabold text-2xl text-blue-500">
                {bus.name}
              </h1>
              <h1 className="text-2xl font-bold">
                {bus.from} - {bus.to}
              </h1>
              <hr className="border-black" />

              <div className="flex flex-col gap-1 ">
                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Journey Date : </b>
                  <span className="">{bus.journeyDate}</span>
                </h1>

                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Price :</b> ₹ {bus.price}{" "}
                  /-
                </h1>
                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Departure Time</b> :{" "}
                  {moment(bus.departure, "HH:mm").format("hh:mm A")}
                </h1>
                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Arrival Time</b> :{" "}
                  {moment(bus.arrival, "HH:mm").format("hh:mm A")}
                </h1>
              </div>
              <hr className="border-black" />

              <div className="flex w-60 flex-col ">
                <h1 className="text-lg mt-2 font-bold">
                  <span className="text-blue-600 italic">Capacity : </span>{" "}
                  <p>{bus.capacity}</p>
                </h1>
                <h1 className="text-lg font-bold">
                  <span className="text-blue-600 italic">Seats Left : </span>{" "}
                  <p>{bus.capacity - bus.seatsBooked.length}</p>
                </h1>
              </div>
              <hr className="border-black" />

              <div className="flex flex-col gap-2 w-48 ">
                <h1 className="text-xl">
                  <b className="text-blue-600 italic">Selected Seats : </b>{" "}
                  {selectedSeats.join(", ")}
                </h1>
                <h1 className="text-xl mt-2 mb-3">
                  <b className="text-blue-600 italic"> Price :</b> ₹{" "}
                  {bus.price * selectedSeats.length}
                </h1>

                <button
                  className={`${
                    selectedSeats.length === 0
                      ? "animate-none cursor-not-allowed btn btn-primary py-2 px-5 rounded-full btn-disabled text-white"
                      : "animate-bounce btn btn-primary py-2 px-5 rounded-full bg-blue-600 hover:bg-blue-800 hover:duration-300 text-white"
                  }`}
                  onClick={BookNow} // Call bookNow function directly
                  disabled={selectedSeats.length === 0}
                >
                  Pay Now
                </button>
              </div>
            </Col>
            <Col lg={12} xs={24} sm={24}>
              <SeatSelection
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
                bus={bus}
              />
            </Col>
          </Row>
        )}
      </div>
    </>
  );
}

export default BookNow;
