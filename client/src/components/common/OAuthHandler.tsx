import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLazyGetMeQuery } from "../../features/auth/authApiSlice";
import { useAppDispatch } from "../../hooks/redux.hooks";
import { setCredentials } from "../../features/auth/authSlice";
import { toast } from "sonner";

const OAuthHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [triggerGetMe] = useLazyGetMeQuery();

    useEffect(() => {
        const authStatus = searchParams.get("auth");

        if (authStatus === "success") {
            navigate("/", { replace: true });

            triggerGetMe()
                .unwrap()
                .then((res) => {
                    if (res?.user) {
                        dispatch(setCredentials({ user: res.user, accessToken: res.accessToken || "" }));
                        toast.success("Successfully logged in with Google!");
                    }
                })
                .catch(() => toast.error("Google authentication failed."));
        }
    }, [searchParams, triggerGetMe, dispatch, navigate]);

    return null;
};

export default OAuthHandler;