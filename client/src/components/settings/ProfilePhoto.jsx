import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";


function ProfilePhoto() {


  const fileInputRef = useRef(null);



  const [image, setImage] = useState(
    localStorage.getItem("skillup_profile_photo")
  );


  const [error, setError] = useState("");




  const handleImageChange = (e) => {


    const file = e.target.files[0];


    if (!file) return;



    if (file.size > 5 * 1024 * 1024) {

      setError("Image size must be less than 5MB");

      return;

    }



    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg"
    ];



    if (!allowedTypes.includes(file.type)) {

      setError("Only JPG and PNG images are allowed");

      return;

    }



    setError("");



    const reader = new FileReader();



    reader.onload = (event) => {


      const img = new Image();


      img.src = event.target.result;



      img.onload = () => {


        const canvas =
          document.createElement("canvas");


        const ctx =
          canvas.getContext("2d");



        const width = 400;


        const height =
          (img.height * width) / img.width;



        canvas.width = width;

        canvas.height = height;



        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );



        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.7
          );



        localStorage.setItem(
          "skillup_profile_photo",
          compressedImage
        );



        setImage(compressedImage);



      };


    };



    reader.readAsDataURL(file);


  };





  const handleRemove = () => {


    localStorage.removeItem(
      "skillup_profile_photo"
    );


    setImage(null);


  };





  return (

    <div className="rounded-2xl border border-[#26262F] bg-[#111116] p-6">


      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">



        {/* Profile Image */}


        <div className="relative mx-auto lg:mx-0">


          <img

            src={
              image ||
              "https://placehold.co/200x200/15151B/E76F51?text=KN"
            }

            alt="Profile"

            className="h-36 w-36 rounded-full border-4 border-[#E76F51] object-cover"

          />



          <button

            type="button"

            onClick={() =>
              fileInputRef.current.click()
            }

            className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#E76F51] hover:bg-[#d65f43]"

          >

            <Camera size={18}/>

          </button>


        </div>





        {/* Content */}



        <div className="flex-1">


          <h3 className="text-2xl font-semibold">

            Profile Photo

          </h3>



          <p className="mt-2 text-gray-400">

            Upload JPG or PNG image. Maximum size 5MB.

          </p>



          {
            error && (

              <p className="mt-3 text-sm text-red-400">

                {error}

              </p>

            )
          }




          <div className="mt-6 flex gap-4">


            <button

              type="button"

              onClick={() =>
                fileInputRef.current.click()
              }

              className="rounded-xl bg-[#E76F51] px-5 py-3 font-medium hover:bg-[#d65f43]"

            >

              Upload Photo

            </button>





            <button

              type="button"

              onClick={handleRemove}

              className="flex items-center gap-2 rounded-xl border border-[#26262F] px-5 py-3 hover:border-[#E76F51]"

            >

              <Trash2 size={18}/>

              Remove

            </button>


          </div>


        </div>


      </div>





      <input

        ref={fileInputRef}

        type="file"

        accept="image/png,image/jpeg,image/jpg"

        className="hidden"

        onChange={handleImageChange}

      />


    </div>

  );

}


export default ProfilePhoto;