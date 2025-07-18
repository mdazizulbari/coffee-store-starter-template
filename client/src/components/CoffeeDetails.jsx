import React from "react";
import { use } from "react";
import { useLoaderData } from "react-router";
import { AuthContext } from "../contexts/AuthContext";
import { useState } from "react";

const CoffeeDetails = () => {
  const { user } = use(AuthContext);
  const { data: coffee } = useLoaderData();
  const {
    name,
    photo,
    supplier,
    details,
    taste,
    price,
    quantity,
    _id,
    email,
    likedBy,
  } = coffee || {};

  const [liked, setLiked] = useState(likedBy.includes(user?.email));
  const [likeCount, setLikeCount] = useState(likedBy.length);
  // handle like/dislike
  const handleLike = () => {
    if (!user?.email === email) return alert("You don't have any shame?!");
    if (!user?.email) {
      alert("Please login to like this coffee.");
      return;
    }

    if (liked) {
      // If already liked, remove the user from likedBy
      setLikeCount(likeCount - 1);
      setLiked(false);
      // Here you would also update the backend to remove the user from likedBy
    } else {
      // If not liked, add the user to likedBy
      setLikeCount(likeCount + 1);
      setLiked(true);
      // Here you would also update the backend to add the user to likedBy
    }
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
          <p>Likes: {likeCount}</p>

          <div className="flex gap-4 ">
            <button className="btn btn-primary">Order</button>
            <button onClick={handleLike} className="btn btn-secondary">
              Like
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeDetails;
