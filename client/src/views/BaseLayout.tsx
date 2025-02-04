import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function BaseLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.access_token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <Outlet />
    </>
  );
}
