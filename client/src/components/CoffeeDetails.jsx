import React from "react";
import { use } from "react";
import { useLoaderData } from "react-router";
import { AuthContext } from "../contexts/AuthContext";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const CoffeeDetails = () => {
  const { user } = use(AuthContext);
  const { data } = useLoaderData();
  // this data always comes first, so there is no need to use useEffect to make sure that the data is available
  const [coffee, setCoffee] = useState(data);
  const {
    name,
    photo,
    details,
    _id,
    email,
    likedBy,
    // supplier,
    // taste,
    // price,
    quantity,
  } = coffee || {};
  const [liked, setLiked] = useState(likedBy.includes(false));
  const [likeCount, setLikeCount] = useState(likedBy.length);

  // if the user takes time to load, we can use the below shown way
  useEffect(() => {
    setLiked(likedBy.includes(user?.email));
  }, [user, likedBy]);

  // handle like/dislike
  const handleLike = () => {
    if (!user?.email === email) return alert("You don't have any shame?!");
    // handle like toggle api fetch call
    axios
      .patch(`${import.meta.env.VITE_API_URL}/like/${_id}`, {
        email: user?.email,
      })
      .then((data) => {
        console.log(data);
        const isLiked = data?.data?.liked;
        setLiked(isLiked);
        setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleOrder = () => {
    if (user?.email === email) return alert("It's your own coffee");
    const orderInfo = {
      coffeeId: _id,
      customerEmail: user?.email,
    };
    // save order ifo in db
    axios
      .post(`${import.meta.env.VITE_API_URL}/place-order/${_id}`, orderInfo)
      .then((data) => {
        console.log(data);
        setCoffee((prev) => {
          return { ...prev, quantity: prev.quantity - 1 };
        });
      });
  };

  return (
    <div>
      <div className="flex justify-around items-center py-12 gap-12 flex-col md:flex-row">
        <div className="flex-1">
          <img src={photo} alt="" className="w-full" />
        </div>
        <div className="flex-1">
          <p>Name: {name}</p>
          <p>Details: {details}</p>
          <p>Quantity: {quantity}</p>
          <p>Likes: {likeCount}</p>

          <div className="flex gap-4 ">
            <button onClick={handleOrder} className="btn btn-primary">
              Order
            </button>
            <button onClick={handleLike} className="btn btn-secondary">
              👍 {liked ? "Liked" : "Like"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeDetails;
