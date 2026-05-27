import { _images } from "@/assets/index";
import { Link, useLocation } from "react-router-dom";

const Logo = ({ className = "" }) => {
    const { pathname } = useLocation();
    const roles = ["/admin", "/instructor", "/user"];
    const path = roles.find(role => pathname.startsWith(role)) || "/";

    return (
        <Link
            className={`w-full flex ${pathname.startsWith("/user")
                ? `justify-start ${className}`
                : "justify-center"
                }`}
            to={path}
        >
            <img
                src={_images.logo}
                alt="logo"
                className="h-12 tablet:h-20 w-auto" // Optional: control size
                loading="lazy" // Improves performance
            />
        </Link>
    );
};

export default Logo;
