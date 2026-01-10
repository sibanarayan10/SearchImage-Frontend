import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../Context/globalContext";
import { useNavigate } from "react-router-dom";

const useApi = (api, method = "get", requestData = null) => {
  const [response, setResponse] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          method: method,
          url: api,
          headers: {
            "Content-Type": "application/json",
          },
          // withCredentials: true,
          validateStatus: function (status) {
            return status > 0;
          },
        };

        if (method !== "get" && requestData) {
          config.data = requestData;
        }

        const apiResponse = await axios(config);

        setResponse(apiResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (api) {
      fetchData();
    }
  }, [api, method]);

  return { response };
};

export default useApi;
