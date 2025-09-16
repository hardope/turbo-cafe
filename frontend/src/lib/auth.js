import { api, apiNoAuth} from "@lib/api"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"

const login = async (email, password, navigate) => {
    await apiNoAuth.post('/auth/login', {
        email,
        password
    })
    .then((response) => {

        localStorage.setItem("ACCESS_TOKEN", response.data.access);
        localStorage.setItem("REFRESH_TOKEN", response.data.refresh);

        const user = response.data.user;
        console.log("User Data:", user);
        localStorage.setItem("USER", JSON.stringify(user));

        if (user.role === "student")
            navigate("/students/dashboard");
        else if (user.role === "vendor")
            navigate("/vendors/dashboard");
        else
            navigate("/");

        toast.success("Login successful!");

        return true;
    })
    .catch((error) => {
        
        toast.error('Invalid credentials. Please try again.');
        return false;
    });
};

const signup = async (userData, onsuccess) => {

    await apiNoAuth.post('/auth/register', userData)
    .then(async (response) => {

        // toast.success("Signup successful! Logging you in...");
        toast.success("Signup successful! Proceed to login.");
     
        onsuccess(); // Call onsuccess callback after successful signup

        return true;
    })
    .catch((error) => {
        toast.error(error.response.data.message || "Signup failed. Please try again.");
        console.error("Error message:", error.response);
        return false;
    });
};


export {
    login,
    signup,
}
