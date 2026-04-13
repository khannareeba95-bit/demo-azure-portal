import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lucide from "../base-components/lucide";
import Description from "./components/Description";
import Tagline from "./components/Tagline";
import Tags from "./components/Tags";

const Main = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [oneWordTags, setOneWordTags] = useState([]);
  const [twoWordTags, setTwoWordTags] = useState([]);
  const [threeWordTags, setThreeWordTags] = useState([]);
  const [description, setDescription] = useState("");
  const [tagLines, setTagLines] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    window.localStorage.setItem("currentPage", window.location.pathname);
    inputRef.current.focus();
  }, []);

  async function handleGenerateQuery() {
    setLoading(true);
    try {
      let response = await fetch("https://f5bwdybhp0.execute-api.ap-south-1.amazonaws.com/dev/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search_query: query,
        }),
      }).then((res) => res.json());
      // let tempResponse = await new Promise((resolve, reject) => {
      //     setTimeout(() => {
      //         resolve({
      //             "one_word_tags": [
      //                 "vitamin-c",
      //                 "milk",
      //                 "honey",
      //                 "cleansing",
      //                 "brightening",
      //                 "face",
      //                 "wash"
      //             ],
      //             "two_word_tags": [
      //                 "vitamin-c",
      //                 "brightening cleanser",
      //                 "milk wash",
      //                 "honey cleanser",
      //                 "face wash",
      //                 "skin radiance",
      //                 "natural cleanser"
      //             ],
      //             "three_word_tags": [
      //                 "vitamin-c face wash",
      //                 "brightening face cleanser",
      //                 "natural skin radiance",
      //                 "milk honey cleanser",
      //                 "daily face wash",
      //                 "sensitive skin cleanser",
      //                 "anti-aging cleanser"
      //             ],
      //             "description": "Elevate your skincare routine with our premium natural face wash, meticulously crafted to deliver unparalleled cleansing and brightening benefits. Infused with the potent power of Vitamin-C-rich fruits, this face wash is a skincare marvel designed to transform your daily cleanse into a luxurious ritual. The addition of milk and curd not only enhances the creamy texture but also provides essential nutrients that soothe and nourish your skin. Honey, known for its natural antibacterial properties, works in harmony with these ingredients to cleanse and purify, leaving your skin feeling refreshed and revitalized. Our unique formulation addresses common skincare concerns such as dullness, uneven skin tone, and the need for deep cleansing without stripping your skin of its natural oils. Experience the luxury of a clean, radiant complexion with every use. Embrace the natural glow and let your skin breathe with our brightening face wash.",
      //             "taglines": [
      //                 "Radiant Clean, Every Day",
      //                 "Nature's Glow in a Bottle",
      //                 "Pure Nourishment, Pure Radiance",
      //                 "Transform Your Cleanse, Transform Your Skin",
      //                 "Clean Beauty, Bright Results",
      //                 "Unlock Your Skin's Natural Glow",
      //                 "Nature's Best, On Your Skin"
      //             ]
      //         });
      //     }, 5000);
      // });
      setOneWordTags(response?.one_word_tags ? response?.one_word_tags : []);
      setTwoWordTags(response?.two_word_tags ? response?.two_word_tags : []);
      setThreeWordTags(response?.three_word_tags ? response?.three_word_tags : []);
      setDescription(response?.description ? response?.description : "Description not available.");
      setTagLines(response?.taglines ? response?.taglines : []);
      setLoading(false);
    } catch (error) {
      setOneWordTags([]);
      setTwoWordTags([]);
      setThreeWordTags([]);
      setDescription("");
      setTagLines([]);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="my-5 flex items-center ">
        <Lucide
          icon="ArrowLeftCircle"
          className="w-10 h-10 cursor-pointer my-5 mx-5"
          onClick={() => {
            navigate("/");
          }}
        />
        <h1 className=" text-2xl text-[#1a3b8b] font-bold ">Elevate SEO</h1>
      </div>
      <div className="flex flex-col overflow-y-auto -mt-4">
        <div
          style={{
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.03)",
          }}
          className="flex-1 bg-white rounded-xl overflow-auto max-h-[400px] w-full border border-gray-100 mt-2"
        >
          <div className="w-full flex flex-col p-6 space-y-6">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SEO query for optimization..."
              className="w-full rounded-lg p-4 h-[180px] border-1 border-gray-200  focus:ring-1 focus:ring-[#1e3b8a] transition-all duration-300 resize-none text-gray-700 placeholder-gray-400 text-sm leading-relaxed"
            />

            <button
              onClick={handleGenerateQuery || loading}
              disabled={query?.length === 0}
              className={`${
                query?.length === 0 || loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-[#1e3b8a] cursor-pointer text-white shadow-lg hover:shadow-xl transform "
              } rounded-sm w-fit px-6 py-3 font-medium transition-all duration-300 ease-in-out focus:outline-none `}
            >
              {loading ? "Processing..." : "Process Query"}
            </button>
          </div>
        </div>
        <Tags loading={loading} oneWordTags={oneWordTags} twoWordTags={twoWordTags} threeWordTags={threeWordTags} />
        <Description loading={loading} description={description} />
        <Tagline loading={loading} tagLines={tagLines} />
      </div>
    </div>
  );
};

export default Main;
