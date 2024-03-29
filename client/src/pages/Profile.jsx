import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOUtUserFailure,
  signOUtUserStart,
  signOUtUserSuccess,
  updateUserFailure,
  updateUserStart,
  updateUserSuccess,
} from "../redux/user/userSlice";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Link } from "react-router-dom";

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  // console.log(file)
  // console.log(filePerc)
  // console.log(formData)

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);
  const handleFileUpload = (file) => {
    const storage = getStorage(app);

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_change",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("upload is " + progress + "% done");
        setFilePerc(Math.round(progress));
      },

      (error) => {
        setFileUploadError(true);
      },

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const confirmDeleteUser = () => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete your account?",
      buttons: [
        {
          label: "Yes",
          onClick: handleDeleteUser,
        },
        {
          label: "No",
          onClick: () => {}, // Do nothing if the user clicks "No"
        },
      ],
    });
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOUtUserStart());
      const res = await fetch("api/auth/signout");
      const data = await res.json();
      if (data.success == false) {
        dispatch(signOUtUserFailure(data.message));
        return;
      }

      dispatch(signOUtUserSuccess(data));
    } catch (error) {
      dispatch(signOUtUserFailure(data.message));
    }
  };

  const hanldeShowListing = async (e) => {
    try {
      setShowListingError(false);
      setIsLoading(true);
      const res = await fetch(`api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingError(true);
        setIsLoading(false);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingError(true);
    } finally {
      setIsLoading(false);
    }
  };
  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>

      <form action="" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center m-2"
        />

        <p className="text-sm self-center">
          {fileUploadError ? (
            <span>Error Image Upload (image must be less than 2mb)</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc == 100 ? (
            <span className="text-green-700">Image Successfully uploaded!</span>
          ) : (
            ""
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <div className="flex items-center gap-2">
          <button
            disabled={loading}
            className="border-[2px] border-slate-700 text-black rounded-lg p-3 uppercase hover:bg-slate-400 transition-colors duration-500 disabled:opacity-80 flex-1"
          >
            {loading ? "Loading..." : "Update"}
          </button>
          <Link
            className="border-[2px] border-slate-700 text-black rounded-lg p-3 uppercase hover:bg-slate-400 transition-colors duration-500 disabled:opacity-80 flex-1 text-center"
            to={"/create-listing"}
          >
            Create Listing
          </Link>
        </div>
      </form>
      <div className="flex items-center gap-2 mt-5">
        <button
          className=" flex-1 border-[2px] border-slate-700 p-3 text-black rounded-lg cursor-pointer text-center uppercase hover:bg-slate-400 transition-colors duration-500 disabled:opacity-80"
          onClick={confirmDeleteUser}
        >
          Delete account
        </button>
        <button
          className="flex-1 border-[2px] border-slate-700 p-3 text-black rounded-lg cursor-pointer text-center uppercase hover:bg-slate-400 transition-colors duration-500 disabled:opacity-80 "
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      {/* <p className='text-red-700 mt-5'>{error ? error : ''}</p> */}
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully!" : ""}
      </p>
      <button
        onClick={hanldeShowListing}
        className="border-[2px] border-slate-700 w-full text-black p-3 
        rounded-lg uppercase hover:bg-slate-400 transition-colors duration-500"
      >
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error Show Listings" : ""}
      </p>
      {isLoading && (
        <p className="text-green-700 text-center font-semibold">Loading...</p>
      )}
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-3xl font-semibold">
            Your Lisitngs
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain rounded-lg"
                />
              </Link>
              <Link
                to={`/listings/${listing._id}`}
                className=" text-slate-700 font-semibold hover:underline truncate flex-1 "
              >
                <p className="">{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-white
                 uppercase bg-red-700 p-2 rounded-lg w-full hover:opacity-95"
                >
                  Delete
                </button>

                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-white uppercase bg-green-700 p-2 rounded-lg w-full hover:opacity-95">
                    Edit
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
