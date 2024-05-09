import React from "react";
import "./login.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";

const Login = () => {

    const [avatar, setAvatar] = useState({file: null,url: ""});
    const [loading, setLoading] = useState(false);

    const handleAvatar = (e) => {
        if(e.target.files[0]){
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const formdata = new FormData(e.target);

        const {email, password} = Object.fromEntries(formdata);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Logged in successfully!");
            
        } catch (error) {
            toast.error(error.message);
            
        }

        setLoading(false);
        


    }

    const handleRegister = async (e) => {
        e.preventDefault();
        const formdata = new FormData(e.target);

        const {username, email, password} = Object.fromEntries(formdata);
        setLoading(true);

        try {

            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imageUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username:username,
                email:email,
                avatar:imageUrl,
                id:res.user.uid,
                blocked:[],

            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats:[]
            });
            toast.success("User created successfully! You Can Login Now!");
            
        } catch (error) {
            toast.error(error.message);
            
        }
        setLoading(false);
    }

    return (
        <div className="login">
            <div className="box">
                <h2>Welcome Back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="password" placeholder="Password" name="password"/>
                    <button type="submit">{loading ? "Loading..." : "Login"}</button>
                </form>
            </div>
            <div className="seperator"></div>
            <div className="box">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an Image</label>

                    <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar} required/>
                    <input type="text" placeholder="Username" name="username" required/>
                    <input type="text" placeholder="Email" name="email" required/>
                    <input type="password" placeholder="Password" name="password" required/>
                    <button>{loading ? "Loading..." : "Register"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;