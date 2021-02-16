import axios from "axios";

export default function buildClient({ req }) {
  if (typeof window === "undefined") {
    /** We are on the server */

    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    /** We are in the browser */

    return axios.create({
      baseURL: "/",
    });
  }
}
