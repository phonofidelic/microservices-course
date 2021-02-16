import { useEffect } from "react";
import Router from "next/router";
import useRequest from "../../hooks/useRequest";

export default function signout() {
  const { doRequest } = useRequest({
    url: "/api/users/signout",
    method: "post",
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    doRequest();
  });

  return <div>Signing out...</div>;
}
